"""Publish native Chrome pixels with transparent backgrounds and centered labels."""
from pathlib import Path
import shutil
import os
from PIL import Image, ImageDraw
from fonts import load_font

root = Path(__file__).parent
assets = root.parents[1] / 'public/static/logs/figma-inner-shadows'
fixture = os.environ.get('SHADOW_FIXTURE', 'slate')
material = {'slate': 'slate-porcelain', 'graphite': 'slate-graphite',
            'contrast-light': 'contrast-light', 'contrast-dark': 'contrast-dark'}[fixture]
font = load_font(11)
board = Image.new('RGBA', (280, 97), (0, 0, 0, 0))
draw = ImageDraw.Draw(board)
for i, (variant, label, suffix) in enumerate([('a127', '127', ''), ('a1', '1', '-alpha1'), ('rebuilt', 'Rebuilt', '-rebuilt')]):
    raster = Image.open(root / 'renders' / f'{fixture}-transparent-{variant}-1.png').convert('RGBA')
    x = 16 + i * 88
    board.paste(raster, (x, 12))
    draw.text((x+26, 70), label, anchor='mt', font=font, fill='#888888')
    if variant != 'a127':
        raster.resize((416, 392), Image.Resampling.NEAREST).save(assets / f'{fixture}-{variant}-pixels.png')
    shutil.copyfile(root.parent / f'{material}{suffix}.svg', assets / f'{fixture}{suffix or "-original"}.svg')
board.save(assets / f'{fixture}-native.png')
# Two-variant view introduces the small fix before the geometry comparison.
pair = Image.new('RGBA', (320, 97), (0, 0, 0, 0))
pair.paste(board.crop((0, 0, 192, 97)), (64, 0))
pair.save(assets / f'{fixture}-fix-native.png')
shutil.copyfile(root / f'{fixture}-results.json', assets / f'{fixture}-results.json')
