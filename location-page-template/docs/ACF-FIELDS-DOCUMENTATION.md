# ACF Fields Documentation for Location-Based SEO Pages

This document outlines all the Advanced Custom Fields (ACF) needed to create location-based shipping container pages that will be rendered as Astro pages on the frontend.

## Overview

This template is designed for programmatic SEO, allowing you to generate hundreds of location-specific pages for shipping container sales. Each page will have consistent structure while allowing location-specific customization.

## Field Groups Structure

### Field Group 1: Location Information

#### Basic Location Fields
- **Field Name**: `location_name`
- **Field Type**: Text
- **Required**: Yes
- **Description**: The main location name (e.g., "New York", "Los Angeles")
- **Usage**: Used in page titles, headings, and dynamic content

- **Field Name**: `location_state`
- **Field Type**: Text
- **Required**: Yes
- **Description**: The state or region (e.g., "New York", "California")
- **Usage**: Used for location context and SEO

- **Field Name**: `location_country`
- **Field Type**: Text
- **Required**: Yes
- **Default**: "United States"
- **Description**: The country name
- **Usage**: Used for international SEO and context

- **Field Name**: `location_slug`
- **Field Type**: Text
- **Required**: Yes
- **Description**: URL-friendly slug for the location (e.g., "new-york", "los-angeles")
- **Usage**: Used for page URLs and routing

- **Field Name**: `service_area_text`
- **Field Type**: Textarea
- **Required**: No
- **Default**: "Serving {location} and Surrounding Areas"
- **Description**: Text describing the service area
- **Usage**: Used in badges and service area descriptions

### Field Group 2: Contact Information

#### Contact Details
- **Field Name**: `phone_number`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Main contact phone number
- **Usage**: Displayed in sidebar and contact sections

- **Field Name**: `email_address`
- **Field Type**: Email
- **Required**: Yes
- **Description**: Main contact email address
- **Usage**: Displayed in sidebar and contact forms

- **Field Name**: `business_hours`
- **Field Type**: Text
- **Required**: No
- **Default**: "Mon-Fri: 8AM-6PM"
- **Description**: Business operating hours
- **Usage**: Displayed in sidebar and contact sections

- **Field Name**: `physical_address`
- **Field Type**: Textarea
- **Required**: No
- **Description**: Physical business address (if applicable)
- **Usage**: For local business schema and contact information

- **Field Name**: `delivery_radius`
- **Field Type**: Number
- **Required**: No
- **Description**: Delivery radius in miles from city center
- **Usage**: For service area calculations and SEO

### Field Group 3: Hero Section

#### Hero Content
- **Field Name**: `hero_headline`
- **Field Type**: Text
- **Required**: Yes
- **Default**: "Buy Shipping Containers in {location}"
- **Description**: Main hero headline
- **Usage**: Primary H1 heading on the page

- **Field Name**: `hero_subheadline`
- **Field Type**: Textarea
- **Required**: Yes
- **Description**: Hero section subheadline text
- **Usage**: Secondary text in hero section

- **Field Name**: `hero_cta_primary_text`
- **Field Type**: Text
- **Required**: No
- **Default**: "Get Instant Quote"
- **Description**: Primary CTA button text
- **Usage**: Main call-to-action button

- **Field Name**: `hero_cta_secondary_text`
- **Field Type**: Text
- **Required**: No
- **Default**: "Browse Inventory"
- **Description**: Secondary CTA button text
- **Usage**: Secondary call-to-action button

### Field Group 4: Introduction Content

#### Introduction Section
- **Field Name**: `intro_title`
- **Field Type**: Text
- **Required**: Yes
- **Default**: "Your Trusted Source for Shipping Containers in {location}"
- **Description**: Introduction section title
- **Usage**: H2 heading for introduction section

- **Field Name**: `intro_paragraph_1`
- **Field Type**: Wysiwyg Editor
- **Required**: Yes
- **Description**: First introduction paragraph
- **Usage**: Main introduction content

- **Field Name**: `intro_paragraph_2`
- **Field Type**: Wysiwyg Editor
- **Required**: No
- **Description**: Second introduction paragraph
- **Usage**: Additional introduction content

### Field Group 5: Benefits Section

#### Benefits Repeater Field
- **Field Name**: `benefits_section`
- **Field Type**: Repeater
- **Required**: No
- **Description**: Benefits and key points section

**Sub-fields for Benefits Section:**
- **Field Name**: `benefit_title`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Title for benefits subsection

- **Field Name**: `benefit_items`
- **Field Type**: Repeater
- **Required**: Yes
- **Description**: Individual benefit items

**Sub-fields for Benefit Items:**
- **Field Name**: `benefit_icon`
- **Field Type**: Select
- **Required**: No
- **Choices**: `shield : Shield`, `dollar : Dollar Sign`, `truck : Truck`, `wrench : Wrench`, `star : Star`, `map_pin : Map Pin`
- **Description**: Icon for the benefit item

- **Field Name**: `benefit_text`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Benefit item text

### Field Group 6: Popular Uses Section

#### Popular Uses Repeater Field
- **Field Name**: `popular_uses_section`
- **Field Type**: Repeater
- **Required**: No
- **Description**: Popular uses for containers in this location

**Sub-fields for Popular Uses:**
- **Field Name**: `uses_title`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Title for popular uses subsection

- **Field Name**: `use_items`
- **Field Type**: Repeater
- **Required**: Yes
- **Description**: Individual use cases

**Sub-fields for Use Items:**
- **Field Name**: `use_icon`
- **Field Type**: Select
- **Required**: No
- **Choices**: `users : Users`, `globe : Globe`, `leaf : Leaf`, `package : Package`
- **Description**: Icon for the use case

- **Field Name**: `use_text`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Use case text

### Field Group 7: Container Products

#### Container Products Repeater Field
- **Field Name**: `container_products`
- **Field Type**: Repeater
- **Required**: Yes
- **Description**: Container products available for this location

**Sub-fields for Container Products:**
- **Field Name**: `product_name`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Product name (e.g., "20ft Standard Container")

- **Field Name**: `product_description`
- **Field Type**: Textarea
- **Required**: Yes
- **Description**: Product description

- **Field Name**: `product_price`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Product price (e.g., "$2,500")

- **Field Name**: `product_features`
- **Field Type**: Repeater
- **Required**: Yes
- **Description**: Product features list

**Sub-fields for Product Features:**
- **Field Name**: `feature_text`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Individual feature text

### Field Group 8: Detailed Information

#### Container Grades
- **Field Name**: `container_grades_title`
- **Field Type**: Text
- **Required**: No
- **Default**: "Understanding Container Grades"
- **Description**: Title for container grades section

- **Field Name**: `container_grades`
- **Field Type**: Repeater
- **Required**: No
- **Description**: Container grade information

**Sub-fields for Container Grades:**
- **Field Name**: `grade_name`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Grade name (e.g., "New (One-Trip)")

- **Field Name**: `grade_description`
- **Field Type**: Textarea
- **Required**: Yes
- **Description**: Grade description

- **Field Name**: `best_for`
- **Field Type**: Text
- **Required**: No
- **Description**: Best use cases for this grade

#### Container Specifications
- **Field Name**: `container_specs_title`
- **Field Type**: Text
- **Required**: No
- **Default**: "Container Sizes and Dimensions"
- **Description**: Title for specifications section

- **Field Name**: `container_specs`
- **Field Type**: Repeater
- **Required**: No
- **Description**: Container specifications

**Sub-fields for Container Specifications:**
- **Field Name**: `size_name`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Size name (e.g., "20ft Standard Container")

- **Field Name**: `external_dimensions`
- **Field Type**: Text
- **Required**: Yes
- **Description**: External dimensions

- **Field Name**: `internal_dimensions`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Internal dimensions

- **Field Name**: `volume`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Volume in cubic feet

- **Field Name**: `empty_weight`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Empty weight in lbs

#### Delivery Information
- **Field Name**: `delivery_title`
- **Field Type**: Text
- **Required**: No
- **Default**: "Delivery Options in {location}"
- **Description**: Title for delivery section

- **Field Name**: `delivery_info`
- **Field Type**: Wysiwyg Editor
- **Required**: No
- **Description**: General delivery information

- **Field Name**: `delivery_methods`
- **Field Type**: Repeater
- **Required**: No
- **Description**: Available delivery methods

**Sub-fields for Delivery Methods:**
- **Field Name**: `method_name`
- **Field Type**: Text
- **Required**: Yes
- **Description**: Method name (e.g., "Tilt-bed truck")

- **Field Name**: `method_description`
- **Field Type**: Textarea
- **Required**: Yes
- **Description**: Method description

- **Field Name**: `best_for`
- **Field Type**: Text
- **Required**: No
- **Description**: Best use cases for this method

- **Field Name**: `delivery_timeframe`
- **Field Type**: Text
- **Required**: No
- **Description**: Standard delivery timeframe

- **Field Name**: `expedited_delivery`
- **Field Type**: True/False
- **Required**: No
- **Description**: Whether expedited delivery is available

- **Field Name**: `expedited_text`
- **Field Type**: Textarea
- **Required**: No
- **Description**: Expedited delivery information

### Field Group 9: FAQ Section

#### FAQ Items Repeater Field
- **Field Name**: `faq_items`
- **Field Type**: Repeater
- **Required**: No
- **Description**: Frequently asked questions

**Sub-fields for FAQ Items:**
- **Field Name**: `faq_question`
- **Field Type**: Text
- **Required**: Yes
- **Description**: FAQ question text

- **Field Name**: `faq_answer`
- **Field Type**: Wysiwyg Editor
- **Required**: Yes
- **Description**: FAQ answer text

### Field Group 10: CTA Sections

#### Mid-Page CTA
- **Field Name**: `mid_cta_headline`
- **Field Type**: Text
- **Required**: No
- **Default**: "Ready to Buy a Shipping Container in {location}?"
- **Description**: Mid-page CTA headline

- **Field Name**: `mid_cta_subheadline`
- **Field Type**: Textarea
- **Required**: No
- **Description**: Mid-page CTA subheadline

- **Field Name**: `mid_cta_primary_text`
- **Field Type**: Text
- **Required**: No
- **Default**: "Call Now: (555) 123-4567"
- **Description**: Primary CTA button text

- **Field Name**: `mid_cta_secondary_text`
- **Field Type**: Text
- **Required**: No
- **Default**: "Request Callback"
- **Description**: Secondary CTA button text

#### Final CTA
- **Field Name**: `final_cta_headline`
- **Field Type**: Text
- **Required**: No
- **Default**: "Need a Shipping Container in {location} Today?"
- **Description**: Final CTA headline

- **Field Name**: `final_cta_subheadline`
- **Field Type**: Textarea
- **Required**: No
- **Description**: Final CTA subheadline

- **Field Name**: `final_cta_primary_text`
- **Field Type**: Text
- **Required**: No
- **Default**: "Call (555) 123-4567"
- **Description**: Final primary CTA text

- **Field Name**: `final_cta_secondary_text`
- **Field Type**: Text
- **Required**: No
- **Default**: "Email Us"
- **Description**: Final secondary CTA text

### Field Group 11: SEO & Metadata

#### SEO Fields
- **Field Name**: `seo_title`
- **Field Type**: Text
- **Required**: No
- **Description**: Meta title for SEO

- **Field Name**: `seo_description`
- **Field Type**: Textarea
- **Required**: No
- **Description**: Meta description for SEO

- **Field Name**: `focus_keywords`
- **Field Type**: Text
- **Required**: No
- **Description**: Comma-separated focus keywords

- **Field Name**: `local_business_schema`
- **Field Type**: True/False
- **Required**: No
- **Default**: true
- **Description**: Include local business schema

- **Field Name**: `service_area_schema`
- **Field Type**: Textarea
- **Required**: No
- **Description**: JSON-LD for service area schema

- **Field Name**: `geo_coordinates`
- **Field Type**: Text
- **Required**: No
- **Description**: Latitude,longitude coordinates

## Usage Instructions

### 1. WordPress Setup
1. Install and activate Advanced Custom Fields Pro
2. Create field groups as specified above
3. Create a custom post type called "Location Pages"
4. Assign the field groups to the custom post type

### 2. Content Entry
1. Create a new "Location Page" for each location
2. Fill in the fields with location-specific information
3. Use the repeater fields to add multiple items where needed
4. Ensure all location-specific placeholders ({location}) are properly handled

### 3. Astro Frontend Integration
1. Set up Astro to fetch data from WordPress REST API
2. Create dynamic routes for location pages
3. Map ACF fields to Astro template components
4. Implement proper SEO meta tags and schema markup

### 4. Bulk Generation
1. Use the field structure to create CSV templates
2. Import location data in bulk using WP All Import or similar
3. Generate location-specific content using AI tools
4. Ensure content uniqueness while maintaining structure

## Template Structure Mapping

The ACF fields map to the following template sections:

- **Hero Section**: `hero_*` fields
- **Introduction**: `intro_*` fields
- **Benefits**: `benefits_section` repeater
- **Popular Uses**: `popular_uses_section` repeater
- **Products**: `container_products` repeater
- **Detailed Info**: `container_grades`, `container_specs`, `delivery_*` fields
- **FAQ**: `faq_items` repeater
- **CTA Sections**: `mid_cta_*` and `final_cta_*` fields
- **SEO**: `seo_*` fields and schema fields

This structure allows for complete customization of each location page while maintaining consistent design and SEO optimization across all locations.