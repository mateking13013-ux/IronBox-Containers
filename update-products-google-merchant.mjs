import 'dotenv/config';

const WP_REST_URL = process.env.WP_REST_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

// Container type mappings and descriptions
const containerTypes = {
  '10ft': { length: '3.048m', width: '2.438m', height: '2.591m', volume: '19.3m³' },
  '20ft': { length: '6.058m', width: '2.438m', height: '2.591m', volume: '33.2m³' },
  '40ft': { length: '12.192m', width: '2.438m', height: '2.591m', volume: '67.6m³' },
  '40ft HC': { length: '12.192m', width: '2.438m', height: '2.896m', volume: '76.4m³' },
  '20ft HC': { length: '6.058m', width: '2.438m', height: '2.896m', volume: '37.5m³' },
  '10ft HC': { length: '3.048m', width: '2.438m', height: '2.896m', volume: '21.5m³' }
};

// Generate Google Merchant compliant descriptions
function generateDescriptions(product) {
  const name = product.name || '';
  const isUsed = name.toLowerCase().includes('gebraucht') || name.toLowerCase().includes('used');
  const isNew = name.toLowerCase().includes('neu') || name.toLowerCase().includes('new');
  const isHC = name.includes('HC') || name.toLowerCase().includes('high cube');
  const isRefrigerated = name.toLowerCase().includes('kühl') || name.toLowerCase().includes('refrigerated');
  const isOpenTop = name.toLowerCase().includes('open top');
  const isSteelFloor = name.toLowerCase().includes('stahlboden') || name.toLowerCase().includes('steel floor');

  // Determine container size
  let size = '20ft'; // default
  if (name.includes('40ft') || name.includes('40 ft')) size = isHC ? '40ft HC' : '40ft';
  else if (name.includes('20ft') || name.includes('20 ft')) size = isHC ? '20ft HC' : '20ft';
  else if (name.includes('10ft') || name.includes('10 ft')) size = isHC ? '10ft HC' : '10ft';

  const specs = containerTypes[size];
  const condition = isNew ? 'New' : (isUsed ? 'Used' : 'Refurbished');
  const containerType = isRefrigerated ? 'Refrigerated Shipping Container' :
                        isOpenTop ? 'Open Top Shipping Container' :
                        'Standard Shipping Container';

  // Generate clean English title
  let cleanTitle = `${condition} ${size.replace(' HC', '')} ${isHC ? 'High Cube ' : ''}${containerType}`;
  if (isSteelFloor) cleanTitle += ' - Steel Floor';
  if (isRefrigerated) cleanTitle += ' - ISO Certified';

  // Short description (150-160 chars) - Factual only
  let shortDesc = `${condition} ${size} shipping container. `;
  shortDesc += `Dimensions: ${specs.length} x ${specs.width} x ${specs.height}. `;
  shortDesc += `Volume: ${specs.volume}. `;
  if (isRefrigerated) shortDesc += 'Temperature controlled. ';
  if (isSteelFloor) shortDesc += 'Steel floor. ';
  shortDesc += 'ISO/CSC certified.';

  // Medium description (500 chars) - For Google Shopping
  let mediumDesc = `${condition} ${size} shipping container suitable for storage and transportation. `;
  mediumDesc += `External dimensions: ${specs.length} (L) x ${specs.width} (W) x ${specs.height} (H). `;
  mediumDesc += `Storage volume: ${specs.volume}. `;
  mediumDesc += `Features: ${isSteelFloor ? 'heavy-duty steel floor' : 'marine-grade plywood floor'}, `;
  mediumDesc += `ventilation openings, double door locking bars, security lockbox, forklift pockets. `;
  if (isRefrigerated) mediumDesc += `Temperature range: -30°C to +30°C. Cooling unit included. `;
  mediumDesc += `Construction: CORTEN weathering steel, ISO/CSC certified for international shipping. `;
  mediumDesc += `Stackable up to 9 units high when loaded. Wind and watertight seal guaranteed.`;

  // Long description (1000+ chars) - Full details with HTML
  let longDesc = `<h3>Product Details</h3>\n`;
  longDesc += `<p>This ${condition.toLowerCase()} ${size} ${containerType.toLowerCase()} provides secure, weatherproof storage for commercial and industrial applications. Manufactured from CORTEN weathering steel with ISO/CSC certification for international shipping and storage.</p>\n\n`;

  longDesc += `<h3>Specifications</h3>\n`;
  longDesc += `<ul>\n`;
  longDesc += `<li><strong>Container Size:</strong> ${size}</li>\n`;
  longDesc += `<li><strong>Condition:</strong> ${condition}</li>\n`;
  longDesc += `<li><strong>External Dimensions:</strong> ${specs.length} (L) x ${specs.width} (W) x ${specs.height} (H)</li>\n`;
  longDesc += `<li><strong>Internal Volume:</strong> ${specs.volume}</li>\n`;
  longDesc += `<li><strong>Floor Type:</strong> ${isSteelFloor ? 'Steel floor (3mm thickness)' : 'Marine-grade plywood (28mm thickness)'}</li>\n`;
  longDesc += `<li><strong>Maximum Gross Weight:</strong> ${size.includes('40') ? '30,480 kg' : size.includes('20') ? '24,000 kg' : '10,160 kg'}</li>\n`;
  longDesc += `<li><strong>Tare Weight:</strong> ${size.includes('40') ? '3,750 kg' : size.includes('20') ? '2,300 kg' : '1,300 kg'}</li>\n`;
  longDesc += `</ul>\n\n`;

  longDesc += `<h3>Features</h3>\n`;
  longDesc += `<ul>\n`;
  longDesc += `<li>Double door configuration with cam-lock door handles</li>\n`;
  longDesc += `<li>4 corner castings for secure stacking and lifting</li>\n`;
  longDesc += `<li>Forklift pockets for easy handling (${size.includes('20') || size.includes('40') ? 'on 20ft and 40ft models' : 'where applicable'})</li>\n`;
  longDesc += `<li>Ventilation openings to prevent condensation</li>\n`;
  longDesc += `<li>Security lockbox for padlock protection</li>\n`;
  longDesc += `<li>Watertight rubber door seals</li>\n`;
  if (isRefrigerated) {
    longDesc += `<li>Integrated refrigeration unit with digital temperature control</li>\n`;
    longDesc += `<li>Temperature range: -30°C to +30°C</li>\n`;
    longDesc += `<li>Interior aluminum T-floor for hygiene and drainage</li>\n`;
  }
  if (isOpenTop) {
    longDesc += `<li>Removable tarpaulin roof with securing system</li>\n`;
    longDesc += `<li>Roof bows and support structure</li>\n`;
    longDesc += `<li>Cable winch system for tarp operation</li>\n`;
  }
  longDesc += `</ul>\n\n`;

  longDesc += `<h3>Certifications & Standards</h3>\n`;
  longDesc += `<ul>\n`;
  longDesc += `<li>ISO 668:2020 - Series 1 freight containers classification</li>\n`;
  longDesc += `<li>CSC (Container Safety Convention) certified</li>\n`;
  longDesc += `<li>Meets IICL-5 standards for structural integrity</li>\n`;
  longDesc += `<li>Valid CSC plate for international transport</li>\n`;
  longDesc += `</ul>\n\n`;

  longDesc += `<h3>Applications</h3>\n`;
  longDesc += `<ul>\n`;
  longDesc += `<li>On-site storage for construction projects</li>\n`;
  longDesc += `<li>Inventory overflow storage</li>\n`;
  longDesc += `<li>International cargo shipping</li>\n`;
  longDesc += `<li>Temporary or permanent storage facilities</li>\n`;
  longDesc += `<li>Modified container projects (offices, homes, retail)</li>\n`;
  if (isRefrigerated) {
    longDesc += `<li>Cold storage for food and pharmaceuticals</li>\n`;
    longDesc += `<li>Temperature-sensitive goods transport</li>\n`;
  }
  longDesc += `</ul>\n\n`;

  longDesc += `<h3>Delivery Information</h3>\n`;
  longDesc += `<p>Delivery available worldwide. Container can be delivered via truck with crane, side loader, or tilt bed. Site must have level ground and adequate access for delivery vehicle. Delivery charges calculated based on location.</p>`;

  return {
    title: cleanTitle,
    shortDescription: shortDesc.substring(0, 160),
    mediumDescription: mediumDesc.substring(0, 500),
    longDescription: longDesc
  };
}

// Update a single product
async function updateProduct(product) {
  const descriptions = generateDescriptions(product);

  const updateData = {
    name: descriptions.title,
    description: descriptions.longDescription,
    short_description: `<p>${descriptions.mediumDescription}</p>`,
    // Add Google Merchant specific meta if your WooCommerce supports it
    meta_data: [
      { key: '_google_short_description', value: descriptions.shortDescription },
      { key: '_condition', value: product.name.toLowerCase().includes('gebraucht') ? 'used' : 'new' },
      { key: '_brand', value: 'ISO Standard Containers' },
      { key: '_mpn', value: product.sku || `CONT-${product.id}` }
    ]
  };

  try {
    const response = await fetch(`${WP_REST_URL}/wc/v3/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      const updated = await response.json();
      console.log(`✅ Updated: ${updated.name} (ID: ${product.id})`);
      return { success: true, product: updated };
    } else {
      const error = await response.text();
      console.error(`❌ Failed to update ${product.name} (ID: ${product.id}): ${error}`);
      return { success: false, error };
    }
  } catch (error) {
    console.error(`❌ Error updating ${product.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main function to update all products
async function updateAllProducts() {
  console.log('🚀 Starting Google Merchant optimization for all products...\n');

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

  // Update products one by one with delay to avoid rate limiting
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\nProcessing ${i + 1}/${products.length}: ${product.name}`);

    const result = await updateProduct(product);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // Add delay between requests to avoid rate limiting
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully updated: ${successCount} products`);
  console.log(`❌ Failed to update: ${failCount} products`);
  console.log('='.repeat(50));
}

// Run the update
updateAllProducts().catch(console.error);
