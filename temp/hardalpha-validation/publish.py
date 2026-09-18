"""Copy verified fixtures and native-pixel illustrations into the log assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil

root=Path(__file__).parent
assets=root.parents[1]/'public/static/logs/figma-inner-shadows'
assets.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',11)
for fixture,variants in [('figma_star_original',['a127','a1']),('figma_star2_original',['a127','a1','partition'])]:
    native=Image.new('RGBA',(len(variants)*88+16,97),(0,0,0,0))
    draw=ImageDraw.Draw(native)
    for i,variant in enumerate(variants):
        star='star1' if fixture=='figma_star_original' else 'star2'
        suffix={'a127':'original','a1':'alpha1','partition':'rebuilt'}[variant]
        raster=Image.open(root/'renders'/f'{star}-{suffix}-transparent.png').convert('RGBA')
        x=16+i*88
        native.paste(raster,(x,12))
        draw.text((x,70),{'a127':'127','a1':'1','partition':'Rebuilt'}[variant],font=font,fill='#888888')
        if fixture=='figma_star2_original' and variant in ['a1','partition']:
            raster.resize((416,392),Image.Resampling.NEAREST).save(assets/f'star2-{variant}-pixels.png')
    native.save(assets/('star1-native.png' if fixture=='figma_star_original' else 'star2-native.png'))
for source,dest in [('Star 1.svg','star1-original.svg'),('Star 1-alpha1.svg','star1-alpha1.svg'),('Star2.svg','star2-original.svg'),('Star2-alpha1.svg','star2-alpha1.svg'),('Star2-rebuilt.svg','star2-rebuilt.svg')]:
    shutil.copyfile(root.parent/source,assets/dest)
shutil.copyfile(root/'results.json',assets/'hardalpha-results.json')
