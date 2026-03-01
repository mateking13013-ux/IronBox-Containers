# Headless Commerce Rebuild PRD (Astro + WordPress)

## Project Overview
- Build a new headless commerce experience with Astro (frontend) powered by WordPress + WooCommerce (headless backend).
- Match current IronBox Containers storefront journey while improving performance, maintainability, and Google Merchant Center (GMC) compliance.
- Store all business data (products, categories, policies, media, reviews) in WordPress; expose via WPGraphQL for Astro consumption.
- Integrate AI-assisted workflows to generate and refresh compliant product content and maintain GMC approval status.

## Goals & Success Metrics
- Launch Astro site with parity to the existing customer journey (home, catalog, product, cart/checkout handoff, contact, legal pages).
- Achieve clean `npm run build` in Astro and Lighthouse scores ≥90 for Performance and Best Practices on key pages.
- Automate ≥80% of product copy (title, description, feature bullets) via AI while satisfying GMC requirements; zero policy disapprovals for mandatory product attributes.

## Scope
- **In scope:** Front-of-house UX, headless API integration, AI content pipeline, GMC diagnostics, analytics, accessibility, deployment automation.
- **Out of scope:** Supabase services, current Next.js implementation, PSEO tooling, non-commerce admin consoles.

## System Architecture
- Astro app hosted on Vercel (or comparable) using static generation with targeted serverless endpoints for dynamic needs (cart, diagnostics, AI triggers).
- WordPress + WooCommerce hosted separately (managed WP recommended) with WPGraphQL/WooGraphQL and custom REST endpoints for AI + GMC services.
- CDN (Cloudflare or host-provided) in front of WordPress media for low-latency asset delivery.
- Optional worker (e.g., Cloudflare Worker/AWS Lambda) for scheduled AI refresh and feed validation jobs.

## Functional Requirements
- **Home page:** Hero, featured collections, testimonials, trust badges, primary CTA; content blocks managed via WP custom fields.
- **Catalog (`/shop`, `/categories/[slug]`, `/brands/[slug]`):** Server-rendered listing with filters (category, price, stock, rating), pagination, sorting; data retrieved via WPGraphQL.
- **Product detail (`/products/[slug]`):** AI-generated descriptions/specifications, gallery, pricing, stock, shipping info, review summary, structured data, add-to-cart CTA.
- **Cart (`/cart`):** Astro island managing cart via WooCommerce Store API; display shipping calculations, subtotal, policy notices.
- **Checkout handoff:** Capture shipping method selection and hand off to WooCommerce checkout or external processor.
- **Account area (`/account`, `/account/orders`):** Authentication, order history, downloads; leverage WooCommerce/WordPress auth tokens.
- **Support pages:** Contact, About, FAQs, Financing, Shipping Policy, Return Policy, Privacy Policy, Terms of Service, Accessibility Statement.
- **SEO assets:** `sitemap.xml`, `robots.txt`, RSS feed, Google Merchant product feed endpoint generated from WordPress data.
- **Header/Footer:** Dynamic menus, contact info, payment badges (only if configured), legal links, newsletter signup.

## AI & GMC Compliance
- **`ai-product-enhancer` WordPress plugin:**
  - Generates product titles, descriptions, feature bullets, materials, warranty text using OpenAI/Anthropic APIs.
  - Validates mandatory GMC attributes (brand, GTIN/MPN, availability, price, condition) before publishing.
  - Stores AI output in post meta with manual override flags and audit trail.
- **GMC diagnostics service:**
  - Scheduled job checks catalog for GMC compliance (images, shipping/tax, contact info), storing reports in WordPress for Astro admin view.
- **Feed generator:**
  - WooCommerce feed plugin (e.g., WooCommerce Google Product Feed or Product Feed Pro) produces the GMC-compliant XML feed directly in WordPress; expose the feed URL and last-updated metadata to Astro via WPGraphQL/REST for monitoring.
- **Approval dashboard:**
  - Astro `/admin/gmc` page showing pass/fail metrics, AI generation logs, manual action queue.

## Content & Policy Requirements
- Accurate business contact info editable in WordPress settings; consumed by header/footer and structured data.
- Detailed shipping & return policies in dedicated pages, using actual WooCommerce shipping zones/rates.
- Contact methods (phone, email, physical address) visible site-wide (footer) and on Contact page per GMC policy.
- Payment badges displayed only when corresponding gateway is active in WooCommerce.
- Legal pages show last-updated timestamps from WordPress.
- Accessibility statement referencing WCAG 2.1 AA commitments.

## Data Model (WordPress)
- WooCommerce products extended with custom fields: `ai_generated_title`, `ai_generated_description`, `shipping_lead_time`, `warranty_text`, `compliance_status`.
- Taxonomies: default `product_cat`, `product_tag`, plus custom `product_use_case` as needed.
- Media library used for product galleries and marketing assets; alt text required.
- Pages leverage ACF or block-based field groups for hero content, CTAs, trust ribbons.

## Integrations
- WPGraphQL / WooGraphQL for product/catalog/cart/checkout flows.
- WordPress REST API for AI write-backs (media uploads, product updates) and webhooks.
- WooCommerce payment gateways (Stripe, PayPal, manual) surfaced dynamically in Astro.
- Google Tag Manager for analytics, with server-side purchase events handled via Astro API route.
- Email marketing integration (e.g., Mailchimp) through WordPress plugin and Astro form endpoint.

## Accessibility & UX
- WCAG 2.1 AA compliance: keyboard navigation, focus states, ARIA labels, contrast controls.
- Support theme switching (light/dark) via CSS variables controlled by WordPress settings.
- Mobile-first responsive design with performance budgets (<100 kB critical CSS/JS per page).

## Performance Targets
- First Contentful Paint <1.5 s on 4G for key pages; use Astro static generation where possible.
- Astro Islands for interactive components (cart, filters) while keeping global JS minimal.
- Lazy-load non-critical scripts and defer analytics until after first paint.
- Optimize images through Astro `<Image>` component and WordPress CDN.

## SEO & Metadata
- Astro layout consumes WP SEO fields for meta tags, canonical URLs, and OpenGraph/Twitter data.
- JSON-LD for Organization, Product, Breadcrumb, FAQ, and Reviews markup.
- Redirect mapping from legacy Next.js routes if URL structure changes.
- Ensure noindex for staging environments via environment-specific configuration.

## Analytics & Monitoring
- Google Tag Manager with client and server events.
- Sentry (or similar) for Astro and API error monitoring.
- Uptime checks for both the Astro frontend and WordPress API endpoint.

## Testing Strategy
- Unit tests with Vitest for utilities and data mappers.
- Integration tests with Playwright covering browse → product → cart → checkout handoff flows.
- Lighthouse CI in CI/CD pipeline for performance and accessibility regression tracking.
- Automated GMC feed validation script as part of release checklist.
- Manual QA covering policy pages, contact info accuracy, and accessibility audits pre-launch.

## Project Delivery Plan
- **Phase 1:** Environment setup (WordPress, Astro scaffold, CI/CD, WPGraphQL/WooGraphQL configuration).
- **Phase 2:** Data & AI integration (AI plugin, GraphQL schema, feed diagnostics).
- **Phase 3:** UI rebuild (component library, layout, core pages).
- **Phase 4:** Commerce flows (cart, checkout handoff, account area).
- **Phase 5:** Compliance & feeds (GMC dashboard, structured data, policies).
- **Phase 6:** Testing, optimization, launch readiness (Lighthouse, QA, SEO checks).
- Weekly milestones with demo deliverables per phase.

## Coding Standards & Rules
- No source file >500 lines; refactor into smaller modules/components when necessary.
- Enforce Prettier + ESLint (Astro + TypeScript) via CI gate.
- TypeScript strict mode enabled; GraphQL queries typed via code generation.
- Commit convention `type(scope): summary` (e.g., `feat(shop): add price filters`).
- Document reusable components (props, data dependencies) in Storybook or Astro docs.
- Manage secrets via `.env` files with `.env.example` template; never commit secrets.

## Deployment & Operations
- GitHub Actions pipeline: lint → tests → build preview → Lighthouse checks.
- Astro deployed to Vercel; WordPress content updates trigger rebuild via webhook.
- Monitor WordPress API latency; display fallback messaging in Astro when API unavailable.

## Open Questions
- Confirm WooCommerce checkout vs external payment processor workflow.
- Select AI provider(s) and establish token/usage budget plus manual override process.
- Choose CDN strategy for WordPress media (Cloudflare, host-provided, etc.).
- Determine WordPress hosting provider (affects plugin availability, cron reliability).
