import 'dotenv/config';

const WP_REST_URL = process.env.WP_REST_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

// Create Basic Auth header
const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

// Fetch products
const response = await fetch(`${WP_REST_URL}/wc/v3/products?per_page=100`, {
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json'
  }
});

if (response.ok) {
  const products = await response.json();
  const totalProducts = response.headers.get('x-wp-total') || products.length;

  console.log(`\n📦 Total Products in WooCommerce: ${totalProducts}\n`);

  if (products.length > 0) {
    console.log('First 10 products:');
    console.log('-'.repeat(50));
    products.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Price: $${product.price || 'N/A'}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Stock: ${product.stock_status}`);
      console.log('-'.repeat(50));
    });
  }
} else {
  console.error('Failed to fetch products:', response.status, response.statusText);
  const text = await response.text();
  console.error('Response:', text);
}
