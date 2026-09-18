"""Compare opaque Chrome renders on common, candidate-independent edge masks."""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
from fonts import load_font

ROOT = Path(__file__).parent
OUT = ROOT / 'renders'
manifest = json.loads((ROOT / 'manifest.json').read_text())

def read(name):
    return np.asarray(Image.open(OUT / (name + '.png')).convert('RGB'), dtype=float)

def down(a, scale, linear=False):
    h,w,_ = a.shape
    if linear:
        x=a/255
        a=np.where(x<=.04045,x/12.92,((x+.055)/1.055)**2.4)
    a=a.reshape(h//scale,scale,w//scale,scale,3).mean(axis=(1,3))
    if linear:
        a=255*np.where(a<=.0031308,a*12.92,1.055*a**(1/2.4)-.055)
    return a

def dilate(mask, radius):
    h,w=mask.shape
    padded=np.pad(mask,radius)
    out=mask.copy()
    for y in range(-radius,radius+1):
        for x in range(-radius,radius+1):
            if x*x+y*y<=radius*radius:
                out|=padded[radius+y:radius+y+h,radius+x:radius+x+w]
    return out

def rmse(a,b,mask):
    return float(np.sqrt(np.mean((a[mask]-b[mask])**2)))

results=[]
font=load_font(13)
for c in manifest['cases']:
    name=c['id']
    silhouette=down(read(name+'-silhouette-16'),16)[:,:,0]/255
    partial=(silhouette>.001)&(silhouette<.999)
    inside=silhouette>.5
    # Include aligned edges too, not just fractional coverage pixels.
    boundary=partial|(dilate(inside,1)&dilate(~inside,1))
    edge=dilate(boundary,1)
    scale=c['w']/c['vw']
    radius=int(np.ceil((max(np.hypot(s['dx'],s['dy']) for s in c['shadows'])+3*c['blur'])*scale))
    band=dilate(boundary,max(1,radius))
    variants={v:read(name+'-'+v+'-1') for v in ['a127','a1','geometry']}
    if (OUT/(name+'-boolean-1.png')).exists():
        variants['boolean']=read(name+'-boolean-1')
    if (OUT/(name+'-partition-1.png')).exists():
        variants['partition']=read(name+'-partition-1')
    gt8=down(read(name+'-a127-8'),8)
    gt16=down(read(name+'-a127-16'),16)
    soft16=down(read(name+'-a1-16'),16)
    row={'case':name,'size':[c['w'],c['h']], 'edge_pixels':int(edge.sum()),'band_pixels':int(band.sum()),
         'gt8_vs_gt16_edge':rmse(gt8,gt16,edge),'soft16_vs_gt16_edge':rmse(soft16,gt16,edge)}
    for region,mask in [('edge',edge),('band',band)]:
        row[region]={v:rmse(a,gt8,mask) for v,a in variants.items()}
        row[region+'_gt16']={v:rmse(a,gt16,mask) for v,a in variants.items()}
        row[region+'_linear']={v:rmse(a,down(read(name+'-a127-16'),16,True),mask) for v,a in variants.items()}
        if (OUT/(name+'-a127-32.png')).exists():
            gt32=down(read(name+'-a127-32'),32)
            row[region+'_gt32']={v:rmse(a,gt32,mask) for v,a in variants.items()}
            row['gt16_vs_gt32_'+region]=rmse(gt16,gt32,mask)
    results.append(row)
    Image.fromarray(np.rint(gt8).clip(0,255).astype('uint8')).save(OUT/(name+'-reference-8x.png'))
    Image.fromarray((edge*255).astype('uint8')).save(OUT/(name+'-edge-mask.png'))
    Image.fromarray((band*255).astype('uint8')).save(OUT/(name+'-band-mask.png'))
    # Pixel enlargement only, never re-render SVG for the comparison board.
    panels=[('127',variants['a127']),('1',variants['a1']),('mask rebuild',variants['geometry']),('GT 8x',gt8)]
    if 'boolean' in variants:
        panels.insert(3,('Boolean paths',variants['boolean']))
    if 'partition' in variants:
        panels.insert(3,('Partition + blur',variants['partition']))
    zoom=max(4,240//c['w']); pw=c['w']*zoom; ph=c['h']*zoom
    board=Image.new('RGB',(len(panels)*(pw+20)+20,ph+86),'#ededed');draw=ImageDraw.Draw(board)
    draw.text((20,8),name,fill='black',font=font)
    for i,(label,a) in enumerate(panels):
        x=20+i*(pw+20)
        board.paste(Image.fromarray(np.rint(a).clip(0,255).astype('uint8')).resize((pw,ph),Image.Resampling.NEAREST),(x,60))
        draw.text((x,35),label,fill='black',font=font)
    board.save(OUT/(name+'-comparison.png'))
    native=Image.new('RGB',(len(panels)*(c['w']+32)+16,c['h']+48),'#ededed')
    draw=ImageDraw.Draw(native)
    for i,(label,a) in enumerate(panels):
        x=16+i*(c['w']+32)
        native.paste(Image.fromarray(np.rint(a).clip(0,255).astype('uint8')),(x,8))
        short={'mask rebuild':'mask','Boolean paths':'bool','Partition + blur':'parts','GT 8x':'GT'}.get(label,label)
        draw.text((x,16+c['h']),short,fill='black',font=font)
    native.save(OUT/(name+'-native.png'))

check=np.max(np.abs(read('polygon-inline-screenshot')-read('polygon_original-a127-1')))
data={'chrome':manifest['chrome'],'canvas_inline_max_channel_delta':float(check),'results':results}
data['canvas_inline_checks']={name:float(np.max(np.abs(read(ss)-read(name+'-a127-1')))) for name,ss in [('polygon_original','polygon-inline-screenshot'),('figma_star_original','figma-star-inline-screenshot'),('figma_star2_original','figma-star2-inline-screenshot')]}
(ROOT/'results.json').write_text(json.dumps(data,indent=2)+'\n')
print('Chrome:',data['chrome'],'inline/canvas max delta:',check)
print('case                                127       1     mask   convergence    softGT')
for r in results:
    print(f"{r['case']:39} {r['edge']['a127']:7.2f} {r['edge']['a1']:7.2f} {r['edge']['geometry']:7.2f} {r['gt8_vs_gt16_edge']:10.2f} {r['soft16_vs_gt16_edge']:9.2f} boolean={r['edge'].get('boolean',float('nan')):.2f}")
