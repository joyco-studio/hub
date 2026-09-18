"""Measure the actual slate export; publish only after inspecting these results."""
from pathlib import Path
import json
import os
import numpy as np
from PIL import Image, ImageDraw
from fonts import load_font

root = Path(__file__).parent
out = root / 'renders'
fixture = os.environ.get('SHADOW_FIXTURE', 'slate')
font = load_font(13)

def read(name):
    return np.asarray(Image.open(out / f'{name}.png').convert('RGB'), dtype=float)

def down(a, scale):
    h, w, _ = a.shape
    return a.reshape(h // scale, scale, w // scale, scale, 3).mean((1, 3))

def dilate(mask, radius):
    h, w = mask.shape
    padded = np.pad(mask, radius)
    result = mask.copy()
    for y in range(-radius, radius + 1):
        for x in range(-radius, radius + 1):
            if x*x + y*y <= radius*radius:
                result |= padded[radius+y:radius+y+h, radius+x:radius+x+w]
    return result

def rmse(a, b, mask):
    return float(np.sqrt(np.mean((a[mask] - b[mask])**2)))

coverage = down(read(f'{fixture}-white-silhouette-16'), 16)[:, :, 0] / 255
inside = coverage > .5
boundary = ((coverage > .001) & (coverage < .999)) | (dilate(inside, 1) & dilate(~inside, 1))
masks = {'edge': dilate(boundary, 1), 'band': dilate(boundary, 6)}
results = {'chrome': json.loads((root / f'{fixture}-manifest.json').read_text())['chrome'], 'backgrounds': {}, 'inline_max_channel_delta': {}}
for background in ['white', 'gray', 'dark']:
    candidates = {v: read(f'{fixture}-{background}-{v}-1') for v in ['a127', 'a1', 'rebuilt']}
    refs = {s: down(read(f'{fixture}-{background}-a127-{s}'), s) for s in [8, 16, 32]}
    results['backgrounds'][background] = {
        f'{region}_gt{scale}': {v: rmse(a, refs[scale], mask) for v, a in candidates.items()}
        for region, mask in masks.items() for scale in refs
    }
    results['backgrounds'][background]['gt16_vs_gt32_edge'] = rmse(refs[16], refs[32], masks['edge'])
    panels = [*candidates.items(), ('Reference 32x', refs[32])]
    board = Image.new('RGB', (4 * 332 + 20, 350), '#ededed')
    draw = ImageDraw.Draw(board)
    for i, (label, a) in enumerate(panels):
        x = 20 + i * 332
        draw.text((x+156, 15), label, anchor='mt', font=font, fill='#444')
        board.paste(Image.fromarray(np.rint(a).clip(0,255).astype('uint8')).resize((312,294), Image.Resampling.NEAREST), (x, 42))
    board.save(out / f'{fixture}-{background}-comparison.png')
for v in ['a127', 'a1', 'rebuilt']:
    results['inline_max_channel_delta'][v] = float(np.max(np.abs(read(f'{fixture}-{v}-inline') - read(f'{fixture}-white-{v}-1'))))
(root / f'{fixture}-results.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps(results, indent=2))
