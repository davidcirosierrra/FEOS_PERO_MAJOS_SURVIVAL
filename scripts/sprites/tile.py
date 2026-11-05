# Bilbao "flor" tile at 64 px: smooth grooves (supersampled), bevelled relief, cement grain.
# Emits a 2x2 atlas (128 px) with slightly different cement per tile to break the repetition.
import math, random
from PIL import Image
N = 64
SS = 4  # supersampling for smooth curves

def tile_mask():
    """1 where there's a groove, sampled from analytic shapes."""
    h = N / 2
    def groove(px, py):
        g = 0.0
        w = 1.25  # half-width of a groove in px
        d = math.hypot(px - h, py - h)
        if abs(d - 6.0) < w: g = 1                                    # centre ring
        for dx, dy in ((0,-1),(1,0),(0,1),(-1,0)):                    # four petals (ellipses)
            cx, cy = h + dx*17.5, h + dy*17.5
            rx, ry = (9.0, 11.0) if dx == 0 else (11.0, 9.0)
            e = math.hypot((px-cx)/rx, (py-cy)/ry)
            if abs(e - 1) * min(rx, ry) < w: g = 1
        for cx, cy in ((0,0),(N,0),(0,N),(N,N)):                      # corner arcs
            if abs(math.hypot(px-cx, py-cy) - 8.5) < w: g = 1
        for dx, dy in ((1,1),(1,-1),(-1,1),(-1,-1)):                  # little diagonal dots
            if math.hypot(px-(h+dx*15.5), py-(h+dy*15.5)) < 1.8: g = 1
        if px < 1.6 or py < 1.6 or px > N-1.6 or py > N-1.6: g = 1    # joint
        return g
    m = [[0.0]*N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            acc = 0
            for sy in range(SS):
                for sx in range(SS):
                    acc += groove(x + (sx+0.5)/SS, y + (sy+0.5)/SS)
            m[y][x] = acc / (SS*SS)
    return m

m = tile_mask()
BASE = (156, 159, 164); DARK = (84, 87, 93); LIGHT = (196, 199, 204); SHADE = (128, 131, 136)
atlas = Image.new('RGB', (N*2, N*2))
rnd = random.Random(7)
for ty in range(2):
    for tx in range(2):
        tone = rnd.uniform(-6, 6)
        for y in range(N):
            for x in range(N):
                g = m[y][x]
                # bevel: light lip on the far side of a groove, shadow on the near side
                up = m[(y-1) % N][(x-1) % N]
                dn = m[(y+1) % N][(x+1) % N]
                n = rnd.uniform(-7, 7) + tone
                col = [BASE[i] + n for i in range(3)]
                if g > 0: col = [col[i]*(1-g) + DARK[i]*g for i in range(3)]
                elif up > 0.3: col = [col[i]*0.4 + LIGHT[i]*0.6 for i in range(3)]
                elif dn > 0.3: col = [col[i]*0.5 + SHADE[i]*0.5 for i in range(3)]
                atlas.putpixel((tx*N + x, ty*N + y), tuple(int(max(0, min(255, c))) for c in col))
if __name__ == '__main__':
    import os
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, '..', '..', 'public', 'textures'); os.makedirs(out, exist_ok=True)
    atlas.save(os.path.join(out, 'bilbao-tile.png'))
    big = Image.new('RGB', (N*4, N*4))
    for i in range(2):
        for j in range(2): big.paste(atlas, (i*N*2, j*N*2))
    big.resize((N*8, N*8), Image.NEAREST).save(os.path.join(here, 'tile_preview.png'))
