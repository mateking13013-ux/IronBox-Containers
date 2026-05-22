#!/usr/bin/env python3
"""Download all trailer images in parallel."""
import os, sys, pathlib, urllib.request, concurrent.futures

ROOT = pathlib.Path(__file__).parent.parent
MANIFEST = ROOT / "scrape" / "images_manifest.tsv"

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

def fetch(line):
    url, dest = line.split("\t", 1)
    dest_path = ROOT / dest
    if dest_path.exists() and dest_path.stat().st_size > 100:
        return ("skip", dest)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        dest_path.write_bytes(data)
        return ("ok", dest)
    except Exception as e:
        return (f"err:{e}", dest)

def main():
    lines = [l.strip() for l in MANIFEST.read_text().splitlines() if l.strip() and "\t" in l]
    print(f"to fetch: {len(lines)}")
    ok = skip = err = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
        for status, dest in ex.map(fetch, lines):
            if status == "ok": ok += 1
            elif status == "skip": skip += 1
            else:
                err += 1
                print(f"FAIL {status} :: {dest}")
    print(f"ok={ok} skip={skip} err={err}")

if __name__ == "__main__":
    main()
