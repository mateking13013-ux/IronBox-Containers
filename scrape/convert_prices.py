#!/usr/bin/env python3
"""Convert all ZAR prices in src/data/products.json to USD at 0.054 rate.
Skips trailers (they're already USD)."""
import json, pathlib, re

ROOT = pathlib.Path(__file__).parent.parent
PFILE = ROOT / "src" / "data" / "products.json"
RATE = 0.054

def cv(v):
    if v is None or v == "":
        return v
    try:
        f = float(v) * RATE
        # Round to nearest $5 for cleaner USD prices on container items
        f = round(f / 5) * 5
        return f"{f:.2f}"
    except (ValueError, TypeError):
        return v

data = json.loads(PFILE.read_text())
trailer_cat_slugs = {"utility-trailers", "livestock-trailers", "flatbed-trailers"}

n_converted = 0
for p in data:
    cats = {c.get("slug","") for c in p.get("categories", [])}
    if cats & trailer_cat_slugs:
        continue
    for k in ("price", "regular_price", "sale_price"):
        old = p.get(k)
        new = cv(old)
        if new != old:
            p[k] = new
    n_converted += 1

PFILE.write_text(json.dumps(data, indent=2))
print(f"converted {n_converted} container products to USD at rate {RATE}")
