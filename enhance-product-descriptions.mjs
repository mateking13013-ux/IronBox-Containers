import fetch from 'node-fetch';

const WP_REST_URL = 'https://cms.nunestinyhomes.com/wp-json';
const WC_CONSUMER_KEY = 'ck_86754cd3c8be9983b57983a0e8e7b995ce335c9b';
const WC_CONSUMER_SECRET = 'cs_447a4a730c11bc23d2e1b0cceff663c32a6411ea';

const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

function generateDetailedDescription(product) {
  const name = product.name;
  const category = product.categories?.[0]?.name || 'Container';
  const slug = product.slug;

  // Parse size from name
  const sizeMatch = name.match(/(\d+)ft/);
  const size = sizeMatch ? sizeMatch[1] : '20';
  const isHighCube = name.toLowerCase().includes('high cube');
  const isRefurbished = name.toLowerCase().includes('refurbished');
  const isNew = name.toLowerCase().includes('new');
  const isUsed = name.toLowerCase().includes('used');
  const isInsulated = name.toLowerCase().includes('insulated');
  const isOffice = name.toLowerCase().includes('office');
  const isDangerousGoods = name.toLowerCase().includes('dangerous goods');

  let condition = 'Used';
  if (isNew) condition = 'New';
  else if (isRefurbished) condition = 'Refurbished';

  // Build comprehensive description based on product type
  let description = '';

  // Opening paragraph
  if (category.includes('Swimming Pool')) {
    description = `<p>Transform your backyard into a luxury resort with this ${size}ft shipping container swimming pool. This innovative pool solution combines industrial durability with modern design, offering a unique and sustainable alternative to traditional swimming pools. Built from a genuine shipping container, this pool provides exceptional strength and longevity while making a bold architectural statement.</p>

<h3>Premium Pool Features</h3>
<p>Our container pools are engineered for excellence, featuring a reinforced steel structure that's been professionally modified and sealed for permanent water retention. The interior is lined with a marine-grade coating system that's both beautiful and durable, ensuring years of trouble-free enjoyment. The pool includes integrated plumbing systems, customizable lighting options, and can be equipped with heating systems for year-round use.</p>

<h3>Installation & Setup</h3>
<p>One of the biggest advantages of a container pool is the rapid installation process. Unlike traditional pools that can take weeks or months to install, your container pool can be operational within days. The pool arrives pre-fabricated and ready to place, requiring only basic site preparation, connection to utilities, and filling with water. This minimizes disruption to your property and gets you swimming faster.</p>

<h3>Customization Options</h3>
<p>Every container pool can be customized to match your vision. Choose from various interior finishes including tiles, fiberglass, or vinyl liners. Add features like integrated spa jets, LED lighting systems, automatic covers, or glass viewing panels. The exterior can be painted in any color or clad with materials like wood or composite decking to complement your landscape design.</p>

<h3>Sustainability & Efficiency</h3>
<p>By repurposing shipping containers, these pools represent an eco-friendly choice that reduces waste and environmental impact. The compact design requires less water than traditional pools, and the excellent insulation properties of the steel structure help maintain water temperature more efficiently, reducing heating costs.</p>`;

  } else if (category.includes('Tiny Home') || category.includes('Prefab')) {
    description = `<p>Experience modern minimalist living with this ${size}ft prefabricated tiny home built from a converted shipping container. This innovative housing solution offers an affordable, sustainable, and stylish alternative to traditional homes, perfect for those seeking to downsize, create a guest house, or establish an off-grid retreat.</p>

<h3>Thoughtful Living Design</h3>
<p>Despite its compact footprint, this container home maximizes every square foot through intelligent design. The open-concept layout creates a sense of spaciousness, while large windows and glass doors flood the interior with natural light. High ceilings and strategic placement of mirrors further enhance the feeling of roominess. Built-in storage solutions and multi-functional furniture ensure you have everything you need without clutter.</p>

<h3>Quality Construction</h3>
<p>Starting with a structurally sound shipping container, we transform it into a comfortable living space using premium materials and professional craftsmanship. The steel structure provides exceptional durability and weather resistance, while proper insulation ensures year-round comfort. All electrical and plumbing systems are installed to residential building codes, ensuring safety and reliability.</p>

<h3>Modern Amenities</h3>
<p>This tiny home comes equipped with all the amenities of a traditional house. The kitchen features full-size appliances, custom cabinetry, and stone countertops. The bathroom includes a standard flush toilet, shower with glass doors, and vanity with storage. Climate control is handled by an efficient mini-split HVAC system, and LED lighting throughout reduces energy consumption.</p>

<h3>Sustainable Living</h3>
<p>Container homes represent the future of sustainable housing. By repurposing shipping containers, we reduce waste and minimize the environmental impact of new construction. These homes can be equipped with solar panels, rainwater collection systems, and composting toilets for off-grid capability. The excellent insulation and thermal mass of the steel structure contribute to energy efficiency.</p>`;

  } else if (category.includes('Restroom') || category.includes('Bathroom')) {
    description = `<p>Provide premium sanitation facilities for any event or job site with this ${size}ft portable restroom container. This commercial-grade facility offers a clean, comfortable, and dignified restroom experience that far exceeds standard portable toilets. Perfect for construction sites, outdoor events, parks, and emergency response situations.</p>

<h3>Superior Facilities</h3>
<p>This restroom container features multiple private stalls with full-flush toilets, hand-washing stations with running water, and proper ventilation systems. The interior is finished with durable, easy-to-clean materials including non-slip flooring, moisture-resistant walls, and stainless steel fixtures. Bright LED lighting and climate control ensure comfort in any weather condition.</p>

<h3>Hygiene & Maintenance</h3>
<p>Designed for high-traffic use, these restroom units feature hands-free fixtures where possible, including automatic faucets and soap dispensers. The waste management system can be connected to existing sewer lines or utilize a self-contained holding tank system. Easy-access service panels allow for quick maintenance and cleaning, ensuring facilities remain pristine.</p>

<h3>ADA Compliance</h3>
<p>Our restroom containers meet or exceed ADA accessibility requirements, featuring wide doorways, grab bars, and spacious interiors that accommodate wheelchairs. This ensures your facility serves all users with dignity and complies with legal requirements for public accommodations.</p>

<h3>Versatile Applications</h3>
<p>These units are ideal for long-term placement at construction sites, parks, beaches, or event venues. They can also serve as emergency facilities during natural disasters or infrastructure repairs. The robust construction withstands heavy use and weather extremes, providing reliable service for years.</p>`;

  } else if (isOffice) {
    description = `<p>Create an instant professional workspace with this ${size}ft office container. This mobile office solution provides a comfortable, secure, and fully-equipped work environment that can be deployed anywhere. Perfect for construction sites, temporary facilities, remote locations, or as additional office space for growing businesses.</p>

<h3>Professional Interior</h3>
<p>Step inside to find a complete office environment featuring commercial-grade finishes. The interior includes insulated walls with painted drywall, drop ceilings with integrated lighting, commercial carpeting or vinyl flooring, and multiple electrical outlets for all your equipment. Large windows provide natural light and views, while the door features commercial-grade locks for security.</p>

<h3>Climate Controlled Comfort</h3>
<p>Work comfortably year-round with integrated HVAC systems that maintain ideal temperature and humidity levels. The superior insulation of our office containers ensures energy efficiency while reducing outside noise. This creates a quiet, comfortable environment conducive to productivity, regardless of external conditions.</p>

<h3>Technology Ready</h3>
<p>Modern businesses require modern infrastructure. Our office containers come pre-wired for internet and phone connections, with cable management systems to keep wiring organized. Optional upgrades include built-in Wi-Fi systems, security cameras, access control systems, and backup power connections.</p>

<h3>Flexible Configurations</h3>
<p>Whether you need an open workspace, private offices, a meeting room, or a combination, these containers can be configured to meet your needs. Partition walls can divide the space, while furniture packages are available to create a turnkey solution. Multiple containers can be combined to create larger office complexes.</p>`;

  } else if (isDangerousGoods) {
    description = `<p>Ensure safe and compliant storage of hazardous materials with this ${size}ft dangerous goods shipping container. Specifically designed and certified for storing and transporting hazardous substances, this container meets all international safety standards for dangerous goods handling. Essential for chemical companies, laboratories, industrial facilities, and emergency response teams.</p>

<h3>Certified Safety Standards</h3>
<p>This container meets strict international standards for dangerous goods storage, including UN certification for various hazard classes. The structure features reinforced walls, specialized ventilation systems, and spill containment features. All modifications and safety features are documented and certified, ensuring compliance with OSHA, EPA, and DOT regulations.</p>

<h3>Advanced Safety Features</h3>
<p>Safety is paramount when storing hazardous materials. This container includes explosion-proof electrical fixtures, static grounding points, emergency ventilation systems, and chemical-resistant interior coatings. Depending on the hazard class, additional features may include temperature controls, fire suppression systems, and gas detection monitors.</p>

<h3>Spill Containment</h3>
<p>The container features an integrated spill containment system with a sealed floor pan capable of containing 110% of the largest container stored within. Removable grating allows for easy inspection and cleaning, while drain valves permit controlled removal of any collected liquids. This prevents environmental contamination and facilitates compliance with regulations.</p>

<h3>Security & Access Control</h3>
<p>Dangerous goods require secure storage. This container features heavy-duty locking mechanisms, optional electronic access control, and provisions for security seals. Clear hazard labeling and safety signage ensure proper identification and handling procedures are followed. Interior lighting and emergency equipment storage ensure safe access and response capability.</p>`;

  } else if (isInsulated) {
    description = `<p>Maintain precise temperature control with this ${size}ft insulated shipping container. Whether you're storing temperature-sensitive materials, creating a controlled environment workspace, or building a climate-controlled structure, this container provides superior thermal performance and energy efficiency.</p>

<h3>Advanced Insulation System</h3>
<p>This container features a comprehensive insulation package including spray foam or rigid board insulation on all walls, ceiling, and floor. The insulation provides an excellent R-value, minimizing heat transfer and maintaining stable interior temperatures. Thermal breaks prevent condensation and moisture buildup, protecting both the container structure and stored contents.</p>

<h3>Temperature Stability</h3>
<p>The superior insulation ensures minimal temperature fluctuation, protecting sensitive materials from extreme heat or cold. This makes the container ideal for storing electronics, pharmaceuticals, food products, documents, or any items requiring stable environmental conditions. When combined with HVAC systems, the insulation dramatically reduces energy consumption.</p>

<h3>Moisture Protection</h3>
<p>Beyond temperature control, proper insulation prevents condensation that can lead to rust, mold, and material degradation. Vapor barriers and proper ventilation work together to maintain optimal humidity levels. This comprehensive moisture management system extends the life of both the container and its contents.</p>

<h3>Versatile Applications</h3>
<p>Insulated containers serve numerous purposes: temperature-controlled storage, workshop spaces, growing rooms for agriculture, wine cellars, or foundations for container homes and offices. The insulation also provides excellent sound dampening, making these containers suitable for recording studios, equipment rooms, or any application requiring noise reduction.</p>`;

  } else {
    // Standard shipping container
    description = `<p>This ${condition.toLowerCase()} ${size}ft ${isHighCube ? 'high cube ' : ''}shipping container offers reliable, secure, and weather-resistant storage for all your needs. Built to international ISO standards, this container provides decades of dependable service for storage, shipping, or modification projects. Whether you're looking for temporary storage, permanent facilities, or a foundation for a custom project, this container delivers exceptional value and versatility.</p>

<h3>Industrial-Strength Construction</h3>
<p>Manufactured from high-grade Corten steel, this container is built to withstand the harshest conditions. The corrugated steel walls provide exceptional strength while keeping weight manageable. ${condition === 'New' ? 'Fresh from the factory, this container features pristine paint, perfect seals, and flawless structural integrity.' : condition === 'Refurbished' ? 'Professionally refurbished to like-new condition, including fresh paint, new seals, and comprehensive structural inspection.' : 'This used container has been thoroughly inspected to ensure structural integrity and weather-tight condition, offering excellent value for storage applications.'}</p>

<h3>Secure Storage Solution</h3>
<p>Security is built into every container with heavy-duty locking mechanisms and tamper-resistant designs. The solid steel construction resists break-ins, while the lockbox protects padlocks from bolt cutters. Containers can be further secured with additional locks, alarms, or surveillance systems. The elevated floor design protects contents from ground moisture and pests.</p>

<h3>Weather Protection</h3>
<p>Designed to cross oceans, these containers excel at protecting contents from weather. Wind and water-tight seals keep out rain, snow, and dust. The steel construction withstands extreme temperatures, high winds, and heavy snow loads. Vents can be added for air circulation while maintaining weather resistance. This makes containers ideal for storing valuable equipment, inventory, or materials in any climate.</p>

<h3>Modification Potential</h3>
<p>Beyond storage, shipping containers offer endless modification possibilities. Common conversions include offices, workshops, retail spaces, homes, and specialized equipment enclosures. The modular design allows containers to be stacked or joined to create larger structures. Pre-existing corner castings and forklift pockets simplify handling and installation.</p>`;
  }

  // Add specifications section
  description += `

<h3>Technical Specifications</h3>
<ul>
<li><strong>Dimensions:</strong> ${size}ft length x 8ft width x ${isHighCube ? '9.5ft' : '8.5ft'} height</li>
<li><strong>Capacity:</strong> ${size === '20' ? '1,170' : size === '40' ? '2,390' : '2,690'} cubic feet</li>
<li><strong>Condition:</strong> ${condition} - ${condition === 'New' ? 'One-trip container, like new condition' : condition === 'Refurbished' ? 'Professionally restored to excellent condition' : 'Cargo-worthy, wind and water tight'}</li>
<li><strong>Floor:</strong> ${size === '20' ? '1.1 inch (28mm)' : '1.5 inch (38mm)'} marine-grade plywood</li>
<li><strong>Payload:</strong> Up to ${size === '20' ? '28,000 kg' : '26,000 kg'} depending on configuration</li>
<li><strong>Certification:</strong> ${isDangerousGoods ? 'UN Certified for Dangerous Goods' : 'Meets ISO shipping standards'}</li>
</ul>

<h3>Delivery & Installation</h3>
<p>We provide comprehensive delivery services including site assessment, transportation, and placement. Our experienced drivers can navigate tight spaces and position containers precisely where needed. Basic delivery includes placement on level ground, while additional services include leveling, anchoring, and foundation preparation. For modifications or conversions, we offer turnkey installation including utility connections.</p>

<h3>Warranty & Support</h3>
<p>${condition === 'New' ? 'This new container includes a comprehensive warranty covering structural integrity and weather-tightness.' : condition === 'Refurbished' ? 'Our refurbished containers come with a warranty on all restoration work and weather seals.' : 'Used containers are sold as-is but have been inspected to ensure they meet our quality standards.'} Our expert team provides ongoing support for maintenance, modifications, and troubleshooting. Extended warranties and service packages are available for commercial customers.</p>

<h3>Why Choose Our Containers</h3>
<p>With years of experience in the container industry, we understand that every application is unique. That's why we offer comprehensive services from selection consultation to custom modifications. Our containers undergo rigorous inspection to ensure quality, and we stand behind every unit we sell. Whether you need simple storage or complex modifications, we have the expertise to deliver exactly what you need.</p>`;

  return description;
}

async function updateProduct(product) {
  const description = generateDetailedDescription(product);

  const updateData = {
    description: description
  };

  try {
    const response = await fetch(`${WP_REST_URL}/wc/v3/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to update product ${product.id}:`, error);
      return false;
    }

    const updated = await response.json();
    console.log(`✓ Updated: ${product.name} - Description now ${updated.description.length} characters`);
    return true;
  } catch (error) {
    console.error(`Error updating product ${product.id}:`, error.message);
    return false;
  }
}

async function getAllProducts() {
  let allProducts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${WP_REST_URL}/wc/v3/products?per_page=100&page=${page}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch products:', await response.text());
      break;
    }

    const products = await response.json();

    if (products.length === 0) {
      hasMore = false;
    } else {
      allProducts = allProducts.concat(products);
      console.log(`Fetched ${products.length} products from page ${page}`);
      page++;
    }
  }

  return allProducts;
}

async function main() {
  console.log('Fetching all products...');
  const products = await getAllProducts();
  console.log(`Found ${products.length} products total\n`);

  console.log('Updating product descriptions with detailed, human-readable content...\n');

  let successCount = 0;
  for (const product of products) {
    const success = await updateProduct(product);
    if (success) successCount++;

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Successfully updated ${successCount} out of ${products.length} products`);
}

main().catch(console.error);
