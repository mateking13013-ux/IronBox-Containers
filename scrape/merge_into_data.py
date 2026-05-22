#!/usr/bin/env python3
"""Merge trailer products + categories into src/data/{products,categories}.json.
Idempotent: removes existing trailer entries before re-inserting."""
import json, pathlib

ROOT = pathlib.Path(__file__).parent.parent
PFILE = ROOT / "src" / "data" / "products.json"
CFILE = ROOT / "src" / "data" / "categories.json"
TFILE = ROOT / "scrape" / "trailers.json"

trailer_cat_slugs = {"utility-trailers", "livestock-trailers", "flatbed-trailers"}

trailers = json.loads(TFILE.read_text())
products = json.loads(PFILE.read_text())
categories = json.loads(CFILE.read_text())

# Remove any existing trailer products (so re-runs are clean)
products = [p for p in products
            if not (set(c.get("slug","") for c in p.get("categories", [])) & trailer_cat_slugs)]

# Append new trailers
products.extend(trailers)
PFILE.write_text(json.dumps(products, indent=2))

# Categories
categories = [c for c in categories if c["slug"] not in trailer_cat_slugs]
counts = {"utility-trailers": 0, "livestock-trailers": 0, "flatbed-trailers": 0}
covers = {}
for t in trailers:
    s = t["categories"][0]["slug"]
    counts[s] += 1
    if s not in covers and t.get("images"):
        covers[s] = t["images"][0]["src"]

new_cats = [
    {"id": 100, "name": "Utility Trailers", "slug": "utility-trailers",
     "description": "Built-tough utility trailers for everyday hauling — open-deck steel construction, 7K–14K GVWR.",
     "count": counts["utility-trailers"],
     "image": {"src": covers.get("utility-trailers", "")}},
    {"id": 101, "name": "Livestock Trailers", "slug": "livestock-trailers",
     "description": "Steel stock and gooseneck livestock trailers built for safe cattle and animal transport.",
     "count": counts["livestock-trailers"],
     "image": {"src": covers.get("livestock-trailers", "")}},
    {"id": 102, "name": "Flatbed Trailers", "slug": "flatbed-trailers",
     "description": "Deck-over and gooseneck flatbed trailers for equipment, building materials, and heavy hauling.",
     "count": counts["flatbed-trailers"],
     "image": {"src": covers.get("flatbed-trailers", "")}},
]
categories.extend(new_cats)
CFILE.write_text(json.dumps(categories, indent=2))

print(f"products.json: now {len(products)} items")
print(f"categories.json: now {len(categories)} items (trailers added: {counts})")
