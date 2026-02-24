import { defineConfig } from 'astro/config';
import wordpress from '@astrojs/wordpress';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Hybrid output: static pages + dynamic location pages
  output: 'hybrid',
  
  // Integrations
  integrations: [
    // WordPress integration for content management
    wordpress({
      url: 'https://your-wp-site.com',
      // Optional: Add authentication if needed
      // authToken: process.env.WORDPRESS_AUTH_TOKEN,
    }),
    
    // Tailwind CSS for styling
    tailwind({
      // Path to your Tailwind config file
      config: './tailwind.config.js',
      // Apply CSS to all files
      applyBaseStyles: true,
    }),
    
    // Sitemap generation for SEO
    sitemap({
      // Filter out dynamic pages if needed
      filter: (page) => !page.startsWith('/api/'),
    }),
  ],
  
  // Build options
  build: {
    // Format for build output
    format: 'directory',
  },
  
  // Server options (for SSR/hybrid)
  server: {
    // Port for development server
    port: 3000,
    // Host for development server
    host: '0.0.0.0',
  },
  
  // Security headers
  headers: [
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, stale-while-revalidate=86400',
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
      ],
    },
    {
      source: '/containers/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=1800, stale-while-revalidate=3600',
        },
      ],
    },
  ],
  
  // Redirects (if needed)
  redirects: [
    // Example redirect:
    // {
    //   source: '/old-location',
    //   destination: '/containers/new-location',
    //   status: 301,
    // },
  ],
  
  // Performance optimizations
  performance: {
    // Enable image optimization
    image: {
      // Default image service
      service: 'sharp',
      // Image quality
      quality: 85,
    },
    
    // Enable compression
    compression: true,
    
    // Enable prefetching
    prefetch: true,
  },
  
  // Dev toolbar
  devToolbar: {
    enabled: true,
  },
  
  // Vite configuration
  vite: {
    // Plugins
    plugins: [],
    
    // Build optimizations
    build: {
      // Minimize CSS
      cssMinify: true,
      // Minify JavaScript
      minify: 'terser',
      // Enable sourcemaps in development
      sourcemap: process.env.NODE_ENV === 'development',
    },
    
    // Server configuration
    server: {
      // Enable CORS for development
      cors: true,
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        // Component aliases
        '@components': './src/components',
        '@layouts': './src/layouts',
        '@styles': './src/styles',
      },
    },
  },
  
  // Markdown configuration
  markdown: {
    // Enable syntax highlighting
    syntaxHighlight: 'prism',
    // Shiki configuration (alternative to Prism)
    shikiConfig: {
      theme: 'github-dark',
      langs: [],
      wrap: true,
    },
  },
  
  // Scoped CSS strategy
  scopedStyleStrategy: 'where',
  
  // Experimental features
  experimental: {
    // Enable experimental features if needed
    // assets: true,
    // prefetching: true,
  },
});