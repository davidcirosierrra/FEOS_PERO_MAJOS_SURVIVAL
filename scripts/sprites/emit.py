# Builds src/voxel/sprites.gen.ts from the painter scripts (python3 scripts/sprites/emit.py).
# Needs Pillow for the PNG previews.
import importlib.util, os
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)  # previews (PNG) land next to the scripts
import sys; sys.path.insert(0, HERE)
def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, f'{name}.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
b = load('bassist'); p = load('pig'); f = load('fans'); it = load('items'); fe = load('felipe')
def ts(o, name):
    pal = ', '.join(f"{k}: '{v}'" for k, v in o.pal.items() if any(k in r for r in o.rows()))
    rows = ''.join(f"\n    '{r}'," for r in o.rows())
    return f"export const {name}: Pattern = {{\n  palette: {{ {pal} }},\n  rows: [{rows}\n  ],\n}}\n"
out = ["// Generated from the pixel-art painter scripts (scripts/sprites). Outlined, '.' = empty.\n", "import type { Pattern } from './patterns'\n\n"]
out.append(ts(b.o, 'BASSIST')); out.append(ts(p.o, 'PIG'))
names = {'metal':'FAN_METAL','bandtee':'FAN_BANDTEE','tourist':'FAN_TOURIST','punk':'FAN_PUNK'}
for k, S in f.out.items(): out.append(ts(S.outline(), names[k]))
for k, S in it.out.items(): out.append(ts(S.outline(), k.upper()))
for k, S in fe.parts.items(): out.append(ts(S, 'FELIPE_' + k.upper()))
open(os.path.join(HERE, '..', '..', 'src', 'voxel', 'sprites.gen.ts'),'w').write('\n'.join(out))
print('ok')
