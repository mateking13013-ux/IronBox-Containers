#!/usr/bin/env node
/**
 * Enrich every product description in src/data/products.json with richer,
 * category-aware, human-readable HTML content.
 *
 * Strategy: keep each product's original opening paragraph (so genuine,
 * product-specific detail like door styles, reefer model numbers, sizes is
 * preserved) and append a set of rich, tailored sections chosen by the
 * product's category bucket (containers, refrigerated, offices, guard
 * booths/cabins, trailers, drums/totes, pallets).
 *
 * Run: node scrape/enrich_product_descriptions.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'src', 'data', 'products.json');
const PHONE = '+1 816 255 7461';

// --- helpers ---------------------------------------------------------------

const lc = (s) => (s || '').toLowerCase();

function stripTags(html) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

// Pull the first meaningful sentence/paragraph of plain text from the original.
function firstParagraph(html) {
  const matches = [...(html || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  for (const m of matches) {
    const text = stripTags(m[1]);
    if (text.length > 40) return text;
  }
  const all = stripTags(html);
  return all.length > 40 ? all.slice(0, 400) : all;
}

// Remove leftover South-Africa branding and competitor links.
function deSouthAfrica(text) {
  return (text || '')
    .replace(/South African/g, 'American')
    .replace(/South Africa/g, 'the United States')
    // strip any Gumtree (SA classifieds) anchor entirely
    .replace(/<a[^>]*>[^<]*Gumtree[^<]*<\/a>/gi, 'leading marketplaces');
}

function sizeFt(name) {
  const m = name.match(/(\d+)\s*ft/i);
  return m ? m[1] : null;
}

function bucketOf(product) {
  const name = lc(product.name);
  const cat = lc(product.categories?.[0]?.name || '');
  const hay = `${name} ${cat}`;

  if (/(reefer|refriger)/.test(hay)) return 'reefer';
  if (/(office|site office)/.test(hay)) return 'office';
  if (/(guard booth|shack|cabin|house|prefab|pod)/.test(hay)) return 'cabin';
  if (/trailer/.test(hay)) return 'trailer';
  if (/(drum|ibc|tote)/.test(hay)) return 'drum';
  if (/pallet/.test(hay)) return 'pallet';
  return 'container';
}

// --- section builders ------------------------------------------------------

const deliveryBlock = `<h3>Delivery &amp; Support</h3>
<p>We deliver nationwide with experienced drivers who place your unit exactly where you need it. Every order includes a pre-delivery inspection, and our team is on hand to advise on site preparation, access, and placement. Need help choosing the right option? Call our specialists on <a href="tel:+18162557461">${PHONE}</a> and we will walk you through it.</p>`;

const whyBlock = `<h3>Why Choose IronBox Containers</h3>
<p>With years of hands-on experience supplying storage, transport, and modular building solutions, IronBox Containers is trusted by contractors, farmers, businesses, and homeowners alike. Every unit is inspected before it leaves our yard, our pricing is transparent, and our support does not stop at the sale. When you buy from us, you get quality, reliability, and a team that stands behind the product.</p>`;

function ctaBlock(noun) {
  return `<h3>Order Today</h3>
<p>Ready to get started? Add this ${noun} to your cart for fast checkout, or speak to our team on <a href="tel:+18162557461">${PHONE}</a> for volume pricing, custom modifications, and delivery scheduling.</p>`;
}

function specList(rows) {
  return `<h3>Specifications at a Glance</h3>\n<ul>\n${rows
    .map((r) => `<li><strong>${r[0]}:</strong> ${r[1]}</li>`)
    .join('\n')}\n</ul>`;
}

function buildContainer(product, isReefer) {
  const name = product.name;
  const size = sizeFt(name) || '20';
  const isHC = /high cube/i.test(name);
  const isNew = /\bnew\b|one[- ]trip/i.test(name);
  const isUsed = /\bused\b/i.test(name);
  const condition = isNew ? 'New (one-trip)' : isUsed ? 'Used (wind &amp; water tight)' : 'Inspected, cargo-worthy';

  const intro = isReefer
    ? `<p>This ${size}ft refrigerated shipping container (reefer) gives you a fully self-contained cold store that holds precise temperatures anywhere you place it. Built around a heavy-duty steel shell and a powerful integral refrigeration unit, it is ideal for food storage, cold-chain logistics, floral, pharmaceutical, and catering applications.</p>`
    : `<p>This ${size}ft ${isHC ? 'high cube ' : ''}shipping container delivers secure, weather-tight, long-lasting storage that is built to international ISO standards. Whether you need on-site storage, a shipping unit, or a strong base for a conversion project, it offers outstanding strength, security, and value.</p>`;

  const features = isReefer
    ? `<h3>Key Features</h3>
<ul>
<li>Integral refrigeration unit with accurate temperature control (typically -25&deg;C to +25&deg;C)</li>
<li>Stainless steel interior lining that is easy to clean and food-safe</li>
<li>Fully insulated walls, floor, and ceiling for excellent thermal efficiency</li>
<li>T-bar floor for even airflow around your cargo</li>
<li>Lockable, gasket-sealed cargo doors for security and a tight seal</li>
</ul>`
    : `<h3>Key Features</h3>
<ul>
<li>High-grade Corten weathering steel for decades of durability</li>
<li>Wind- and water-tight seals that keep contents dry in any climate</li>
<li>Heavy-duty lockbox and cargo-door locking bars for serious security</li>
<li>Hardwood marine-grade plywood floor rated for heavy loads</li>
<li>Forklift pockets and corner castings for easy handling and stacking</li>
<li>Ready for modification &mdash; offices, workshops, and more</li>
</ul>`;

  const rows = isReefer
    ? [
        ['Nominal size', `${size}ft`],
        ['External height', isHC ? '9ft 6in (high cube)' : "8ft 6in"],
        ['Temperature range', '-25&deg;C to +25&deg;C (unit dependent)'],
        ['Interior', 'Stainless steel, food-grade'],
        ['Condition', condition],
        ['Power', '3-phase electrical supply required'],
      ]
    : [
        ['Length', `${size}ft`],
        ['Width', '8ft'],
        ['Height', isHC ? '9ft 6in (high cube)' : '8ft 6in'],
        ['Capacity', size === '40' ? '~2,390 cu ft' : size === '10' ? '~560 cu ft' : '~1,170 cu ft'],
        ['Construction', 'Corten steel, marine plywood floor'],
        ['Condition', condition],
      ];

  const uses = `<h3>Popular Uses</h3>
<p>${isReefer
    ? 'Cold storage for restaurants and grocers, temporary overflow during peak season, cold-chain transport, floral and pharmaceutical storage, and event catering.'
    : 'On-site equipment and inventory storage, secure tool stores for job sites, agricultural and farm storage, archive and document storage, and the starting point for container offices, workshops, and homes.'}</p>`;

  return [intro, features, specList(rows), uses, deliveryBlock, whyBlock, ctaBlock('container')].join('\n\n');
}

function buildOffice(product) {
  const size = sizeFt(product.name) || '20';
  const intro = `<p>Set up a professional, climate-ready workspace in days with this ${size}ft portable site office. Finished to a high standard inside and engineered to handle tough job-site conditions outside, it is the fast, secure, and cost-effective way to add office space wherever your work takes you.</p>`;
  const features = `<h3>Key Features</h3>
<ul>
<li>Insulated, lined interior with painted walls and durable flooring</li>
<li>Pre-wired electrics with lighting, outlets, and a distribution board</li>
<li>Windows with security bars and a secure personnel door</li>
<li>Tough steel shell that locks up tight and travels well</li>
<li>Ready for HVAC, networking, and furniture packages</li>
</ul>`;
  const rows = [
    ['Size', `${size}ft`],
    ['Interior', 'Insulated and lined, ready to use'],
    ['Electrics', 'Lighting, sockets, and consumer unit fitted'],
    ['Security', 'Lockable door and barred windows'],
    ['Mobility', 'Crane and forklift friendly'],
  ];
  const uses = `<h3>Popular Uses</h3>
<p>Construction site offices, security gatehouses, ticket and welfare cabins, pop-up retail, classrooms, and temporary admin space for events and remote projects.</p>`;
  return [intro, features, specList(rows), uses, deliveryBlock, whyBlock, ctaBlock('office')].join('\n\n');
}

function buildCabin(product) {
  const intro = `<p>This portable cabin is a rugged, ready-to-place building that goes up in a fraction of the time and cost of traditional construction. Built on a strong steel frame with a weatherproof shell, it arrives finished and ready for immediate use as a guard booth, site building, kiosk, or compact living and work space.</p>`;
  const features = `<h3>Key Features</h3>
<ul>
<li>Steel-framed, weatherproof construction built to last</li>
<li>Insulated panels for year-round comfort</li>
<li>Windows and a secure lockable door fitted as standard</li>
<li>Wired for power, lighting, and outlets</li>
<li>Fully relocatable &mdash; lift and move whenever your needs change</li>
</ul>`;
  const rows = [
    ['Construction', 'Steel frame, insulated panels'],
    ['Finish', 'Weatherproof exterior, lined interior'],
    ['Electrics', 'Pre-wired for lights and sockets'],
    ['Security', 'Lockable door, glazed windows'],
    ['Installation', 'Delivered ready to place'],
  ];
  const uses = `<h3>Popular Uses</h3>
<p>Security guard booths, parking and access control points, site offices, ticket kiosks, reception huts, backyard studios, and compact retail units.</p>`;
  return [intro, features, specList(rows), uses, deliveryBlock, whyBlock, ctaBlock('cabin')].join('\n\n');
}

function buildTrailer(product) {
  const name = lc(product.name);
  const kind = /flatbed/.test(name) ? 'flatbed' : /livestock/.test(name) ? 'livestock' : 'utility';
  const intro = `<p>This ${kind} trailer is built for real workloads. With a strong welded frame, dependable running gear, and a practical deck designed for everyday hauling, it gives tradespeople, farmers, and homeowners a tough, road-ready trailer that earns its keep year after year.</p>`;
  const features = `<h3>Key Features</h3>
<ul>
<li>Heavy-duty welded steel frame with a rust-resistant finish</li>
<li>Sealed-bearing axle(s) with reliable road-rated tires</li>
<li>${kind === 'livestock' ? 'Ventilated, slip-resistant livestock-safe sides and gates' : kind === 'flatbed' ? 'Flat, open deck with lashing points for oversized loads' : 'Drop tailgate and stake pockets for easy loading'}</li>
<li>Wired lighting harness compliant with road regulations</li>
<li>Coupler, safety chains, and jack ready to tow</li>
</ul>`;
  const rows = [
    ['Type', `${kind.charAt(0).toUpperCase() + kind.slice(1)} trailer`],
    ['Frame', 'Welded steel, protective coating'],
    ['Running gear', 'Road-rated axle(s) and tires'],
    ['Electrics', 'Full road-legal lighting harness'],
    ['Towing', 'Coupler, chains, and jack included'],
  ];
  const uses = `<h3>Popular Uses</h3>
<p>${kind === 'livestock'
    ? 'Safely transporting cattle, sheep, goats, and other livestock to market, between paddocks, or to the vet.'
    : kind === 'flatbed'
    ? 'Hauling machinery, building materials, pallets, and oversized or awkward loads.'
    : 'General hauling, landscaping and garden waste, moving house, ATV and equipment transport, and tip runs.'}</p>`;
  return [intro, features, specList(rows), uses, deliveryBlock, whyBlock, ctaBlock('trailer')].join('\n\n');
}

function buildDrum(product) {
  const name = lc(product.name);
  const isTote = /ibc|tote/.test(name);
  const intro = isTote
    ? `<p>This IBC tote is a high-capacity intermediate bulk container engineered for the safe storage and transport of liquids. The food-grade HDPE bottle sits inside a galvanized steel cage on a forklift- and pallet-jack-ready base, making bulk handling fast, safe, and efficient.</p>`
    : `<p>This heavy-duty plastic drum is the dependable choice for storing and transporting liquids, powders, and bulk goods. Molded from tough, UV-stabilized polyethylene, it resists impact, corrosion, and a wide range of chemicals &mdash; indoors or out.</p>`;
  const features = isTote
    ? `<h3>Key Features</h3>
<ul>
<li>Food-grade HDPE inner bottle, typically 275&ndash;330 gallon capacity</li>
<li>Galvanized steel cage for structural protection and safe stacking</li>
<li>Integrated pallet base for forklift and pallet-jack handling</li>
<li>Screw-top fill cap and bottom discharge valve</li>
<li>Reusable, recyclable, and easy to clean</li>
</ul>`
    : `<h3>Key Features</h3>
<ul>
<li>Tough, UV-stabilized HDPE that resists impact and corrosion</li>
<li>Leak-resistant sealing lid or bung closures</li>
<li>Stackable design that makes the most of your storage space</li>
<li>Food-safe options available for consumables</li>
<li>Easy to clean, reuse, and recycle</li>
</ul>`;
  const rows = isTote
    ? [
        ['Type', 'IBC tote'],
        ['Capacity', '275&ndash;330 gallons (typical)'],
        ['Inner bottle', 'Food-grade HDPE'],
        ['Cage', 'Galvanized steel'],
        ['Handling', 'Forklift and pallet-jack ready'],
      ]
    : [
        ['Type', 'Plastic drum'],
        ['Material', 'UV-stabilized HDPE'],
        ['Closure', 'Sealing lid / bung'],
        ['Storage', 'Stackable'],
        ['Reusable', 'Yes &mdash; easy to clean and recycle'],
      ];
  const uses = `<h3>Popular Uses</h3>
<p>Water and rainwater storage, bulk liquid and chemical handling, agriculture and irrigation, food and beverage storage, fuel and oil transport, and waste collection.</p>`;
  return [intro, features, specList(rows), uses, deliveryBlock, whyBlock, ctaBlock(isTote ? 'tote' : 'drum')].join('\n\n');
}

function buildPallet(product) {
  const intro = `<p>This plastic pallet is a hygienic, long-life alternative to timber, engineered for warehousing, logistics, and export. Molded from durable polyethylene, it shrugs off moisture, chemicals, and pests while delivering consistent, repeatable performance load after load.</p>`;
  const features = `<h3>Key Features</h3>
<ul>
<li>One-piece molded HDPE/PP &mdash; no nails, splinters, or rot</li>
<li>Hygienic and washable, ideal for food and pharma supply chains</li>
<li>Consistent dimensions for automated handling and racking</li>
<li>Forklift and pallet-jack accessible from multiple sides</li>
<li>Lightweight yet strong, and fully recyclable</li>
</ul>`;
  const rows = [
    ['Material', 'HDPE / polypropylene'],
    ['Hygiene', 'Washable, non-absorbent'],
    ['Entry', 'Multi-way forklift access'],
    ['Use', 'Storage, shipping, and export'],
    ['Lifecycle', 'Reusable and recyclable'],
  ];
  const uses = `<h3>Popular Uses</h3>
<p>Warehouse storage and racking, distribution and freight, export shipping (ISPM-15 exempt), food and pharmaceutical handling, and closed-loop logistics.</p>`;
  return [intro, features, specList(rows), uses, deliveryBlock, whyBlock, ctaBlock('pallet')].join('\n\n');
}

function buildDescription(product) {
  const bucket = bucketOf(product);
  let body;
  switch (bucket) {
    case 'reefer': body = buildContainer(product, true); break;
    case 'office': body = buildOffice(product); break;
    case 'cabin': body = buildCabin(product); break;
    case 'trailer': body = buildTrailer(product); break;
    case 'drum': body = buildDrum(product); break;
    case 'pallet': body = buildPallet(product); break;
    default: body = buildContainer(product, false);
  }

  // Preserve the genuine, product-specific opening line from the original as an
  // "Overview" lead, so unique detail (door styles, model numbers) is not lost.
  const original = firstParagraph(product.description || product.short_description);
  const overview = original && original.length > 40
    ? `<h3>Overview</h3>\n<p>${deSouthAfrica(original)}</p>\n\n`
    : '';

  return deSouthAfrica(overview + body);
}

function buildShort(product, fullDesc) {
  const lead = firstParagraph(product.short_description || fullDesc);
  const text = deSouthAfrica(lead).slice(0, 300).trim();
  return `<p>${text}</p>`;
}

// --- main ------------------------------------------------------------------

const raw = readFileSync(DATA_PATH, 'utf8');
const data = JSON.parse(raw);
const products = Array.isArray(data) ? data : data.products;
if (!Array.isArray(products)) {
  console.error('Could not find a products array in products.json');
  process.exit(1);
}

let count = 0;
const byBucket = {};
for (const product of products) {
  const bucket = bucketOf(product);
  byBucket[bucket] = (byBucket[bucket] || 0) + 1;

  const newDesc = buildDescription(product);
  product.description = newDesc;
  product.short_description = buildShort(product, newDesc);

  if (product.meta_description) {
    product.meta_description = deSouthAfrica(stripTags(newDesc)).slice(0, 158).trim();
  }
  count++;
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Enriched ${count} product descriptions in src/data/products.json`);
console.log('By category bucket:');
for (const [b, n] of Object.entries(byBucket).sort((a, b2) => b2[1] - a[1])) {
  console.log(`  ${b.padEnd(10)} ${n}`);
}
