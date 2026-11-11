# Drawing helpers shared by the boss / stage painters (on top of painter.Sprite).
import math
from painter import Sprite

class Art(Sprite):
    def ellipse(s, cx, cy, rx, ry, c, ring=None):
        """Filled ellipse; `ring` = (colour, thickness) draws only/also the rim."""
        for y in range(int(cy-ry-1), int(cy+ry+2)):
            for x in range(int(cx-rx-1), int(cx+rx+2)):
                d = ((x-cx)/rx)**2 + ((y-cy)/ry)**2
                if d <= 1.0: s.px(x, y, c)
    def ring(s, cx, cy, r0, r1, c):
        for y in range(int(cy-r1-1), int(cy+r1+2)):
            for x in range(int(cx-r1-1), int(cx+r1+2)):
                d = math.hypot(x-cx, y-cy)
                if r0 <= d <= r1: s.px(x, y, c)
    def line(s, x0, y0, x1, y1, c):
        n = max(abs(x1-x0), abs(y1-y0), 1)
        for i in range(n+1): s.px(round(x0+(x1-x0)*i/n), round(y0+(y1-y0)*i/n), c)
    def hline(s, y, x0, x1, c): s.rect(x0, y, x1, y, c)
    def vline(s, x, y0, y1, c): s.rect(x, y0, x, y1, c)
    def crop(s, x0, y0, x1, y1):
        n = Art(x1-x0+1, y1-y0+1, s.pal)
        for y in range(y0, y1+1):
            for x in range(x0, x1+1): n.g[y-y0][x-x0] = s.get(x, y)
        return n
    def cut(s, x0, y0, x1, y1):
        """Moves a rectangle of pixels out of this sprite into a new one."""
        n = s.crop(x0, y0, x1, y1)
        for y in range(y0, y1+1):
            for x in range(x0, x1+1): s.px(x, y, '.')
        return n
    def blit(s, o, ox, oy):
        for y in range(o.h):
            for x in range(o.w):
                if o.g[y][x] != '.': s.px(ox+x, oy+y, o.g[y][x])
    def outline(s, c='O'):
        o = Sprite.outline(s, c); n = Art(o.w, o.h, o.pal); n.g = o.g; return n

FONT = {
 'A':['.#.','#.#','###','#.#','#.#'], 'B':['##.','#.#','##.','#.#','##.'], 'C':['.##','#..','#..','#..','.##'],
 'D':['##.','#.#','#.#','#.#','##.'], 'E':['###','#..','##.','#..','###'], 'F':['###','#..','##.','#..','#..'],
 'G':['.##','#..','#.#','#.#','.##'], 'H':['#.#','#.#','###','#.#','#.#'], 'I':['###','.#.','.#.','.#.','###'],
 'J':['..#','..#','..#','#.#','.#.'], 'K':['#.#','#.#','##.','#.#','#.#'], 'L':['#..','#..','#..','#..','###'],
 'M':['#.#','###','###','#.#','#.#'], 'N':['##.','#.#','#.#','#.#','#.#'], 'O':['###','#.#','#.#','#.#','###'],
 'P':['##.','#.#','##.','#..','#..'], 'R':['##.','#.#','##.','#.#','#.#'], 'S':['.##','#..','.#.','..#','##.'],
 'T':['###','.#.','.#.','.#.','.#.'], 'U':['#.#','#.#','#.#','#.#','###'], 'X':['#.#','#.#','.#.','#.#','#.#'],
 'Z':['###','..#','.#.','#..','###'], ' ':['...']*5, '!':['.#.','.#.','.#.','...','.#.'],
}
def text(S, x, y, s, c):
    for ch in s:
        for j, row in enumerate(FONT[ch]):
            for i, v in enumerate(row):
                if v == '#': S.px(x+i, y+j, c)
        x += 4

class Boss:
    """A boss is a core sprite plus parts that break off in order (core goes last)."""
    def __init__(s, w, h): s.w, s.h, s.parts = w, h, []
    def add(s, name, sprite, x, y, front=False): s.parts.append((name, sprite.outline(), x, y, front))
    def preview(s, path, sc=10, bg=(120,122,130)):
        from PIL import Image
        im = Image.new('RGB', ((s.w+2)*sc, (s.h+2)*sc), bg)
        for name, S, ox, oy, front in [p for p in s.parts if not p[4]] + [p for p in s.parts if p[4]]:
            for y in range(S.h):
                for x in range(S.w):
                    c = S.g[y][x]
                    if c == '.': continue
                    hx = S.pal[c].lstrip('#'); col = tuple(int(hx[i:i+2], 16) for i in (0, 2, 4))
                    for yy in range(sc):
                        for xx in range(sc): im.putpixel(((ox+x)*sc+xx, (oy+y)*sc+yy), col)
        im.save(path)
