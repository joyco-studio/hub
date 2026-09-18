"""Prepare the actual Figma export, preserving its dark-then-white order."""
from pathlib import Path
import json
import re
from shapely.geometry import Polygon
from shapely.affinity import translate

root = Path(__file__).parent
source = (root.parent / 'slate-porcelain.svg').read_text()
d = re.search(r'<path d="([^"]+)"', source)[1]
vertices = []
for command, args in re.findall(r'([MLHZ])([^MLHZ]*)', d):
    numbers = list(map(float, re.findall(r'-?\d+(?:\.\d+)?', args)))
    if command in ('M', 'L'):
        vertices.append(tuple(numbers))
    elif command == 'H':
        vertices.append((numbers[0], vertices[-1][1]))
assert len(vertices) == 11
shape = Polygon(vertices)
shifted = translate(shape, yoff=3)

def path_of(geometry):
    polygons = list(geometry.geoms) if geometry.geom_type == 'MultiPolygon' else [geometry]
    return ''.join('M' + 'L'.join(f'{x:.10f} {y:.10f}' for x, y in ring.coords) + 'Z'
                   for polygon in polygons if not polygon.is_empty
                   for ring in [polygon.exterior, *polygon.interiors])

base, rim = path_of(shape.intersection(shifted)), path_of(shape.difference(shifted))
assert source.count('0 127 0') == 2
(root.parent / 'slate-porcelain-alpha1.svg').write_text(source.replace('0 127 0', '0 1 0'))
# The dark shadow covers only the retained slate region. The opaque white rim
# is painted last, matching this export's order without slate beneath its edge.
rebuilt = f'''<svg xmlns="http://www.w3.org/2000/svg" width="52" height="49" viewBox="0 0 52 49">
<defs>
<filter id="soft" x="-100%" y="-100%" width="300%" height="300%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1"/></filter>
<mask id="dark-rim" maskUnits="userSpaceOnUse" x="-20" y="-20" width="92" height="89" style="mask-type:luminance"><path d="{d}" fill="white"/><path d="{d}" fill="black" transform="translate(0 -2)" filter="url(#soft)"/></mask>
</defs>
<g style="isolation:isolate">
<path d="{base}" fill="#7B8EA8" fill-rule="evenodd"/>
<path d="{base}" fill="#34465F" fill-opacity="0.3" fill-rule="evenodd" mask="url(#dark-rim)"/>
<path d="{rim}" fill="white" fill-rule="evenodd"/>
</g></svg>
'''
(root.parent / 'slate-porcelain-rebuilt.svg').write_text(rebuilt)
(root / 'slate-paths.json').write_text(json.dumps({'shape': d, 'base': base, 'rim': rim}, indent=2) + '\n')

# Controlled dark-surface counterpart: preserve geometry, offsets and opacity.
# This is a palette variant of the supplied export, not another Figma export.
dark_source = source.replace(
    '0 0 0 0 0.203922 0 0 0 0 0.27451 0 0 0 0 0.372549 0 0 0 0.3 0',
    '0 0 0 0 0.796078 0 0 0 0 0.847059 0 0 0 0 0.92549 0 0 0 0.3 0'
).replace(
    '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0',
    '0 0 0 0 0.062745 0 0 0 0 0.062745 0 0 0 0 0.062745 0 0 0 1 0'
)
(root.parent / 'slate-graphite.svg').write_text(dark_source)
(root.parent / 'slate-graphite-alpha1.svg').write_text(dark_source.replace('0 127 0', '0 1 0'))
dark_rebuilt = rebuilt.replace('fill="#34465F"', 'fill="#CBD8EC"').replace(f'<path d="{rim}" fill="white"', f'<path d="{rim}" fill="#101010"')
(root.parent / 'slate-graphite-rebuilt.svg').write_text(dark_rebuilt)

# Stronger illustration variants, preserving the user's original export above.
for name, color, rim_color in [
    ('contrast-light', '#101C30', '#FFFFFF'),
    ('contrast-dark', '#EBF2FF', '#101010'),
]:
    channels = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    rim_channels = [int(rim_color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    def matrix(rgb, opacity):
        return ' '.join(f'0 0 0 0 {v:.8f}' for v in rgb) + f' 0 0 0 {opacity} 0'
    candidate = source.replace(
        '0 0 0 0 0.203922 0 0 0 0 0.27451 0 0 0 0 0.372549 0 0 0 0.3 0',
        matrix(channels, 0.8)
    ).replace('0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0', matrix(rim_channels, 1))
    candidate_rebuilt = rebuilt.replace('fill="#34465F"', f'fill="{color}"').replace('fill-opacity="0.3"', 'fill-opacity="0.8"').replace(f'<path d="{rim}" fill="white"', f'<path d="{rim}" fill="{rim_color}"')
    (root.parent / f'{name}.svg').write_text(candidate)
    (root.parent / f'{name}-alpha1.svg').write_text(candidate.replace('0 127 0', '0 1 0'))
    (root.parent / f'{name}-rebuilt.svg').write_text(candidate_rebuilt)
