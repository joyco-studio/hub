"""Build the supplied Figma bolt variants, preserving its cubic curves.

Requires skia-pathops and fonttools. Run from any directory.
"""
from pathlib import Path
import re

import pathops
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.svgLib.path import parse_path

assets = Path(__file__).resolve().parents[2] / "public/static/logs/figma-inner-shadows"
source = (assets / "bolt-original.svg").read_text()
assert source.count("0 127 0") == 2
d = re.search(r'<path\b[^>]*\bd="([^"]+)"', source)[1]
shape = pathops.Path()
parse_path(d, shape.getPen())
shifted = shape.transform(translateX=1)
base = pathops.op(shape, shifted, pathops.PathOp.INTERSECTION)
rim = pathops.op(shape, shifted, pathops.PathOp.DIFFERENCE)
assert abs(base.area + rim.area - shape.area) < 0.0001
assert pathops.op(base, rim, pathops.PathOp.INTERSECTION).area < 0.0001


def svg_path(path):
    pen = SVGPathPen(None, ntos=lambda value: f"{value:.7f}".rstrip("0").rstrip("."))
    path.draw(pen)
    return pen.getCommands()


base_d, rim_d = svg_path(base), svg_path(rim)
rebuilt = f'''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<defs>
<filter id="soft" x="-100%" y="-100%" width="300%" height="300%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1"/></filter>
<mask id="dark-rim" maskUnits="userSpaceOnUse" x="-20" y="-20" width="64" height="64" style="mask-type:luminance"><path d="{d}" fill="white"/><path d="{d}" fill="black" transform="translate(0 -2)" filter="url(#soft)"/></mask>
</defs>
<g style="isolation:isolate">
<path d="{base_d}" fill="#7B8EA8" fill-rule="evenodd"/>
<path d="{base_d}" fill="#34465F" fill-opacity="0.3" fill-rule="evenodd" mask="url(#dark-rim)"/>
<path d="{rim_d}" fill="white" fill-rule="evenodd"/>
</g></svg>
'''
(assets / "bolt-alpha1.svg").write_text(source.replace("0 127 0", "0 1 0"))
(assets / "bolt-rebuilt.svg").write_text(rebuilt)

soft_matrix = "0 0 0 0 0.203922 0 0 0 0 0.27451 0 0 0 0 0.372549 0 0 0 0.3 0"
rim_matrix = "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
assert soft_matrix in source and rim_matrix in source


def matrix(color, opacity):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return " ".join(f"0 0 0 0 {value:.8f}" for value in channels) + f" 0 0 0 {opacity} 0"


# Controlled illustration palettes. The original export above stays unchanged.
for palette, soft_color, rim_color in [
    ("light", "#101C30", "#FFFFFF"),
    ("dark", "#EBF2FF", "#101010"),
]:
    prefix = f"bolt-contrast-{palette}"
    original = source.replace(soft_matrix, matrix(soft_color, 0.8)).replace(rim_matrix, matrix(rim_color, 1))
    partitioned = rebuilt.replace('fill="#34465F"', f'fill="{soft_color}"').replace('fill-opacity="0.3"', 'fill-opacity="0.8"').replace(f'<path d="{rim_d}" fill="white"', f'<path d="{rim_d}" fill="{rim_color}"')
    (assets / f"{prefix}-original.svg").write_text(original)
    (assets / f"{prefix}-alpha1.svg").write_text(original.replace("0 127 0", "0 1 0"))
    (assets / f"{prefix}-rebuilt.svg").write_text(partitioned)

print("Generated bolt SVGs; curved base and rim are disjoint and cover the original shape.")
