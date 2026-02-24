import 'dotenv/config';

const WP_REST_URL = process.env.WP_REST_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

// Container specifications
const containerSpecs = {
  '10ft': { dims: '3.048m × 2.438m × 2.591m', volume: '19.3m³', maxWeight: '10,160kg' },
  '10ft HC': { dims: '3.048m × 2.438m × 2.896m', volume: '21.5m³', maxWeight: '10,160kg' },
  '20ft': { dims: '6.058m × 2.438m × 2.591m', volume: '33.2m³', maxWeight: '24,000kg' },
  '20ft HC': { dims: '6.058m × 2.438m × 2.896m', volume: '37.5m³', maxWeight: '24,000kg' },
  '40ft': { dims: '12.192m × 2.438m × 2.591m', volume: '67.6m³', maxWeight: '30,480kg' },
  '40ft HC': { dims: '12.192m × 2.438m × 2.896m', volume: '76.4m³', maxWeight: '30,480kg' }
};

function generateBulletDescription(product) {
  const name = product.name || '';

  // Determine condition
  let condition = 'Refurbished';
  if (name.toLowerCase().includes('new ')) condition = 'New';
  else if (name.toLowerCase().includes('used ')) condition = 'Used';

  // Determine size
  let sizeKey = '20ft';
  let displaySize = '20ft Standard';

  if (name.includes('40ft') || name.includes('40 ft')) {
    sizeKey = name.includes('High Cube') ? '40ft HC' : '40ft';
    displaySize = name.includes('High Cube') ? '40ft High Cube' : '40ft Standard';
  } else if (name.includes('10ft') || name.includes('10 ft')) {
    sizeKey = name.includes('High Cube') ? '10ft HC' : '10ft';
    displaySize = name.includes('High Cube') ? '10ft High Cube' : '10ft Standard';
  } else if (name.includes('20ft') || name.includes('20 ft')) {
    sizeKey = name.includes('High Cube') ? '20ft HC' : '20ft';
    displaySize = name.includes('High Cube') ? '20ft High Cube' : '20ft Standard';
  }

  // Check for special types
  const isRefrigerated = name.includes('Refrigerated');
  const isOpenTop = name.includes('Open Top');
  const isSteelFloor = name.includes('Steel Floor');
  const isOpenSide = name.includes('Open Side');

  // Get specs
  const specs = containerSpecs[sizeKey] || containerSpecs['20ft'];

  // Build features list
  let features = [];
  if (isSteelFloor) features.push('Steel floor');
  else features.push('Plywood floor');

  if (isRefrigerated) {
    features.push('Temperature control (-30°C to +30°C)');
    features.push('Refrigeration unit');
  } else if (isOpenTop) {
    features.push('Removable tarp roof');
    features.push('Top loading access');
  } else if (isOpenSide) {
    features.push('Side door access');
  }

  features.push('Lockbox');
  features.push('Ventilation');

  if (!sizeKey.includes('10ft')) {
    features.push('Forklift pockets');
  }

  // Generate bullet point description
  let bullets = [];

  // Line 1: Size and type
  let containerType = 'Container';
  if (isRefrigerated) containerType = 'Reefer Container';
  else if (isOpenTop) containerType = 'Open Top Container';
  else if (isOpenSide) containerType = 'Open Side Container';

  bullets.push(`• Size: ${displaySize} ${containerType}`);
  bullets.push(`• Dimensions: ${specs.dims}`);
  bullets.push(`• Volume: ${specs.volume} storage capacity`);
  bullets.push(`• Condition: ${condition}`);
  bullets.push(`• Features: ${features.slice(0, 3).join(', ')}`);
  bullets.push(`• Certification: ISO/CSC approved`);
  bullets.push(`• Max Load: ${specs.maxWeight} | Stackable | Weatherproof`);

  return bullets.join('\n');
}

async function updateAllShortDescriptions() {
  console.log('🚀 Updating all product short descriptions with bullet format...\n');

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
  let failCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`Processing ${i + 1}/${products.length}: ${product.name}`);

    // Generate new bullet description
    const bulletDescription = generateBulletDescription(product);

    // Wrap in HTML for WooCommerce
    const htmlDescription = '<div class="product-specs">\n' +
      bulletDescription.split('\n').map(line => `<p>${line}</p>`).join('\n') +
      '\n</div>';

    try {
      const updateResponse = await fetch(`${WP_REST_URL}/wc/v3/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          short_description: htmlDescription
        })
      });

      if (updateResponse.ok) {
        console.log(`✅ Updated short description`);
        successCount++;
      } else {
        const error = await updateResponse.text();
        console.error(`❌ Failed: ${error}`);
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully updated: ${successCount} products`);
  console.log(`❌ Failed: ${failCount} products`);
  console.log('='.repeat(50));

  // Show sample of updated descriptions
  console.log('\n📋 Sample updated short description:');
  const sampleResponse = await fetch(`${WP_REST_URL}/wc/v3/products/${products[0].id}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  if (sampleResponse.ok) {
    const sample = await sampleResponse.json();
    console.log('\nProduct: ' + sample.name);
    console.log('Short Description:');
    console.log(sample.short_description.replace(/<[^>]*>/g, ''));
  }
}

// Run the update
updateAllShortDescriptions().catch(console.error);
