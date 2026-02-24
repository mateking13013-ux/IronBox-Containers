// Local product data — replaces WooCommerce API
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';

/**
 * Fetch all products (from local data)
 */
export async function getAllProducts(params = {}) {
  let products = [...productsData];

  if (params.category) {
    products = products.filter(p =>
      p.categories.some(c => c.id === parseInt(params.category))
    );
  }

  const perPage = parseInt(params.per_page) || 100;
  return products.slice(0, perPage);
}

/**
 * Fetch all product categories
 */
export async function getCategories() {
  return categoriesData.filter(cat => cat.slug !== 'uncategorized');
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(categoryId, params = {}) {
  const products = productsData.filter(p =>
    p.categories.some(c => c.id === categoryId)
  );

  const perPage = parseInt(params.per_page) || 100;
  return products.slice(0, perPage);
}

/**
 * Get a single product by ID
 */
export async function getProduct(id) {
  return productsData.find(p => p.id === id) || null;
}

/**
 * Format price for display
 */
export function formatPrice(price) {
  if (!price) return '';
  const numPrice = parseFloat(price);
  return 'R' + new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

/**
 * Extract condition from product name or meta
 */
export function getProductCondition(product) {
  const name = product.name?.toLowerCase() || '';
  if (name.includes('new ')) return 'New';
  if (name.includes('used ')) return 'Used';
  if (name.includes('refurbished ')) return 'Refurbished';
  return 'Refurbished'; // default
}

/**
 * Get container size from product name
 */
export function getContainerSize(product) {
  const name = product.name || '';
  if (name.includes('40ft') || name.includes('40 ft') || name.includes('40FT') || name.includes('40 Feet')) return '40ft';
  if (name.includes('20ft') || name.includes('20 ft') || name.includes('20FT') || name.includes('20 Feet') || name.includes('20Ft')) return '20ft';
  if (name.includes('10ft') || name.includes('10 ft') || name.includes('10\'') || name.includes('10FT') || name.includes('10Ft')) return '10ft';
  if (name.includes('30ft') || name.includes('30 ft')) return '30ft';
  if (name.includes('24ft') || name.includes('24 ft')) return '24ft';
  if (name.includes('16ft') || name.includes('16 ft') || name.includes('15ft')) return '16ft';
  if (name.includes('12ft') || name.includes('12\'') || name.includes('12Ft')) return '12ft';
  if (name.includes('9ft')) return '9ft';
  if (name.includes('8ft')) return '8ft';
  if (name.includes('7ft')) return '7ft';
  return '';
}

/**
 * Parse short description to extract key specs
 */
export function parseProductSpecs(product) {
  const shortDesc = product.short_description || '';
  // Remove HTML tags
  const text = shortDesc.replace(/<[^>]*>/g, '');

  // Extract specs from bullet points
  const specs = {};

  // Try to find dimensions
  const dimMatch = text.match(/Dimensions:\s*([\d.]+m\s*×\s*[\d.]+m\s*×\s*[\d.]+m)/);
  if (dimMatch) specs.dimensions = dimMatch[1];

  // Try to find volume
  const volMatch = text.match(/Volume:\s*([\d.]+m³)/);
  if (volMatch) specs.volume = volMatch[1];

  // Try to find condition
  const condMatch = text.match(/Condition:\s*(\w+)/);
  if (condMatch) specs.condition = condMatch[1];

  // Try to find features
  const featMatch = text.match(/Features:\s*([^•\n]+)/);
  if (featMatch) specs.features = featMatch[1];

  return specs;
}
