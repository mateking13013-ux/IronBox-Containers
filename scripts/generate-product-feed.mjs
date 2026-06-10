#!/usr/bin/env node
/**
 * Generate a Google Merchant Center product feed (RSS 2.0 + g: namespace)
 * from src/data/products.json and write it to public/product-feed.xml so it
 * is served at https://ironboxcontainers.com/product-feed.xml
 *
 * Run: node scripts/generate-product-feed.mjs
 *
 * Google spec: https://support.google.com/merchants/answer/7052112
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'src', 'data', 'products.json');
const OUT_PATH = join(ROOT, 'public', 'product-feed.xml');

const SITE_URL = 'https://ironboxcontainers.com';
const BRAND = 'IronBox Containers';
const CURRENCY = 'USD';
const FEED_TITLE = 'IronBox Containers — Product Feed';
const FEED_DESC = 'Shipping containers, trailers, portable cabins, drums and pallets from IronBox Containers.';

// --- helpers ---------------------------------------------------------------

const lc = (s) => (s || '').toLowerCase();

function xmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripTags(html) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&deg;/g, '°')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

function absUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith('/') ? '' : '/') + path;
}

// Google condition must be one of: new | used | refurbished
function conditionOf(product) {
  const name = lc(product.name);
  if (/\bnew\b|one[- ]trip/.test(name)) return 'new';
  if (/\bused\b/.test(name)) return 'used';
  if (/refurb/.test(name)) return 'refurbished';
  return 'used'; // conservative default for pre-owned stock
}

// Map to a safe (non-leaf is allowed) Google product category + product_type
function categoryOf(product) {
  const hay = `${lc(product.name)} ${lc(product.categories?.[0]?.name || '')}`;
  const productType = product.categories?.[0]?.name || 'Containers';
  let google = 'Business & Industrial';
  if (/trailer/.test(hay)) google = 'Vehicles & Parts > Vehicles > Motor Vehicles';
  else if (/pallet/.test(hay)) google = 'Business & Industrial > Material Handling > Pallets & Loading Equipment';
  else if (/drum|ibc|tote/.test(hay)) google = 'Business & Industrial > Material Handling > Barrels & Drums';
  return { google, productType };
}

function priceTag(value) {
  const n = parseFloat(value);
  if (!isFinite(n) || n <= 0) return null;
  return `${n.toFixed(2)} ${CURRENCY}`;
}

// --- build -----------------------------------------------------------------

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const products = Array.isArray(data) ? data : data.products;

const items = [];
const skipped = [];

for (const p of products) {
  const price = priceTag(p.price || p.regular_price);
  if (!price) {
    skipped.push({ sku: p.sku, name: p.name, reason: 'no/zero price' });
    continue;
  }
  const images = (p.images || []).map((img) => absUrl(img.src)).filter(Boolean);
  if (!images.length) {
    skipped.push({ sku: p.sku, name: p.name, reason: 'no image' });
    continue;
  }

  const link = `${SITE_URL}/products/${p.slug}`;
  const title = (p.name || '').slice(0, 150);
  const desc = stripTags(p.short_description || p.description).slice(0, 4900) ||
    `${p.name} available from ${BRAND}.`;
  const availability = p.stock_status === 'instock' ? 'in_stock' : 'out_of_stock';
  const condition = conditionOf(p);
  const { google, productType } = categoryOf(p);
  const sale = priceTag(p.sale_price);

  const lines = [];
  lines.push(`    <item>`);
  lines.push(`      <g:id>${xmlEscape(p.sku || p.id)}</g:id>`);
  lines.push(`      <g:title>${xmlEscape(title)}</g:title>`);
  lines.push(`      <g:description>${xmlEscape(desc)}</g:description>`);
  lines.push(`      <g:link>${xmlEscape(link)}</g:link>`);
  lines.push(`      <g:image_link>${xmlEscape(images[0])}</g:image_link>`);
  for (const extra of images.slice(1, 11)) {
    lines.push(`      <g:additional_image_link>${xmlEscape(extra)}</g:additional_image_link>`);
  }
  lines.push(`      <g:availability>${availability}</g:availability>`);
  lines.push(`      <g:price>${xmlEscape(price)}</g:price>`);
  if (sale && sale !== price) lines.push(`      <g:sale_price>${xmlEscape(sale)}</g:sale_price>`);
  lines.push(`      <g:condition>${condition}</g:condition>`);
  lines.push(`      <g:brand>${xmlEscape(BRAND)}</g:brand>`);
  lines.push(`      <g:mpn>${xmlEscape(p.sku || p.id)}</g:mpn>`);
  lines.push(`      <g:identifier_exists>no</g:identifier_exists>`);
  lines.push(`      <g:google_product_category>${xmlEscape(google)}</g:google_product_category>`);
  lines.push(`      <g:product_type>${xmlEscape(productType)}</g:product_type>`);
  // Shipping is freight/quote-based; weight unknown. Account-level shipping in
  // Merchant Center covers this — we still declare the destination country.
  lines.push(`      <g:shipping>`);
  lines.push(`        <g:country>US</g:country>`);
  lines.push(`        <g:service>Freight</g:service>`);
  lines.push(`        <g:price>0.00 ${CURRENCY}</g:price>`);
  lines.push(`      </g:shipping>`);
  lines.push(`    </item>`);
  items.push(lines.join('\n'));
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xmlEscape(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${xmlEscape(FEED_DESC)}</description>
${items.join('\n')}
  </channel>
</rss>
`;

writeFileSync(OUT_PATH, xml, 'utf8');

console.log(`Wrote ${items.length} items to public/product-feed.xml`);
console.log(`Feed URL: ${SITE_URL}/product-feed.xml`);
if (skipped.length) {
  console.log(`\nSkipped ${skipped.length} product(s) (fix these to include them):`);
  for (const s of skipped) console.log(`  - ${s.sku || '(no sku)'}: ${s.name} — ${s.reason}`);
}
