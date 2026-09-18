"""Build actual Boolean vector rims for polygon fixtures without blur.

PYTHONPATH=.context/hardalpha-deps python3 temp/hardalpha-validation/boolean.py
Circles and blurred shadows are deliberately excluded: flattened curves or
hard-edged rims would introduce additional approximations.
"""
from pathlib import Path
import json
import math
from shapely.geometry import Polygon
from shapely.affinity import translate

root=Path(__file__).parent
cases=json.loads((root/'cases.json').read_text())
paths={}
partitions={}
def path_of(geometry):
    polygons=list(geometry.geoms) if geometry.geom_type=='MultiPolygon' else [geometry]
    d=''
    for polygon in polygons:
        if polygon.is_empty:
            continue
        for ring in [polygon.exterior,*polygon.interiors]:
            d+='M'+'L'.join(f'{x:.10f} {y:.10f}' for x,y in ring.coords)+'Z'
    return d
for c in cases:
    if c.get('figma') and c['mode']=='normal' and c['opacity']==1:
        vertices=[(25.6785,0),(31.7404,18.6565),(51.3571,18.6565),(35.4869,30.1869),(41.5487,48.8435),(25.6785,37.3131),(9.80832,48.8435),(15.8702,30.1869),(0,18.6565),(19.6166,18.6565)]
        shape=Polygon(vertices)
        shadow=c['shadows'][0]
        shifted=translate(shape,xoff=shadow['dx'],yoff=shadow['dy'])
        partitions[c['id']]={'base':path_of(shape.intersection(shifted)),'rim':path_of(shape.difference(shifted))}
    if c['blur'] or c['id'].startswith('circle'):
        continue
    if c.get('exact'):
        vertices=[(10.3923,0),(20.7846,18),(-9.53674e-7,18)]
    else:
        vertices=[(20+math.cos(i*math.pi/6-math.pi/2)*(8.2 if i%2 else 18.8),
                   20+math.sin(i*math.pi/6-math.pi/2)*(8.2 if i%2 else 18.8)) for i in range(12)]
    shape=translate(Polygon(vertices),xoff=c['phase'],yoff=c['phase'])
    paths[c['id']]=[]
    for shadow in c['shadows']:
        rim=shape.difference(translate(shape,xoff=shadow['dx'],yoff=shadow['dy']))
        polygons=list(rim.geoms) if rim.geom_type=='MultiPolygon' else [rim]
        d=''
        for polygon in polygons:
            if polygon.is_empty:
                continue
            for ring in [polygon.exterior,*polygon.interiors]:
                d+='M'+'L'.join(f'{x:.10f} {y:.10f}' for x,y in ring.coords)+'Z'
        paths[c['id']].append(d)
(root/'boolean-paths.json').write_text(json.dumps(paths,indent=2)+'\n')
(root/'partition-paths.json').write_text(json.dumps(partitions,indent=2)+'\n')
