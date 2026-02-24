# Google Merchant Center & WordPress Setup Checklist

This checklist ensures your Google Merchant Center (GMC) and WordPress backend settings perfectly align with your website's policies to guarantee approval.

---

## 🛍️ Part 1: Google Merchant Center Settings

Log in to [Google Merchant Center](https://merchants.google.com/) and configure the following exactly as written below. **Consistency is key.**

### 1. Business Information
*   **Business Name:** Nunes Tiny Homes
*   **Address:**
    *   410 E Airport Fwy
    *   Irving, TX 75062
    *   United States
*   **Phone Number:** +1 (415) 625-3493 (Must be verified via voice/text)
*   **Customer Service Contact:**
    *   Email: support@nunestinyhomes.com
    *   URL: https://nunestinyhomes.com/contact

### 2. Website Claiming
*   **Website URL:** https://nunestinyhomes.com
*   **Verification:** Use the "HTML Tag" method or Google Analytics method since you have the code on your site.

### 3. Shipping & Returns (CRITICAL)
*   **Shipping Service:**
    *   **Name:** Standard Freight
    *   **Service Area:** United States (001)
    *   **Order Cutoff Time:** 5:00 PM (CST)
    *   **Handling Time:** 1 - 2 days (Mon-Fri)
    *   **Transit Time:** 4 - 8 days (Mon-Fri)
    *   **Total Delivery Time:** This aligns with your "5-10 business days" policy.
*   **Shipping Rates:**
    *   Create a single rate table.
    *   **Condition:** All orders.
    *   **Rate:** Flat rate **$300.00** USD.
*   **Return Policy:**
    *   **Return Window:** 30 days.
    *   **Customer Responsibility:** Customer pays return shipping.
    *   **Restocking Fee:** Fixed amount or Percentage (Set to **15%**).
    *   **Return Address:** 410 E Airport Fwy, Irving, TX 75062.

### 4. Sales Tax
*   **Settings:**
    *   Go to "Sales Tax".
    *   Select "Configure tax settings".
    *   Add **Texas** (since you have a physical presence there).
    *   You may choose "Google-determined sales tax" for other states if you have nexus, otherwise ensure Texas is set up.

---

## 📝 Part 2: WordPress / WooCommerce Backend

Your product feed comes from here. These settings must match the frontend to avoid "Mismatched Value" errors.

### 1. General Settings
*   **Site Title:** Nunes Tiny Homes
*   **Address:** Ensure the WooCommerce store address matches the GMC address above.

### 2. Product Data (For Every Product)
*   **Price:** Must match the price displayed on the frontend exactly.
*   **Stock Status:**
    *   Manage Stock: **Yes**
    *   Stock Status: **In Stock** (Do not submit "Out of Stock" items to GMC).
*   **Attributes (Required for Feed):**
    *   **Brand:** Nunes Tiny Homes
    *   **Condition:** New (or Used, if applicable - must be explicit).
    *   **MPN / SKU:** Ensure every product has a unique SKU (e.g., `CONT-20-STD`).
    *   **GTIN/UPC:** If you have them, add them. If not, set "Identifier Exists" to **No** in your feed plugin.

### 3. Feed Plugin Settings (e.g., Product Feed PRO)
*   **Title:** Map to `Product Name`.
*   **Description:** Map to `Product Description` (Clean HTML).
*   **Link:** Map to `Parent Product URL`.
*   **Image:** Map to `Main Image`.
*   **Availability:** Map to `Stock Status`.
*   **Price:** Map to `Regular Price` (or Sale Price if active).
*   **Shipping Label:** (Optional) If you have different shipping rules for different products, map this. Otherwise, leave blank and rely on GMC settings.

---

## 🚀 Part 3: Final Pre-Submission Verification

Before clicking "Request Review" in Merchant Center:

1.  **[ ] Visual Match:** Open a product page on your site and the same product in GMC. Do the Price, Title, and Image match 100%?
2.  **[ ] Checkout Test:** Add an item to cart and go to checkout.
    *   Does the shipping show **$300.00**?
    *   Is the total calculation correct?
3.  **[ ] Footer Check:** Is the address and phone number visible on the checkout page? (It is in your footer, so yes).
4.  **[ ] Policy Links:** Click the links in your footer. Do they all open the correct pages?

**Once all boxes are checked, submit your feed and request the review!**
