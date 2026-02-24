import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Read CSV
const csvContent = fs.readFileSync(path.join(ROOT, 'conex_woocommerce.csv'), 'utf-8');

// Parse CSV (handles multiline quoted fields)
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  relax_quotes: true,
  trim: true,
});

console.log(`Parsed ${records.length} products from CSV`);

// --- Category extraction ---
const categoryMap = new Map();
let categoryIdCounter = 1;

for (const row of records) {
  const catName = (row['Categories'] || '').trim();
  if (catName && !categoryMap.has(catName)) {
    categoryMap.set(catName, {
      id: categoryIdCounter++,
      name: catName,
      slug: slugifyCategory(catName),
      description: '',
      count: 0,
      image: null,
    });
  }
}

function slugifyCategory(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function slugifyProduct(sku, name) {
  const source = sku && sku !== 'N/A' ? sku : name;
  return source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Build products ---
const products = [];
const usedSlugs = new Set();
let productId = 1;

for (const row of records) {
  const name = (row['Name'] || '').trim();
  const sku = (row['SKU'] || '').trim();

  if (!name) continue;

  // Generate unique slug
  let slug = slugifyProduct(sku, name);
  if (usedSlugs.has(slug)) {
    slug = slug + '-' + productId;
  }
  usedSlugs.add(slug);

  // Category
  const catName = (row['Categories'] || '').trim();
  const category = categoryMap.get(catName);
  const categories = category ? [{ id: category.id, name: category.name, slug: category.slug }] : [];
  if (category) category.count++;

  // Images — parse comma-separated URLs
  const imagesRaw = (row['Images'] || '').trim();
  const imageUrls = imagesRaw
    ? imagesRaw.split(/,\s*/).map(u => u.trim()).filter(u => u.startsWith('http'))
    : [];

  const images = imageUrls.map((url, idx) => {
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const localPath = `/images/products/${slug}/${idx + 1}${ext}`;
    return {
      id: idx + 1,
      src: localPath,
      name: path.basename(new URL(url).pathname),
      alt: name,
      original_url: url,
    };
  });

  // Set category image to first product's first image
  if (category && !category.image && images.length > 0) {
    category.image = { src: images[0].src };
  }

  // Prices
  const regularPrice = (row['Regular price'] || '').trim();
  const salePrice = (row['Sale price'] || '').trim();
  const effectivePrice = salePrice || regularPrice;

  // Short description - clean up
  const shortDesc = (row['Short description'] || '').trim();
  const description = (row['Description'] || '').trim();

  const product = {
    id: productId,
    name: name,
    slug: slug,
    type: 'simple',
    status: row['Published'] === '1' ? 'publish' : 'draft',
    featured: row['Is featured?'] === '1',
    description: description,
    short_description: shortDesc,
    sku: sku,
    price: effectivePrice,
    regular_price: regularPrice,
    sale_price: salePrice,
    stock_status: row['In stock?'] === '1' ? 'instock' : 'outofstock',
    in_stock: row['In stock?'] === '1',
    weight: (row['Weight (kg)'] || '').trim(),
    dimensions: {
      length: (row['Length (cm)'] || '').trim(),
      width: (row['Width (cm)'] || '').trim(),
      height: (row['Height (cm)'] || '').trim(),
    },
    shipping_class: (row['Shipping class'] || '').trim(),
    categories: categories,
    tags: [],
    images: images,
    meta_title: (row['Meta: _yoast_wpseo_title'] || '').trim(),
    meta_description: (row['Meta: _yoast_wpseo_metadesc'] || '').trim(),
  };

  products.push(product);
  productId++;
}

// Build categories array
const categoriesArray = Array.from(categoryMap.values());

// Write products.json
const productsPath = path.join(ROOT, 'src', 'data', 'products.json');
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`Wrote ${products.length} products to ${productsPath}`);

// Write categories.json
const categoriesPath = path.join(ROOT, 'src', 'data', 'categories.json');
fs.writeFileSync(categoriesPath, JSON.stringify(categoriesArray, null, 2));
console.log(`Wrote ${categoriesArray.length} categories to ${categoriesPath}`);

// Summary
console.log('\n--- Summary ---');
console.log(`Products: ${products.length}`);
console.log(`Categories: ${categoriesArray.length}`);
categoriesArray.forEach(c => console.log(`  ${c.name} (${c.slug}): ${c.count} products`));
const totalImages = products.reduce((sum, p) => sum + p.images.length, 0);
console.log(`Total images: ${totalImages}`);
const withSale = products.filter(p => p.sale_price).length;
console.log(`Products with sale price: ${withSale}`);
