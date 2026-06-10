#!/usr/bin/env python3
"""Re-encode every trailer image so it has new byte content (and thus new
Cloudflare asset hashes), forcing fresh upload to the CDN.

Cloudflare Pages dedupes uploads by content hash. After the half-failed
deploys, the original trailer image hashes are stuck in Cloudflare's
asset table with corrupted/missing bytes. Re-encoding gives them new
hashes that Cloudflare must upload fresh."""
import subprocess, pathlib, hashlib, sys

ROOT = pathlib.Path(__file__).parent.parent
IMG_DIR = ROOT / "public" / "images" / "products"

images = []
for d in IMG_DIR.iterdir():
    if d.is_dir() and d.name.startswith("trl-"):
        for f in d.iterdir():
            if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                images.append(f)

print(f"found {len(images)} trailer images")

ok = err = 0
for f in images:
    before_hash = hashlib.sha1(f.read_bytes()).hexdigest()[:10]
    # Re-encode by writing through sips (changes byte content, visual quality nearly identical)
    try:
        # sips re-saves the image; quality 95 keeps it sharp
        subprocess.run(
            ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "95",
             str(f), "--out", str(f)],
            check=True, capture_output=True, timeout=30
        )
        after_hash = hashlib.sha1(f.read_bytes()).hexdigest()[:10]
        if before_hash == after_hash:
            # Try a fallback: copy with slight modification
            with open(f, "ab") as fh:
                fh.write(b"\x00")  # append a null byte (most decoders ignore trailing data)
            after_hash = hashlib.sha1(f.read_bytes()).hexdigest()[:10]
        if before_hash != after_hash:
            ok += 1
        else:
            err += 1
            print(f"  unchanged hash: {f.name}", file=sys.stderr)
    except subprocess.CalledProcessError as e:
        err += 1
        print(f"  FAIL: {f.name}  ({e.stderr.decode()[:80]})", file=sys.stderr)

print(f"re-encoded: {ok} ok, {err} failed")
