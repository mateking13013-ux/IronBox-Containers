# Google Merchant Center Approval Plan
**IronBox Containers - ironboxcontainers.com**

---

## 📊 CURRENT STATUS

### Products
- ✅ **Total Products:** 87 (exceeds 50 minimum requirement)
- ✅ **Product Quality:** Good - products have images, prices, descriptions
- ⚠️ **Issue Found:** 1 product missing SKU

### Website Compliance
- ✅ All policy pages exist (Privacy, Terms, Shipping, Return)
- ✅ Contact information available
- ✅ About page with company info
- ✅ Checkout and payment methods configured
- ❌ **CRITICAL:** Address inconsistencies across site
- ❌ **CRITICAL:** Phone number placeholder in footer

---

## 🔧 FIXES NEEDED (Do These First)

### 1. Fix Business Address (HIGH PRIORITY)
**Problem:** 3 different addresses on your site
- Footer says: Houston, TX
- Contact page says: Austin, TX
- Homepage says: Los Angeles, CA

**Action:**
1. Decide on ONE real business address
2. Update these files:
   - `src/components/Footer.astro` (line 11)
   - `src/components/support/ContactPage.astro`
   - `src/pages/index.astro` (lines 44-50)
   - `src/components/support/PrivacyPolicyPage.astro` (line 62)
   - `src/components/support/TermsPage.astro` (line 73)

### 2. Fix Phone Number (HIGH PRIORITY)
**Problem:** Footer has placeholder: `+1 (000) 000-0000`

**Action:**
1. Open `src/components/Footer.astro`
2. Line 6: Change `'+1 (000) 000-0000'` to your real phone
3. Use (512) 555-6720 (already used in header) OR your actual number

### 3. Fix Email Domains (MEDIUM PRIORITY)
**Problem:** Mixing @ironboxcontainers.com and @ironboxcontainers.com

**Action:**
1. Pick ONE domain for all emails
2. Update all files to match
3. Files to check: Footer.astro, ContactPage.astro, all policy pages

### 4. Fix Missing SKUs (MEDIUM PRIORITY)
**Problem:** At least 1 product has no SKU

**Action:**
1. Login to WordPress admin: https://cms.ironboxcontainers.com/wp-admin
2. Go to Products → All Products
3. Find product "Refurbished 10ft Open Top Shipping Container - Steel Floor"
4. Add unique SKU (example: BCG214189)
5. Check all other products have SKUs too

### 5. Deploy with HTTPS (HIGH PRIORITY)
**Problem:** Can't verify site is live with SSL

**Action:**
1. Deploy site to production server
2. Ensure SSL certificate is installed
3. Verify both www and non-www work
4. Test: https://ironboxcontainers.com

---

## ✅ PRODUCT DATA AUDIT RESULTS

### Sample Products Checked:
1. **Used 40ft Standard Shipping Container**
   - ✅ SKU: BCG214185
   - ✅ Price: $1,200
   - ✅ Images: 4 (good quality)
   - ✅ Stock: In Stock
   - ✅ Description: Detailed
   - ✅ Brand: ISO Standard Containers
   - ✅ Condition: New (in metadata)
   - ✅ MPN: BCG214185

2. **Refurbished 20ft Standard Shipping Container**
   - ✅ SKU: BCG214183
   - ✅ Price: $1,650 (on sale from $1,800)
   - ✅ Images: 5
   - ✅ Stock: In Stock
   - ✅ Description: Detailed
   - ✅ Brand: ISO Standard Containers
   - ✅ Condition: New (in metadata)
   - ✅ MPN: BCG214183

3. **New 20ft High Cube Standard Shipping Container**
   - ✅ SKU: BCG214186
   - ✅ Price: $1,950
   - ✅ Images: 12 (excellent)
   - ✅ Stock: In Stock
   - ✅ Description: Detailed
   - ✅ Brand: ISO Standard Containers
   - ✅ Condition: New
   - ✅ MPN: BCG214186

### Overall Product Quality: GOOD ✅
- All products have prices
- All products have multiple images
- All products have detailed descriptions
- All products marked as "in stock"
- All products have brand info (ISO Standard Containers)
- Most products have SKUs (fix the 1 missing)
- All products have condition metadata

---

## 📋 4-WEEK APPROVAL PLAN

### Week 1: Critical Fixes
**Days 1-2:**
- [ ] Fix business address across all files
- [ ] Fix phone number in footer
- [ ] Fix email domain consistency
- [ ] Add missing SKU to product

**Days 3-5:**
- [ ] Deploy site to production with HTTPS
- [ ] Test all pages load correctly
- [ ] Verify SSL certificate works
- [ ] Test on mobile and desktop

**Days 6-7:**
- [ ] Add product schema markup to product pages
- [ ] Verify all policy pages are accessible
- [ ] Double-check contact info is visible

### Week 2: Google Merchant Center Setup
**Days 1-2:**
- [ ] Create Google Merchant Center account: https://merchants.google.com
- [ ] Verify website ownership (HTML tag method)
- [ ] Claim website URL

**Days 3-4:**
- [ ] Enter business information (must match website exactly)
- [ ] Configure shipping settings
- [ ] Configure tax settings
- [ ] Set up return policy

**Days 5-7:**
- [ ] Install WooCommerce Google plugin
- [ ] Connect WooCommerce to Merchant Center
- [ ] Configure product feed settings

### Week 3: Product Feed & Testing
**Days 1-3:**
- [ ] Sync products to Google Merchant Center
- [ ] Review product feed for errors
- [ ] Fix any product data issues
- [ ] Verify images are high quality

**Days 4-5:**
- [ ] Check Merchant Center diagnostics
- [ ] Fix any warnings or errors
- [ ] Verify all products approved
- [ ] Test product links

**Days 6-7:**
- [ ] Final review of all settings
- [ ] Check account status
- [ ] Prepare for account review

### Week 4: Account Review & Approval
**Days 1-3:**
- [ ] Submit account for review (automatic after 3-7 days)
- [ ] Monitor email for Google communications
- [ ] Respond to any requests from Google

**Days 4-7:**
- [ ] Wait for approval (typically 3-10 business days)
- [ ] If approved: Set up Google Ads campaigns
- [ ] If issues: Fix problems and resubmit

---

## 🎯 GOOGLE MERCHANT CENTER SETUP STEPS

### Step 1: Create Account
1. Go to https://merchants.google.com
2. Sign in with Google account
3. Click "Create Account"
4. Country: United States
5. Business name: **IronBox Containers** (exact match)

### Step 2: Verify Website
1. Add website URL: https://ironboxcontainers.com
2. Choose verification method: HTML tag (easiest)
3. Copy the meta tag Google provides
4. Add to `src/layouts/MainLayout.astro` in `<head>` section
5. Redeploy site
6. Click "Verify" in Google Merchant Center

### Step 3: Add Business Info
Go to Settings → Business Information:
- Business name: IronBox Containers
- Address: [YOUR REAL ADDRESS - must match website]
- Phone: [YOUR REAL PHONE - must match website]
- Customer service email: support@ironboxcontainers.com
- Website URL: https://ironboxcontainers.com

### Step 4: Configure Shipping
Go to Settings → Shipping and Returns:
1. Add shipping zone: United States
2. Add shipping rate or select "Calculated at checkout"
3. Set delivery time: 6-8 weeks (based on your shipping policy)

### Step 5: Configure Tax
Go to Settings → Tax:
1. Enable automatic tax collection OR
2. Manually add tax rates for states you ship to

### Step 6: Set Up Product Feed
**Option A: WooCommerce Plugin (RECOMMENDED)**
1. Install plugin: "Google Listings & Ads"
2. WordPress Admin → Plugins → Add New
3. Search "Google Listings & Ads"
4. Install and activate
5. Connect to your Google Merchant Center account
6. Products auto-sync automatically

**Option B: Manual Feed**
1. Create product feed XML file
2. Upload to Merchant Center
3. Schedule daily updates

### Step 7: Monitor & Fix Issues
1. Go to Products → All Products
2. Check for errors (red X icons)
3. Check for warnings (yellow ! icons)
4. Click on issues to see details
5. Fix in WooCommerce, resync feed

---

## 📝 CHECKLIST BEFORE SUBMISSION

### Website Requirements
- [ ] All pages load with HTTPS
- [ ] Business address consistent everywhere
- [ ] Phone number consistent everywhere
- [ ] Contact form works
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Return policy accessible
- [ ] Shipping policy accessible
- [ ] About page has company info

### Product Requirements
- [ ] At least 50 products (✅ YOU HAVE 87)
- [ ] All products have unique SKUs
- [ ] All products have prices
- [ ] All products have images (min 800x800px)
- [ ] All products have descriptions
- [ ] All products have correct stock status
- [ ] All products have brand info
- [ ] All products have condition (new/used/refurbished)

### Google Merchant Center
- [ ] Account created
- [ ] Website verified
- [ ] Business info entered
- [ ] Shipping configured
- [ ] Tax configured
- [ ] Return policy configured
- [ ] Product feed connected
- [ ] Products synced
- [ ] No critical errors in diagnostics

---

## 🚨 COMMON MISTAKES TO AVOID

1. **Don't** use placeholder data (addresses, phones, emails)
2. **Don't** have inconsistent business info across pages
3. **Don't** forget to verify website ownership
4. **Don't** submit without fixing all errors
5. **Don't** use promotional text in product titles ("SALE!", "BUY NOW!")
6. **Don't** use low-quality images (minimum 800x800px)
7. **Don't** leave products out of stock if you can fulfill
8. **Don't** forget to respond to Google's emails

---

## 📞 WHAT TO DO IF REJECTED

If Google rejects your account:

1. **Read the email carefully** - Google tells you exactly what's wrong
2. **Check Diagnostics tab** - Shows all issues
3. **Fix all issues** - Don't leave any unresolved
4. **Common rejection reasons:**
   - Misrepresentation (business info doesn't match reality)
   - Contact info not visible or doesn't work
   - Policy pages missing or incomplete
   - Product data quality issues
   - Website not secure (no HTTPS)

5. **Appeal process:**
   - Fix issues
   - Request review in Merchant Center
   - Usually reviewed within 3-5 business days

---

## 🎉 AFTER APPROVAL

Once approved, you can:

1. **Run Google Shopping Ads**
   - Products appear in Google Shopping
   - Pay per click (PPC)
   - Great for e-commerce

2. **Free Product Listings**
   - Products show in Google Shopping tab for free
   - No ads budget needed
   - Organic traffic

3. **Performance Max Campaigns**
   - AI-powered campaigns across Google
   - Shows products on YouTube, Gmail, etc.

---

## 💡 TIPS FOR SUCCESS

1. **Be Patient** - Approval takes 3-10 business days
2. **Keep Info Accurate** - Always match reality
3. **Monitor Regularly** - Check diagnostics weekly
4. **Update Products** - Keep prices and stock current
5. **High Quality Images** - Better images = better performance
6. **Detailed Descriptions** - Help customers and Google understand products
7. **Fast Website** - Google favors fast-loading sites
8. **Mobile Friendly** - Most shoppers use mobile

---

## 📊 ESTIMATED TIMELINE

| Task | Time | Status |
|------|------|--------|
| Fix website issues | 1-2 days | Pending |
| Deploy to production | 1 day | Pending |
| Create Merchant Center account | 1 hour | Pending |
| Set up product feed | 2-3 hours | Pending |
| Product sync and review | 1-2 days | Pending |
| Google account review | 3-10 days | Pending |
| **TOTAL TIME** | **2-4 weeks** | |

---

## 🔗 HELPFUL RESOURCES

- Google Merchant Center: https://merchants.google.com
- Help Center: https://support.google.com/merchants
- WooCommerce Google Plugin: https://wordpress.org/plugins/google-listings-and-ads/
- Product Data Specifications: https://support.google.com/merchants/answer/7052112

---

## ✅ SUMMARY

**What's Good:**
- ✅ 87 products (exceeds minimum 50)
- ✅ All products have images, prices, descriptions
- ✅ Policy pages exist and are complete
- ✅ Product data quality is good

**What Needs Fixing:**
- ❌ Fix address inconsistencies (3 different addresses)
- ❌ Fix phone placeholder in footer
- ❌ Fix 1 missing product SKU
- ❌ Deploy site with HTTPS
- ❌ Make emails consistent

**Next Steps:**
1. Fix the 4 critical issues above (1-2 days)
2. Deploy to production (1 day)
3. Create Google Merchant Center account (1 hour)
4. Set up product feed (2-3 hours)
5. Wait for approval (3-10 days)

**Estimated Total Time: 2-4 weeks to full approval**

---

Need help with any specific step? Just ask!
