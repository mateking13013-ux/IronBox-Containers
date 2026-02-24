// WordPress Configuration for Astro Integration

// WordPress Site Configuration
export const WORDPRESS_CONFIG = {
  // WordPress site URL
  siteUrl: 'https://your-wp-site.com',
  
  // REST API base URL
  apiUrl: 'https://your-wp-site.com/wp-json',
  
  // Authentication (if required)
  auth: {
    // Application password or JWT token
    token: process.env.WORDPRESS_AUTH_TOKEN || null,
    
    // Username for basic auth
    username: process.env.WORDPRESS_USERNAME || null,
    
    // Application password
    password: process.env.WORDPRESS_APP_PASSWORD || null,
  },
  
  // Custom Post Type Configuration
  postTypes: {
    // Location pages post type
    location_pages: {
      // REST API endpoint
      endpoint: '/wp/v2/location_pages',
      
      // Query parameters
      defaultParams: {
        _embed: 'acf', // Include ACF fields
        per_page: 100, // Items per page
      },
      
      // Cache settings
      cache: {
        enabled: true,
        ttl: 3600, // 1 hour cache
      },
    },
  },
  
  // Field mappings (WordPress ACF fields to component props)
  fieldMappings: {
    // Location information
    location_name: 'location_name',
    location_state: 'location_state',
    location_country: 'location_country',
    service_area_text: 'service_area_text',
    
    // Contact information
    phone_number: 'phone_number',
    email_address: 'email_address',
    business_hours: 'business_hours',
    
    // Hero section
    hero_headline: 'hero_headline',
    hero_subheadline: 'hero_subheadline',
    hero_cta_primary_text: 'hero_cta_primary_text',
    hero_cta_secondary_text: 'hero_cta_secondary_text',
    
    // Introduction section
    intro_title: 'intro_title',
    intro_paragraph_1: 'intro_paragraph_1',
    intro_paragraph_2: 'intro_paragraph_2',
    
    // Products
    container_products: 'container_products',
    
    // FAQ
    faq_items: 'faq_items',
    
    // SEO
    seo_title: 'seo_title',
    seo_description: 'seo_description',
  },
  
  // API Request Configuration
  api: {
    // Request timeout (ms)
    timeout: 10000,
    
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 1000,
    },
    
    // Default headers
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // Caching Configuration
  cache: {
    // Enable caching
    enabled: true,
    
    // Cache TTL in seconds
    ttl: {
      // Location pages cache for 1 hour
      location_pages: 3600,
      
      // General content cache for 30 minutes
      general: 1800,
    },
    
    // Cache key prefix
    prefix: 'wp_astro_',
    
    // Cache storage (memory, redis, etc.)
    storage: 'memory',
  },
  
  // Error handling
  errorHandling: {
    // Log errors to console
    logErrors: true,
    
    // Show user-friendly error messages
    showUserMessages: true,
    
    // Fallback content for failed requests
    fallbackContent: {
      title: 'Service Temporarily Unavailable',
      message: 'We\'re having trouble loading this content. Please try again later.',
    },
  },
  
  // SEO Configuration
  seo: {
    // Enable structured data
    structuredData: true,
    
    // Default SEO values
    defaults: {
      title: 'Shipping Containers for Sale',
      description: 'Premium quality shipping containers available nationwide',
      keywords: 'shipping containers, storage containers, container sales',
    },
    
    // Open Graph defaults
    openGraph: {
      type: 'website',
      siteName: 'Your Company Name',
      locale: 'en_US',
    },
    
    // Twitter Card defaults
    twitter: {
      card: 'summary_large_image',
      site: '@yourcompany',
    },
  },
  
  // Development Configuration
  development: {
    // Enable debug mode
    debug: process.env.NODE_ENV === 'development',
    
    // Mock data for development
    mockData: {
      enabled: process.env.NODE_ENV === 'development',
      file: './mock-data/location-pages.json',
    },
    
    // Enable API logging
    logApiCalls: process.env.NODE_ENV === 'development',
  },
  
  // Production Configuration
  production: {
    // Enable CDN for assets
    cdn: {
      enabled: true,
      url: 'https://cdn.your-site.com',
    },
    
    // Enable compression
    compression: true,
    
    // Enable HTTP/2
    http2: true,
    
    // Security headers
    securityHeaders: {
      enableCSP: true,
      enableHSTS: true,
    },
  },
};

// Helper functions for WordPress API interactions
export const WordPressAPI = {
  // Get location page by slug
  getLocationPage: async (slug) => {
    try {
      const response = await fetch(
        `${WORDPRESS_CONFIG.apiUrl}${WORDPRESS_CONFIG.postTypes.location_pages.endpoint}?slug=${slug}&_embed=acf`,
        {
          headers: WORDPRESS_CONFIG.api.headers,
          timeout: WORDPRESS_CONFIG.api.timeout,
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Error fetching location page:', error);
      throw error;
    }
  },
  
  // Get all location pages
  getAllLocationPages: async () => {
    try {
      const response = await fetch(
        `${WORDPRESS_CONFIG.apiUrl}${WORDPRESS_CONFIG.postTypes.location_pages.endpoint}`,
        {
          headers: WORDPRESS_CONFIG.api.headers,
          timeout: WORDPRESS_CONFIG.api.timeout,
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching location pages:', error);
      throw error;
    }
  },
  
  // Search location pages
  searchLocationPages: async (query) => {
    try {
      const response = await fetch(
        `${WORDPRESS_CONFIG.apiUrl}${WORDPRESS_CONFIG.postTypes.location_pages.endpoint}?search=${query}&_embed=acf`,
        {
          headers: WORDPRESS_CONFIG.api.headers,
          timeout: WORDPRESS_CONFIG.api.timeout,
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching location pages:', error);
      throw error;
    }
  },
};

// Export configuration for use in components
export default WORDPRESS_CONFIG;