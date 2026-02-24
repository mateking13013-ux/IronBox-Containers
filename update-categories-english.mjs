import 'dotenv/config';

const WP_REST_URL = process.env.WP_REST_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

// Category translations
const categoryTranslations = {
  '10-Fuß-Container': { name: '10ft Containers', slug: '10ft-containers' },
  '16-Fuß-Container': { name: '16ft Containers', slug: '16ft-containers' },
  '20-Fuß-Container': { name: '20ft Containers', slug: '20ft-containers' },
  '24-Fuß-Container': { name: '24ft Containers', slug: '24ft-containers' },
  '30-Fuß-Container': { name: '30ft Containers', slug: '30ft-containers' },
  '40-Fuß-Container': { name: '40ft Containers', slug: '40ft-containers' },
  'Kühlcontainer': { name: 'Refrigerated Containers', slug: 'refrigerated-containers' },
  'Lager container': { name: 'Storage Containers', slug: 'storage-containers' },
  'Modifizierte Container': { name: 'Modified Containers', slug: 'modified-containers' },
  'Offener Seitencontainer': { name: 'Open Side Containers', slug: 'open-side-containers' }
};

async function updateCategories() {
  console.log('🚀 Translating product categories to English...\n');

  // Fetch all categories
  const response = await fetch(`${WP_REST_URL}/wc/v3/products/categories?per_page=100`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch categories');
    return;
  }

  const categories = await response.json();
  console.log(`📦 Found ${categories.length} categories to check\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const category of categories) {
    // Skip Uncategorized
    if (category.slug === 'uncategorized') {
      console.log(`⏭️  Skipping: ${category.name} (system category)`);
      skipCount++;
      continue;
    }

    // Find translation
    const translation = categoryTranslations[category.name];

    if (!translation) {
      console.log(`⏭️  Skipping: ${category.name} (already in English or no translation needed)`);
      skipCount++;
      continue;
    }

    // Update category
    try {
      const updateResponse = await fetch(`${WP_REST_URL}/wc/v3/products/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: translation.name,
          slug: translation.slug
        })
      });

      if (updateResponse.ok) {
        const updated = await updateResponse.json();
        console.log(`✅ Updated: "${category.name}" → "${updated.name}" (slug: ${updated.slug})`);
        successCount++;
      } else {
        const error = await updateResponse.text();
        console.error(`❌ Failed to update "${category.name}": ${error}`);
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating "${category.name}": ${error.message}`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully updated: ${successCount} categories`);
  console.log(`⏭️  Skipped: ${skipCount} categories`);
  console.log(`❌ Failed: ${failCount} categories`);
  console.log('='.repeat(50));

  // Show final state
  console.log('\n📋 Final category list:');
  const finalResponse = await fetch(`${WP_REST_URL}/wc/v3/products/categories?per_page=100`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  if (finalResponse.ok) {
    const finalCategories = await finalResponse.json();
    for (const cat of finalCategories) {
      console.log(`  • ${cat.name} (${cat.slug})`);
    }
  }
}

// Run the update
updateCategories().catch(console.error);
