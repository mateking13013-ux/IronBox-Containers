import 'dotenv/config';

const WP_REST_URL = process.env.WP_REST_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

async function auditProducts() {
  console.log('🔍 GOOGLE MERCHANT CENTER COMPLIANCE AUDIT\n');
  console.log('=' .repeat(60));

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

  // Track issues
  const issues = {
    missingBrand: [],
    missingGTIN: [],
    missingMPN: [],
    missingCondition: [],
    missingWeight: [],
    missingDimensions: [],
    missingGoogleCategory: [],
    insufficientImages: [],
    shortDescription: [],
    missingShipping: []
  };

  // Audit each product
  products.forEach(product => {
    // Check brand
    if (!product.brands || product.brands.length === 0) {
      issues.missingBrand.push(product.id);
    }

    // Check GTIN (usually in meta_data)
    const hasGTIN = product.meta_data?.some(meta =>
      meta.key === '_gtin' || meta.key === 'gtin' || meta.key === '_ean' || meta.key === '_upc'
    );
    if (!hasGTIN) {
      issues.missingGTIN.push(product.id);
    }

    // Check MPN (using SKU as MPN)
    if (!product.sku) {
      issues.missingMPN.push(product.id);
    }

    // Check condition in meta_data
    const hasCondition = product.meta_data?.some(meta =>
      meta.key === '_condition' || meta.key === 'condition'
    );
    if (!hasCondition) {
      issues.missingCondition.push(product.id);
    }

    // Check weight
    if (!product.weight) {
      issues.missingWeight.push(product.id);
    }

    // Check dimensions
    if (!product.dimensions.length || !product.dimensions.width || !product.dimensions.height) {
      issues.missingDimensions.push(product.id);
    }

    // Check Google Product Category
    const hasGoogleCategory = product.meta_data?.some(meta =>
      meta.key === '_google_product_category' || meta.key === 'google_product_category'
    );
    if (!hasGoogleCategory) {
      issues.missingGoogleCategory.push(product.id);
    }

    // Check images (Google requires at least 1, recommends 3+)
    if (product.images.length < 3) {
      issues.insufficientImages.push({id: product.id, count: product.images.length});
    }

    // Check description length (should be at least 500 chars)
    const descLength = product.description.replace(/<[^>]*>/g, '').length;
    if (descLength < 500) {
      issues.shortDescription.push({id: product.id, length: descLength});
    }

    // Check shipping class
    if (!product.shipping_class) {
      issues.missingShipping.push(product.id);
    }
  });

  // Generate report
  console.log('\n📊 AUDIT SUMMARY FOR ' + products.length + ' PRODUCTS\n');
  console.log('=' .repeat(60));

  console.log('\n❌ CRITICAL ISSUES (Will cause feed rejection):\n');

  console.log(`1. MISSING BRAND: ${issues.missingBrand.length}/${products.length} products`);
  if (issues.missingBrand.length > 0) {
    console.log('   → Required for all products. Add brand name or "Generic" if unbranded');
  }

  console.log(`\n2. MISSING GTIN/EAN/UPC: ${issues.missingGTIN.length}/${products.length} products`);
  if (issues.missingGTIN.length === products.length) {
    console.log('   → Required for products with known GTINs');
    console.log('   → For custom/handmade items, use MPN instead');
  }

  console.log(`\n3. MISSING MPN: ${issues.missingMPN.length}/${products.length} products`);
  if (issues.missingMPN.length > 0) {
    console.log('   → Required when GTIN is not available');
    console.log('   → Currently using SKU: ' + products.filter(p => p.sku).length + ' products have SKU');
  }

  console.log(`\n4. MISSING CONDITION: ${issues.missingCondition.length}/${products.length} products`);
  if (issues.missingCondition.length > 0) {
    console.log('   → Required: must specify new/used/refurbished');
    console.log('   → This is CRITICAL for Google Merchant');
  }

  console.log(`\n5. MISSING GOOGLE CATEGORY: ${issues.missingGoogleCategory.length}/${products.length} products`);
  if (issues.missingGoogleCategory.length > 0) {
    console.log('   → Required: Google Product Category taxonomy');
    console.log('   → Suggested: "Business & Industrial > Material Handling > Containers"');
  }

  console.log('\n⚠️  IMPORTANT ISSUES (May affect performance):\n');

  console.log(`6. MISSING WEIGHT: ${issues.missingWeight.length}/${products.length} products`);
  if (issues.missingWeight.length > 0) {
    console.log('   → Required for shipping calculations');
  }

  console.log(`\n7. MISSING DIMENSIONS: ${issues.missingDimensions.length}/${products.length} products`);
  if (issues.missingDimensions.length > 0) {
    console.log('   → Required for accurate shipping rates');
  }

  console.log(`\n8. INSUFFICIENT IMAGES: ${issues.insufficientImages.length}/${products.length} products`);
  issues.insufficientImages.forEach(item => {
    if (item.count === 0) {
      console.log(`   → Product ${item.id}: NO IMAGES (minimum 1 required)`);
    } else if (item.count < 3) {
      console.log(`   → Product ${item.id}: Only ${item.count} image(s) (3+ recommended)`);
    }
  });

  console.log(`\n9. SHORT DESCRIPTIONS: ${issues.shortDescription.length}/${products.length} products`);
  if (issues.shortDescription.length > 0) {
    console.log('   → Descriptions under 500 chars may underperform');
  }

  console.log(`\n10. MISSING SHIPPING CLASS: ${issues.missingShipping.length}/${products.length} products`);
  if (issues.missingShipping.length > 0) {
    console.log('   → Affects shipping rate calculations');
  }

  // Sample product details
  console.log('\n' + '=' .repeat(60));
  console.log('📋 SAMPLE PRODUCT ANALYSIS (ID: ' + products[0].id + ')');
  console.log('=' .repeat(60));
  const sample = products[0];
  console.log('Product: ' + sample.name);
  console.log('\nCurrent Data:');
  console.log('  ✅ Title: ' + (sample.name ? 'Yes' : 'No'));
  console.log('  ✅ Description: ' + (sample.description ? 'Yes' : 'No') + ' (' + sample.description.replace(/<[^>]*>/g, '').length + ' chars)');
  console.log('  ✅ Price: $' + sample.price);
  console.log('  ✅ Images: ' + sample.images.length);
  console.log('  ✅ SKU: ' + (sample.sku || 'MISSING'));
  console.log('  ❌ Brand: ' + (sample.brands?.length > 0 ? sample.brands[0].name : 'MISSING'));
  console.log('  ❌ GTIN: MISSING');
  console.log('  ❌ Condition: MISSING');
  console.log('  ❌ Google Category: MISSING');
  console.log('  ⚠️  Weight: ' + (sample.weight || 'MISSING'));
  console.log('  ⚠️  Dimensions: ' + (sample.dimensions.length ? 'Partial' : 'MISSING'));

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 RECOMMENDED ACTIONS:');
  console.log('=' .repeat(60));
  console.log('\n1. ADD BRAND (Critical):');
  console.log('   - Add "ISO Containers" or actual manufacturer as brand');
  console.log('\n2. ADD CONDITION (Critical):');
  console.log('   - Set condition based on product name (new/used/refurbished)');
  console.log('\n3. ADD GOOGLE PRODUCT CATEGORY (Critical):');
  console.log('   - Use: "632" (Business & Industrial > Material Handling)');
  console.log('\n4. ADD IDENTIFIERS:');
  console.log('   - Use SKU as MPN if no GTIN available');
  console.log('   - Set identifier_exists = false if no GTIN');
  console.log('\n5. ADD SHIPPING DETAILS:');
  console.log('   - Weight: Add actual container weights');
  console.log('   - Dimensions: Add L x W x H for each container');
  console.log('\n6. ADD MORE IMAGES:');
  console.log('   - Upload 3-8 images per product');
  console.log('   - Show different angles, interior, doors');
}

// Run audit
auditProducts().catch(console.error);
