#!/usr/bin/env node

/**
 * WordPress Setup Script
 * This script helps set up WordPress for the Astro location page template
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WordPressSetup {
  constructor() {
    this.config = {
      wpUrl: 'https://your-wp-site.com',
      wpUsername: 'admin',
      wpPassword: 'password',
      pluginList: [
        'advanced-custom-fields-pro',
        'acf-to-rest-api',
        'custom-post-type-ui',
        'rest-api-oauth1',
      ],
    };
    
    this.setupDir = path.join(__dirname, '..');
    this.docsDir = path.join(this.setupDir, 'docs');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async checkRequirements() {
    this.log('Checking requirements...');
    
    // Check if Node.js is installed
    try {
      execSync('node --version', { stdio: 'pipe' });
      this.log('Node.js is installed');
    } catch (error) {
      this.log('Node.js is not installed', 'error');
      process.exit(1);
    }
    
    // Check if npm is installed
    try {
      execSync('npm --version', { stdio: 'pipe' });
      this.log('npm is installed');
    } catch (error) {
      this.log('npm is not installed', 'error');
      process.exit(1);
    }
    
    this.log('Requirements check passed', 'success');
  }

  async createWordPressFunctions() {
    this.log('Creating WordPress functions.php...');
    
    const functionsCode = `<?php
/**
 * WordPress Functions for Location Pages Template
 * This file contains all the necessary WordPress setup for the Astro integration
 */

// Enable REST API for custom post types
add_filter('register_post_type_args', function($args, $post_type) {
    if ('location_page' === $post_type) {
        $args['show_in_rest'] = true;
        $args['rest_base'] = 'location_pages';
        $args['rest_controller_class'] = 'WP_REST_Posts_Controller';
    }
    return $args;
}, 10, 2);

// Enable ACF in REST API
add_filter('acf/rest/api_response', function($response) {
    return $response;
});

// Create Custom Post Type: Location Pages
function create_location_pages_post_type() {
    register_post_type('location_page', array(
        'label' => 'Location Pages',
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => array('title'),
        'rewrite' => array('slug' => 'containers'),
        'menu_icon' => 'dashicons-location-alt',
        'show_ui' => true,
        'capability_type' => 'post',
        'hierarchical' => false,
        'labels' => array(
            'name' => __('Location Pages'),
            'singular_name' => __('Location Page'),
            'add_new' => __('Add New'),
            'add_new_item' => __('Add New Location Page'),
            'edit_item' => __('Edit Location Page'),
            'new_item' => __('New Location Page'),
            'view_item' => __('View Location Page'),
            'search_items' => __('Search Location Pages'),
            'not_found' => __('No location pages found'),
            'not_found_in_trash' => __('No location pages found in trash'),
            'all_items' => __('All Location Pages'),
            'menu_name' => __('Location Pages'),
        ),
    ));
}
add_action('init', 'create_location_pages_post_type');

// Add custom REST API endpoints
add_action('rest_api_init', function() {
    // Get locations by state
    register_rest_route('location-pages/v1', '/locations-by-state/(?P<state>[a-zA-Z\s-]+)', array(
        'methods' => 'GET',
        'callback' => 'get_locations_by_state',
        'permission_callback' => '__return_true',
    ));
    
    // Search location pages
    register_rest_route('location-pages/v1', '/search', array(
        'methods' => 'GET',
        'callback' => 'search_location_pages',
        'permission_callback' => '__return_true',
    ));
});

function get_locations_by_state($request) {
    $state = sanitize_text_field($request['state']);
    $args = array(
        'post_type' => 'location_page',
        'meta_query' => array(
            array(
                'key' => 'location_state',
                'value' => $state,
                'compare' => '=',
            ),
        ),
        'posts_per_page' => -1,
    );
    
    $query = new WP_Query($args);
    $locations = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $locations[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'slug' => get_post_field('post_name'),
                'acf' => get_fields(get_the_ID()),
            );
        }
    }
    
    wp_reset_postdata();
    return new WP_REST_Response($locations, 200);
}

function search_location_pages($request) {
    $search_term = sanitize_text_field($request->get_param('search'));
    $args = array(
        'post_type' => 'location_page',
        's' => $search_term,
        'posts_per_page' => 10,
    );
    
    $query = new WP_Query($args);
    $results = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $results[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'slug' => get_post_field('post_name'),
                'excerpt' => get_the_excerpt(),
                'acf' => get_fields(get_the_ID()),
            );
        }
    }
    
    wp_reset_postdata();
    return new WP_REST_Response($results, 200);
}

// Add CORS headers for API requests
add_action('init', function() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
});

// Flush rewrite rules on activation
function flush_rewrite_rules() {
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'flush_rewrite_rules');
`;

    const functionsPath = path.join(this.setupDir, 'wordpress-functions.php');
    fs.writeFileSync(functionsPath, functionsCode);
    this.log('WordPress functions.php created', 'success');
  }

  async createACFExport() {
    this.log('Creating ACF export file...');
    
    const acfExport = {
      key: 'group_location_pages',
      title: 'Location Pages',
      fields: [
        {
          key: 'field_location_information',
          label: 'Location Information',
          name: 'location_information',
          type: 'group',
          sub_fields: [
            {
              key: 'field_location_name',
              label: 'Location Name',
              name: 'location_name',
              type: 'text',
              required: 1,
            },
            {
              key: 'field_location_state',
              label: 'Location State',
              name: 'location_state',
              type: 'text',
              required: 1,
            },
            {
              key: 'field_location_country',
              label: 'Location Country',
              name: 'location_country',
              type: 'text',
              default_value: 'United States',
            },
            {
              key: 'field_service_area_text',
              label: 'Service Area Text',
              name: 'service_area_text',
              type: 'textarea',
              default_value: 'Serving {location} and Surrounding Areas',
            },
          ],
        },
        {
          key: 'field_contact_information',
          label: 'Contact Information',
          name: 'contact_information',
          type: 'group',
          sub_fields: [
            {
              key: 'field_phone_number',
              label: 'Phone Number',
              name: 'phone_number',
              type: 'text',
              required: 1,
            },
            {
              key: 'field_email_address',
              label: 'Email Address',
              name: 'email_address',
              type: 'email',
              required: 1,
            },
            {
              key: 'field_business_hours',
              label: 'Business Hours',
              name: 'business_hours',
              type: 'text',
              default_value: 'Mon-Fri: 8AM-6PM',
            },
          ],
        },
        // Add more field groups as needed...
      ],
      location: array(
        0 => 'side',
        array(
          0 => 'acf-options-page',
        ),
      ),
      menu_order: 0,
      position: 'normal',
      style: 'default',
      label_placement: 'top',
      instruction_placement: 'label',
      hide_on_screen: array(),
      active: true,
      description: '',
    };

    const acfPath = path.join(this.setupDir, 'acf-export.json');
    fs.writeFileSync(acfPath, JSON.stringify(acfExport, null, 2));
    this.log('ACF export file created', 'success');
  }

  async createSetupScript() {
    this.log('Creating setup script...');
    
    const setupScript = `#!/bin/bash

# WordPress Setup Script for Location Pages Template

echo "🚀 Setting up WordPress for Location Pages Template..."

# Check if wp-cli is installed
if ! command -v wp &> /dev/null; then
    echo "❌ WP-CLI is not installed. Please install it first."
    exit 1
fi

# Set WordPress path
WP_PATH="/path/to/wordpress"

# Install required plugins
echo "📦 Installing required plugins..."
wp plugin install advanced-custom-fields-pro --activate --path=$WP_PATH
wp plugin install acf-to-rest-api --activate --path=$WP_PATH
wp plugin install custom-post-type-ui --activate --path=$WP_PATH
wp plugin install rest-api-oauth1 --activate --path=$WP_PATH

# Create custom post type
echo "🏗️  Creating custom post type..."
wp post-type create location_page --label="Location Pages" --public --rest-api --path=$WP_PATH

# Create options page for ACF
echo "⚙️  Creating options page..."
if wp plugin is-active advanced-custom-fields-pro --path=$WP_PATH; then
    wp acf options-page add --title="Location Pages Settings" --path=$WP_PATH
fi

# Flush rewrite rules
echo "🔄 Flushing rewrite rules..."
wp rewrite flush --path=$WP_PATH

echo "✅ WordPress setup completed!"
echo "📚 Next steps:"
echo "   1. Import ACF fields from acf-export.json"
echo "   2. Add WordPress functions to your theme's functions.php"
echo "   3. Test the REST API endpoints"
echo "   4. Configure your Astro frontend"
`;

    const scriptPath = path.join(this.setupDir, 'setup-wordpress.sh');
    fs.writeFileSync(scriptPath, setupScript);
    fs.chmodSync(scriptPath, '755');
    this.log('Setup script created', 'success');
  }

  async createReadme() {
    this.log('Creating setup README...');
    
    const readme = `# WordPress Setup Guide

This directory contains scripts and configuration files to set up WordPress for the Location Pages Template.

## Files Included

### WordPress Functions
- \`wordpress-functions.php\` - WordPress functions to add to your theme's functions.php

### ACF Export
- \`acf-export.json\` - ACF field groups export (import via ACF in WordPress admin)

### Setup Scripts
- \`setup-wordpress.sh\` - Bash script for automated WordPress setup
- \`setup-wordpress.js\` - Node.js setup script (this file)

## Manual Setup Steps

### 1. Install Required Plugins
Install and activate these plugins in WordPress:
- Advanced Custom Fields Pro
- ACF to REST API
- Custom Post Type UI (optional)
- REST API - OAuth 1.0a Server (optional)

### 2. Add Functions to Theme
Copy the contents of \`wordpress-functions.php\` to your theme's \`functions.php\` file.

### 3. Import ACF Fields
1. Go to WordPress Admin → Custom Fields → Tools
2. Click "Import Field Groups"
3. Select \`acf-export.json\`
4. Click "Import"

### 4. Test REST API
Test that your REST API endpoints are working:
\`\`\`
curl https://your-wp-site.com/wp-json/wp/v2/location_pages
\`\`\`

### 5. Configure Astro Frontend
Update your Astro configuration to connect to your WordPress site.

## Automated Setup

### Using Bash Script
\`\`\`bash
./setup-wordpress.sh
\`\`\`

### Using WP-CLI
\`\`\`bash
# Install plugins
wp plugin install advanced-custom-fields-pro acf-to-rest-api --activate

# Create post type
wp post-type create location_pages --label="Location Pages" --public --rest-api

# Flush rewrite rules
wp rewrite flush
\`\`\`

## Testing

After setup, test these endpoints:
- \`/wp-json/wp/v2/location_pages\` - Get all location pages
- \`/wp-json/wp/v2/location_pages?slug=new-york\` - Get specific location
- \`/wp-json/location-pages/v1/locations-by-state/New%20York\` - Get locations by state

## Troubleshooting

### Common Issues

1. **REST API returning 404**
   - Check that permalinks are set to "Post name"
   - Ensure custom post type has \`show_in_rest => true\`

2. **ACF fields not showing in API**
   - Install and activate "ACF to REST API" plugin
   - Check that ACF fields are assigned to the post type

3. **CORS issues**
   - Ensure CORS headers are properly set
   - Check that your Astro site URL is allowed

### Debug Mode
Add this to your wp-config.php for debugging:
\`\`\`php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
\`\`\`

## Support

For issues or questions, refer to the main documentation in the \`docs/\` directory.
`;

    const readmePath = path.join(this.setupDir, 'README.md');
    fs.writeFileSync(readmePath, readme);
    this.log('Setup README created', 'success');
  }

  async run() {
    this.log('Starting WordPress setup...');
    
    try {
      await this.checkRequirements();
      await this.createWordPressFunctions();
      await this.createACFExport();
      await this.createSetupScript();
      await this.createReadme();
      
      this.log('WordPress setup completed successfully!', 'success');
      this.log('');
      this.log('Next steps:');
      this.log('1. Review the generated files in this directory');
      this.log('2. Follow the setup instructions in scripts/README.md');
      this.log('3. Import ACF fields into WordPress');
      this.log('4. Test the REST API endpoints');
      this.log('5. Configure your Astro frontend');
      
    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the setup
if (require.main === module) {
  const setup = new WordPressSetup();
  setup.run();
}

module.exports = WordPressSetup;