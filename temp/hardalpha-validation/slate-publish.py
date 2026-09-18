"""Publish native Chrome pixels with transparent backgrounds and centered labels."""
from pathlib import Path
import shutil
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).parent
assets = root.parents[1] / 'public/static/logs/figma-inner-shadows'
font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 11)
board = Image.new('RGBA', (280, 97), (0, 0, 0, 0))
draw = ImageDraw.Draw(board)
for i, (variant, label, suffix) in enumerate([('a127', '127', ''), ('a1', '1', '-alpha1'), ('rebuilt', 'Rebuilt', '-rebuilt')]):
    raster = Image.open(root / 'renders' / f'slate-transparent-{variant}-1.png').convert('RGBA')
    x = 16 + i * 88
    board.paste(raster, (x, 12))
    draw.text((x+26, 70), label, anchor='mt', font=font, fill='#888888')
    if variant != 'a127':
        raster.resize((416, 392), Image.Resampling.NEAREST).save(assets / f'slate-{variant}-pixels.png')
    shutil.copyfile(root.parent / f'slate-porcelain{suffix}.svg', assets / f'slate{suffix or "-original"}.svg')
board.save(assets / 'slate-native.png')
shutil.copyfile(root / 'slate-results.json', assets / 'slate-results.json')
