"""Portable annotation fonts; raster measurements never depend on font choice."""
import os
from PIL import ImageFont


def load_font(size, family='mono'):
    candidates = {
        'mono': ['/System/Library/Fonts/Menlo.ttc', 'DejaVuSansMono.ttf', 'consola.ttf'],
        'sans': ['/System/Library/Fonts/HelveticaNeue.ttc', 'DejaVuSans.ttf', 'arial.ttf'],
    }
    override = os.environ.get(f'HARDALPHA_{family.upper()}_FONT')
    for filename in [override, *candidates[family]]:
        if not filename:
            continue
        try:
            return ImageFont.truetype(filename, size)
        except OSError:
            continue
    # Pillow includes this font, so no operating-system font is required.
    return ImageFont.load_default(size=size)
