#!/usr/bin/env python3
"""Shrink the generated PNGs: icons are quantized to 256 colours (flat artwork, no visible loss);
the Open Graph image keeps full colour (its soft gradients would band) and is only recompressed.

    python3 -m pip install pillow
    python3 scripts/optimize-images.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FILES = ["apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"]

for name in FILES:
    path = ROOT / name
    before = path.stat().st_size
    image = Image.open(path).convert("RGBA")
    image.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(path, optimize=True)
    print(f"✓ {name}: {before // 1024} KB → {path.stat().st_size // 1024} KB")

og = ROOT / "og-image.png"
before = og.stat().st_size
Image.open(og).convert("RGB").save(og, optimize=True, compress_level=9)
print(f"✓ og-image.png: {before // 1024} KB → {og.stat().st_size // 1024} KB")
