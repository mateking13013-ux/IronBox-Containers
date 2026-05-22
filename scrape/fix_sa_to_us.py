#!/usr/bin/env python3
"""Sweep all SA references → US, convert R-prefixed prices → USD."""
import re, pathlib, sys

ROOT = pathlib.Path(__file__).parent.parent
SRC = ROOT / "src"
RATE = 0.054

def fmt_usd(zar):
    n = float(zar) * RATE
    n = round(n / 5) * 5
    if n == 0:
        return "$0"
    s = f"{int(n):,}"
    return f"${s}"

def conv_r_comma(m):
    return fmt_usd(float(m.group(1).replace(",", "")))

def conv_r_plain(m):
    return fmt_usd(float(m.group(1)))

replacements_text = [
    # Address blocks (do these BEFORE generic city names)
    (r"15 Electron Avenue, Isando, Kempton Park, Gauteng, 1600", "2401 S US-287, Decatur, TX 76234"),
    (r"15 Electron Avenue, Isando", "2401 S US-287"),
    (r"Kempton Park, Gauteng, 1600", "Decatur, TX 76234"),
    (r"Kempton Park, Gauteng", "Decatur, Texas"),
    (r"\bIsando\b", "Decatur"),
    (r"\bKempton Park\b", "Decatur"),
    # Cities & provinces
    (r"\bJohannesburg\b", "Houston"),
    (r"\bCape Town\b", "Dallas"),
    (r"\bDurban\b", "Atlanta"),
    (r"\bPretoria\b", "Fort Worth"),
    (r"\bSandton\b", "Plano"),
    (r"\bGauteng\b", "Texas"),
    (r"\bWestern Cape\b", "California"),
    (r"\bKwaZulu[- ]Natal\b", "Georgia"),
    (r"\bEastern Cape\b", "Florida"),
    (r"\bFree State\b", "Oklahoma"),
    (r"\bMpumalanga\b", "Louisiana"),
    (r"\bLimpopo\b", "Alabama"),
    (r"\bNorthern Cape\b", "New Mexico"),
    # Legal/financial
    (r"IronBox Containers \(Pty\) Ltd", "IronBox Containers & Trailers, LLC"),
    (r"\(Pty\) Ltd", "LLC"),
    (r"\bSARS\b", "IRS"),
    (r"Arbitration Foundation of Southern Africa", "American Arbitration Association"),
    # Country
    (r"South African Rand", "US Dollars"),
    (r"South Africa", "United States"),
    (r"\bZAR\b", "USD"),
    (r"en-ZA", "en-US"),
    # Postal codes like "1600" near "Decatur" already handled above
]

# Patterns that need replacement-function (price conversion)
def apply_price_conv(text):
    # R12,345 or R12,345.67  → $USD
    text = re.sub(r"R(\d{1,3}(?:,\d{3})+(?:\.\d+)?)", conv_r_comma, text)
    # R12345  (plain digits)
    text = re.sub(r"R(\d{3,})", conv_r_plain, text)
    # Rxxx (1-3 digits)
    def small(m): return fmt_usd(float(m.group(1)))
    text = re.sub(r"\bR(\d{1,3})\b", small, text)
    return text

PHONE_RE = [
    (r"\+27 ?12 ?345 ?6789", "+1 (940) 627-1717"),
    (r"\+27 ?11 ?234 ?5678", "+1 (940) 627-1717"),
    (r"\+27\d{9}", "+19406271717"),
]

EXTS = (".astro", ".ts", ".tsx", ".js", ".jsx", ".json")

count = 0
for f in SRC.rglob("*"):
    if f.suffix not in EXTS or not f.is_file():
        continue
    if "/data/" in str(f):
        # don't muck with product JSON (already handled)
        continue
    text = f.read_text(encoding="utf-8", errors="ignore")
    orig = text
    # text replacements
    for pat, rep in replacements_text:
        text = re.sub(pat, rep, text)
    # phone numbers
    for pat, rep in PHONE_RE:
        text = re.sub(pat, rep, text)
    # price conversions
    text = apply_price_conv(text)
    if text != orig:
        f.write_text(text)
        count += 1

print(f"updated {count} files")
