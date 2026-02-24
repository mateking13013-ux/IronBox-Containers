# WordPress Backend Setup Instructions

## Overview
After integrating the location page template, you need to set up your WordPress backend to provide content for the dynamic location pages.

## Required WordPress Plugins

1. **Advanced Custom Fields Pro** (ACF Pro)
   - Download from: https://www.advancedcustomfields.com/pro/
   - Install and activate

2. **ACF to REST API**
   - Install from WordPress repository
   - Allows ACF fields to be accessible via REST API

3. **Custom Post Type UI** (Optional)
   - For easier CPT management
   - Install from WordPress repository

## WordPress Functions.php Setup

Add this code to your theme's `functions.php`:

```php
// Enable REST API for Location Pages custom post type
add_filter('register_post_type_args', function($args, $post_type) {
    if ('location_page' === $post_type) {
        $args['show_in_rest'] = true;
        $args['rest_base'] = 'location_pages';
        $args['rest_controller_class'] = 'WP_REST_Posts_Controller';
    }
    return $args;
}, 10, 2);

// Enable ACF fields in REST API
add_filter('acf/rest/api_response', function($response) {
    return $response;
});

// Register Location Pages custom post type
function create_location_page_post_type() {
    register_post_type('location_page',
        array(
            'labels' => array(
                'name' => __('Location Pages'),
                'singular_name' => __('Location Page')
            ),
            'public' => true,
            'has_archive' => true,
            'show_in_rest' => true,
            'supports' => array('title'),
            'rewrite' => array('slug' => 'containers'),
            'menu_icon' => 'dashicons-location-alt',
            'show_ui' => true,
            'capability_type' => 'post',
            'hierarchical' => false,
        )
    );
}
add_action('init', 'create_location_page_post_type');
```

## ACF Field Groups Setup

Create the following field groups in WordPress → Custom Fields → Add New:

### 1. Location Information
- `location_name` (Text) - Required
- `location_state` (Text) - Required  
- `location_country` (Text) - Required
- `location_slug` (Text) - Required
- `service_area_text` (Textarea)

### 2. Contact Information
- `phone_number` (Text) - Required
- `email_address` (Email) - Required
- `business_hours` (Text) - Required
- `physical_address` (Textarea)
- `delivery_radius` (Number)

### 3. Hero Section
- `hero_headline` (Text) - Required
- `hero_subheadline` (Textarea) - Required
- `hero_cta_primary_text` (Text)
- `hero_cta_secondary_text` (Text)

### 4. Introduction Content
- `intro_title` (Text) - Required
- `intro_paragraph_1` (Textarea) - Required
- `intro_paragraph_2` (Textarea)

### 5. Container Products
- `container_products` (Repeater) - Required
  - `product_name` (Text) - Required
  - `product_description` (Textarea) - Required
  - `product_price` (Text) - Required
  - `product_features` (Repeater) - Required
    - Feature (Text)

### 6. FAQ Section
- `faq_items` (Repeater) - Required
  - `faq_question` (Text) - Required
  - `faq_answer` (WYSIWYG) - Required

### 7. SEO & Metadata
- `seo_title` (Text)
- `seo_description` (Textarea)

## Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the WordPress URL:
   ```
   WORDPRESS_URL=https://your-wordpress-site.com
   ```

## Testing the Integration

1. Create a test location page in WordPress:
   - Go to "Location Pages" → "Add New"
   - Fill in all ACF fields
   - Set slug to "test-location"
   - Publish

2. Test the REST API:
   ```
   https://your-wordpress-site.com/wp-json/wp/v2/location_pages?slug=test-location&_embed=acf
   ```

3. Test in Astro:
   ```
   http://localhost:3000/containers/test-location/
   ```

## Final Steps

1. Install production adapter for SSR:
   ```bash
   npm install @astrojs/node
   ```
2. Update `astro.config.mjs` for production
3. Deploy both WordPress and Astro
4. Create your location pages in WordPress!

## Support

Refer to the documentation in `location-page-template/docs/` for detailed field definitions and troubleshooting guides.
