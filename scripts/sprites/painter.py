from PIL import Image
class Sprite:
    def __init__(s, w, h, pal):
        s.w, s.h, s.pal = w, h, pal
        s.g = [['.']*w for _ in range(h)]
    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.g[y][x] = c
    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1+1):
            for x in range(x0, x1+1): s.px(x, y, c)
    def row(s, y, x0, txt):
        for i, c in enumerate(txt):
            if c != ' ': s.px(x0+i, y, c)
    def get(s, x, y):
        return s.g[y][x] if 0 <= x < s.w and 0 <= y < s.h else '.'
    def outline(s, c='O'):
        # 1px dark outline around everything (pads the sprite by 1)
        n = Sprite(s.w+2, s.h+2, dict(s.pal, **{c: '#160c18'}))
        for y in range(s.h):
            for x in range(s.w): n.g[y+1][x+1] = s.g[y][x]
        for y in range(n.h):
            for x in range(n.w):
                if n.g[y][x] == '.' and any(n.get(x+dx, y+dy) not in ('.', c) for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))):
                    n.g[y][x] = c
        return n
    def mirror_from_left(s):
        for y in range(s.h):
            for x in range(s.w//2):
                s.g[y][s.w-1-x] = s.g[y][x]
    def rows(s): return [''.join(r) for r in s.g]
    def png(s, path, scale=10, bg=(142,145,150)):
        im = Image.new('RGB', (s.w*scale, s.h*scale), bg)
        for y in range(s.h):
            for x in range(s.w):
                c = s.g[y][x]
                if c == '.': continue
                hx = s.pal[c].lstrip('#')
                col = tuple(int(hx[i:i+2], 16) for i in (0, 2, 4))
                for yy in range(scale):
                    for xx in range(scale): im.putpixel((x*scale+xx, y*scale+yy), col)
        im.save(path)
    def ts(s, name):
        pal = ', '.join(f"{k}: '{v}'" for k, v in s.pal.items() if any(k in r for r in s.g))
        rows = ',\n    '.join(f"'{r}'" for r in s.rows())
        return f"  palette: {{ {pal} }},\n  rows: [\n    {rows},\n  ],"
