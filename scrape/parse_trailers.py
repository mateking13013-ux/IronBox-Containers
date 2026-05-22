#!/usr/bin/env python3
"""Parse 29 trailer HTML files and emit trailers.json + image manifest.
Also rewrites descriptions in our own voice (not copying source text)."""
import re, json, os, html as htmllib, pathlib, sys

ROOT = pathlib.Path(__file__).parent
HTML_DIR = ROOT / "html"
OUT_JSON = ROOT / "trailers.json"
IMG_MANIFEST = ROOT / "images_manifest.tsv"

CAT_MAP = {
    "utility": ("utility-trailers", "Utility Trailers", 100),
    "livestock": ("livestock-trailers", "Livestock Trailers", 101),
    "flatbed": ("flatbed-trailers", "Flatbed Trailers", 102),
}

def unescape(s):
    return htmllib.unescape(s).replace("\\u0027", "'").replace("\\u0022", '"').replace("\\u0026", "&")

def slugify(s):
    s = s.lower()
    s = re.sub(r"&\w+;", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:80]

def parse_dims(desc, name):
    """Extract length, width, height/GVWR from description/name."""
    dims = {"length": "", "width": "", "height": ""}
    # GVWR / weight
    m = re.search(r"([\d,]+)\s*lb\.?\s*G\.?V\.?W\.?R\.?", desc, re.I)
    weight = m.group(1).replace(",", "") if m else ""
    # Try to find dimensions from name like "83X16" or "16X6" or "8X30"
    m = re.search(r"(\d+)\s*[Xx]\s*(\d+(?:\.\d+)?)", name)
    if m:
        a, b = m.groups()
        # In trailer notation usually width x length when first num is in inches and second in feet
        # We'll just store as label
        dims["width"] = a
        dims["length"] = b
    return dims, weight

REWRITE_INTROS = {
    "utility": "Built for everyday hauling and jobsite work, this {year} {brand} utility trailer combines tough steel construction with the towing capacity you need to get the job done.",
    "livestock": "This {year} {brand} livestock trailer is purpose-built for safe, comfortable transport of cattle and other livestock — heavy-duty steel framing with proper ventilation and protection from the elements.",
    "flatbed": "A heavy-duty {year} {brand} flatbed trailer engineered for hauling equipment, building materials, and oversized loads with confidence.",
}

def extract_bullets(raw_desc):
    """Pull the bullet-point standard features out of the source description."""
    # split on the common bullet markers
    parts = re.split(r"\s*•\s*", raw_desc)
    parts = [p.strip() for p in parts if p.strip()]
    # First part is usually a free-text lead — drop it
    if len(parts) > 1:
        return parts[1:]
    return []

def rewrite_description(category, name, raw_desc):
    # Pull year + brand from name
    yr = re.match(r"(\d{4})", name)
    year = yr.group(1) if yr else ""
    brand_m = re.search(r"\d{4}\s+([A-Za-z][A-Za-z0-9\- ]+?)(?:\s+\d|\s+USED|\s+[A-Z]{2,}|$)", name)
    brand = brand_m.group(1).strip() if brand_m else "factory-built"
    intro = REWRITE_INTROS[category].format(year=year, brand=brand)
    bullets = extract_bullets(raw_desc)
    bullet_html = ""
    if bullets:
        items = "".join(f"<li>{htmllib.escape(b)}</li>" for b in bullets[:25])
        bullet_html = f'<h3>Standard Features</h3><ul class="trailer-features">{items}</ul>'
    return (
        f"<p>{intro}</p>"
        "<p>Every trailer in our inventory is inspected and prepped before delivery. "
        "We can ship anywhere in the continental US — call us at <strong>+1 (940) 627-1717</strong> "
        "or use the form below for a freight quote and to confirm availability.</p>"
        f"{bullet_html}"
    )

def parse_file(path):
    raw = path.read_text(encoding="utf-8", errors="ignore")
    # JSON-LD block
    m = re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', raw, re.DOTALL)
    if not m:
        return None
    block = m.group(1).strip()
    try:
        data = json.loads(block)
    except json.JSONDecodeError as e:
        # cleanup stray escapes
        block2 = block.replace("\\'", "'")
        data = json.loads(block2)
    # category from filename prefix
    fname = path.stem  # e.g. utility__2027-east-texas-...
    cat_key, slug_part = fname.split("__", 1)
    # product id from slug (i12345 at end)
    pid_m = re.search(r"-i(\d+)$", slug_part)
    product_id = pid_m.group(1) if pid_m else ""

    name = unescape(data.get("name", ""))
    sku = data.get("sku", "")
    color = data.get("color", "")
    brand = data.get("brand", {}).get("name", "") if isinstance(data.get("brand"), dict) else ""
    raw_desc = unescape(data.get("description", ""))
    price = data.get("offers", {}).get("price", "")
    condition_url = data.get("offers", {}).get("itemCondition", "")
    is_used = "Used" in condition_url

    # gallery images: find all cloudfront URLs matching this product id
    img_pattern = re.compile(rf"https://d17qgzvii7d4wm\.cloudfront\.net/s3/img\.rv/\d+/i/{product_id}/o/[^\"']+\.(?:jpg|jpeg|png|webp)", re.I)
    images = []
    seen = set()
    for url in img_pattern.findall(raw):
        if url not in seen:
            seen.add(url)
            images.append(url)
    if not images and data.get("image"):
        images = [data["image"]]

    dims, gvwr = parse_dims(raw_desc, name)

    slug_full = slugify(f"trl-{slug_part[:60]}-{product_id}")
    return {
        "_cat_key": cat_key,
        "name": name,
        "slug": slug_full,
        "sku": sku or f"TRL-{product_id}",
        "color": color,
        "brand": brand,
        "raw_desc": raw_desc,
        "price": price,
        "is_used": is_used,
        "images": images,
        "dims": dims,
        "gvwr": gvwr,
        "product_id": product_id,
    }

def main():
    parsed = []
    for f in sorted(HTML_DIR.glob("*.html")):
        try:
            row = parse_file(f)
            if row:
                parsed.append(row)
        except Exception as e:
            print(f"FAIL {f.name}: {e}", file=sys.stderr)

    print(f"parsed {len(parsed)} products", file=sys.stderr)

    # Build product JSON in same shape as src/data/products.json
    out = []
    img_lines = []
    next_id = 1000  # safely above existing
    for p in parsed:
        cat_slug, cat_name, cat_id = CAT_MAP[p["_cat_key"]]
        pid = next_id; next_id += 1
        local_images = []
        for i, src in enumerate(p["images"][:8], start=1):
            ext = src.rsplit(".", 1)[-1].lower()
            if ext not in ("jpg", "jpeg", "png", "webp"):
                ext = "jpg"
            local_path = f"/images/products/{p['slug']}/{i}.{ext}"
            disk_path = f"public{local_path}"
            local_images.append({
                "id": pid * 100 + i,
                "src": local_path,
                "name": f"{i}.{ext}",
                "alt": p["name"],
                "original_url": src,
            })
            img_lines.append(f"{src}\t{disk_path}")
        new_desc = rewrite_description(p["_cat_key"], p["name"], p["raw_desc"])
        short = re.sub(r"<[^>]+>", " ", new_desc)
        short = re.sub(r"\s+", " ", short).strip()
        short = "<p>" + short[:240] + ("..." if len(short) > 240 else "") + "</p>"
        product = {
            "id": pid,
            "name": p["name"],
            "slug": p["slug"],
            "type": "simple",
            "status": "publish",
            "featured": False,
            "description": new_desc,
            "short_description": short,
            "sku": p["sku"],
            "price": p["price"] or "0.00",
            "regular_price": p["price"] or "0.00",
            "sale_price": "",
            "stock_status": "instock",
            "in_stock": True,
            "weight": p["gvwr"],
            "dimensions": p["dims"],
            "shipping_class": "trailer",
            "categories": [{"id": cat_id, "name": cat_name, "slug": cat_slug}],
            "tags": [
                {"id": 9001, "name": p["brand"], "slug": slugify(p["brand"])} if p["brand"] else None,
                {"id": 9002, "name": "Used" if p["is_used"] else "New", "slug": "used" if p["is_used"] else "new"},
            ],
            "images": local_images,
            "attributes": [
                {"name": "Color", "options": [p["color"]] if p["color"] else []},
                {"name": "Condition", "options": ["Used" if p["is_used"] else "New"]},
                {"name": "GVWR (lb)", "options": [p["gvwr"]] if p["gvwr"] else []},
            ],
        }
        product["tags"] = [t for t in product["tags"] if t]
        out.append(product)

    OUT_JSON.write_text(json.dumps(out, indent=2))
    IMG_MANIFEST.write_text("\n".join(img_lines))
    print(f"wrote {OUT_JSON} ({len(out)} products)", file=sys.stderr)
    print(f"wrote {IMG_MANIFEST} ({len(img_lines)} images)", file=sys.stderr)

if __name__ == "__main__":
    main()
