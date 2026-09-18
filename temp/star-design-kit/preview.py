from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).parent
recipes=json.loads((root/'recipes.json').read_text())
font=lambda n:ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc',n)
mono=lambda n:ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',n)
board=Image.new('RGBA',(1200,860),(0,0,0,0))
draw=ImageDraw.Draw(board)
draw.text((48,32),'FIGMA / ESTUDIO DE SOMBRAS',font=mono(13),fill='#888888')
draw.text((48,64),'Una luz. Tres materiales.',font=font(42),fill='#888888')
draw.text((48,125),'Prototipos de diseño. El export de Figma se verifica después.',font=font(17),fill='#888888')
for i,c in enumerate(recipes):
 x=48+i*380
 if i:draw.line((x-24,185,x-24,808),fill='#666666')
 draw.text((x,187),f'0{i+1}',font=mono(14),fill='#7A857C')
 draw.text((x,216),c['name'],font=font(26),fill='#888888')
 board.paste(Image.open(root/f"{c['id']}-design-preview.png").convert('RGBA'),(x+64,289))
 draw.text((x,520),'Vista de material ampliada',font=font(13),fill='#647067')
 draw.text((x,560),'52 × 49 px reales',font=mono(12),fill='#647067')
 for j,a in enumerate([127,1]):
  board.paste(Image.open(root/f"{c['id']}-alpha{a}-transparent.png").convert('RGBA'),(x+j*120,586))
  draw.text((x+j*120,646),f'alpha {a}',font=mono(12),fill='#888888')
 draw.text((x,695),f"Base {c['fill']}",font=mono(13),fill='#888888')
 draw.text((x,724),f"Luz {c['light']} / {round(c['lightOpacity']*100)}%",font=mono(13),fill='#888888')
 draw.text((x,753),f"Sombra {c['dark']} / {round(c['darkOpacity']*100)}%",font=mono(13),fill='#888888')
 draw.text((x,790),'Luz arriba. Sombra abajo.',font=font(14),fill='#647067')
board.save(root/'proposals.png')
# Separate honest magnifications, each sourced from its 1x render.
for c in recipes:
 panels=[]
 for a in [127,1]:
  panels.append(Image.open(root/f"{c['id']}-alpha{a}-1x.png").convert('RGB'))
 hi=np.asarray(Image.open(root/f"{c['id']}-alpha127-16x.png").convert('RGB'),dtype=float)
 gt=hi.reshape(49,16,52,16,3).mean((1,3)).round().astype('uint8')
 panels.append(Image.fromarray(gt))
 comparison=Image.new('RGB',(3*336+64,408),'#F8F7F3');d=ImageDraw.Draw(comparison)
 for i,(label,img) in enumerate(zip(['127, nativo','1, nativo','Referencia 16x'],panels)):
  x=32+336*i
  d.text((x,20),label,font=mono(15),fill='#394A40')
  comparison.paste(img.resize((312,294),Image.Resampling.NEAREST),(x,66))
 comparison.save(root/f"{c['id']}-comparison.png")
