import 'dotenv/config';

const WP_REST_URL = process.env.WP_REST_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

// Generate clean slug from product name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single
}

async function updateAllSlugs() {
  console.log('🚀 Updating all product permalinks to match English titles...\n');

  // Fetch all products
  const response = await fetch(`${WP_REST_URL}/wc/v3/products?per_page=100`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch products');
    return;
  }

  const products = await response.json();
  console.log(`📦 Found ${products.length} products to update\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const newSlug = generateSlug(product.name);

    // Check if slug needs updating
    if (product.slug === newSlug) {
      console.log(`⏭️  ${i+1}/${products.length}: "${product.name}" - slug already correct`);
      skipCount++;
      continue;
    }

    console.log(`📝 ${i+1}/${products.length}: Updating "${product.name}"`);
    console.log(`   Old slug: ${product.slug}`);
    console.log(`   New slug: ${newSlug}`);

    try {
      const updateResponse = await fetch(`${WP_REST_URL}/wc/v3/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slug: newSlug
        })
      });

      if (updateResponse.ok) {
        const updated = await updateResponse.json();
        console.log(`   ✅ Updated: ${updated.permalink}\n`);
        successCount++;
      } else {
        const error = await updateResponse.text();
        console.error(`   ❌ Failed: ${error}\n`);
        failCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully updated: ${successCount} product slugs`);
  console.log(`⏭️  Already correct: ${skipCount} product slugs`);
  console.log(`❌ Failed: ${failCount} product slugs`);
  console.log('='.repeat(60));

  // Show sample of updated URLs
  console.log('\n📋 Sample of updated product URLs:');
  const finalResponse = await fetch(`${WP_REST_URL}/wc/v3/products?per_page=10`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  if (finalResponse.ok) {
    const samples = await finalResponse.json();
    for (const product of samples) {
      console.log(`  • ${product.permalink}`);
    }
  }
}

// Run the update
updateAllSlugs().catch(console.error);
