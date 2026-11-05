import math
from painter import Sprite
# Umbrella seen from behind while held out in front (first person): the inside of the canopy with
# its ribs, red/white panels, and the shaft coming down to the hand.
pal = {'r':'#e0283c','R':'#a01a2c','w':'#f4f4f2','W':'#c9ccd2','k':'#2a2026','s':'#8a8f96','f':'#ffa3cc'}
N = 31
S = Sprite(N, 40, pal)
c = 15
for y in range(N):
    for x in range(N):
        d = math.hypot(x-c, y-c)
        if d > 15.2: continue
        a = (math.atan2(y-c, x-c) + math.pi) / (2*math.pi) * 8
        seg = int(a) % 2
        col = ('r' if seg else 'w')
        if d > 13.6: col = 'R' if seg else 'W'           # rim shading
        if abs(a - round(a)) < 0.05 * (16/(d+1)) and d > 2: col = 'k'   # ribs
        S.px(x, y, col)
S.rect(c-1, c-1, c+1, c+1, 'k')                          # hub
S.rect(c, c+2, c, 36, 's')                                # shaft
S.rect(c-2, 33, c+2, 37, 'f'); S.rect(c-3, 34, c-3, 36, 'f')   # pig trotter holding it
o = S.outline()
if __name__ == '__main__':
    o.png('umbrella_fp.png', 8)
