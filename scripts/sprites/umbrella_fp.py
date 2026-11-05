import math
from painter import Sprite
# First person umbrella: held up over your head and slightly forward, seen from underneath —
# the inside of the canopy fills the top of the screen (radial red/white panels, ribs, scalloped
# rim) and the shaft runs down to the pig's trotter in the bottom-left corner.
pal = {'r':'#d8283c','R':'#9a1a2c','w':'#eeeeee','W':'#bfc2c8','k':'#2a2026','s':'#9aa0a8','S':'#6a6f78','P':'#ffa3cc','p':'#e8829f','h':'#5a2a3e'}
W, H = 64, 96
S = Sprite(W, H, pal)
cx, cy = 32, -42           # hub, well above the top of the screen
R = 74
for y in range(H):
    for x in range(W):
        dx, dy = x - cx, y - cy
        d = math.hypot(dx, dy)
        a = math.atan2(dy, dx)
        # scalloped rim: radius dips between ribs
        k = (a / (2*math.pi) * 20) % 1
        rim = R - 3.2 * math.sin(k * math.pi)
        if d > rim or dy < 0: continue
        panel = int(math.floor(a / (2*math.pi) * 20)) % 2
        col = 'r' if panel else 'w'
        if d > rim - 3: col = 'R' if panel else 'W'          # darker rim (inside, in shadow)
        if min(k, 1-k) * d * 2 * math.pi / 20 < 0.6: col = 'k' # ribs
        S.px(x, y, col)
# shaft from the hub down to the trotter (bottom left)
def thick(x0, y0, x1, y1, r, c):
    n = int(max(abs(x1-x0), abs(y1-y0))*2)+1
    for i in range(n+1):
        t = i/n; x = x0+(x1-x0)*t; y = y0+(y1-y0)*t
        for yy in range(int(y-r)-1, int(y+r)+2):
            for xx in range(int(x-r)-1, int(x+r)+2):
                if (xx-x)**2+(yy-y)**2 <= r*r: S.px(xx, yy, c)
thick(30, 30, 8, 88, 0.9, "s"); thick(31, 30, 9, 88, 0.4, "S")
thick(0, 95, 8, 86, 4, 'P'); thick(0, 95, 7, 88, 1.4, 'p')
for y in range(82, 90):
    for x in range(4, 13):
        if (x-8)**2 + (y-86)**2 <= 12: S.px(x, y, 'P')
S.rect(6, 83, 10, 83, 'h'); S.px(8, 84, 'h')
o = S.outline()
if __name__ == '__main__':
    o.png('umbrella_fp.png', 4)
