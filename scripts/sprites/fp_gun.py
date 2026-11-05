import math
from painter import Sprite
# First-person fork-rifle (like the band's logo: fork tines as the muzzle, rifle body with trigger
# and grip, magazine, and the big round stock), pointing up into the screen, held by the pig's arms.
pal = {
 'u':'#2c3d9e','U':'#1b2668','l':'#5a6fd0','L':'#8a9be8','k':'#121630',
 'P':'#ffa3cc','p':'#e8829f','D':'#c0607f','h':'#5a2a3e',
}
W, H = 64, 84
S = Sprite(W, H, pal)
def thick(x0, y0, x1, y1, r, c):
    n = int(max(abs(x1-x0), abs(y1-y0))*2)+1
    for i in range(n+1):
        t = i/n; x = x0+(x1-x0)*t; y = y0+(y1-y0)*t
        for yy in range(int(y-r)-1, int(y+r)+2):
            for xx in range(int(x-r)-1, int(x+r)+2):
                if (xx-x)**2+(yy-y)**2 <= r*r: S.px(xx, yy, c)
def disc(cx, cy, r, c):
    for y in range(int(cy-r)-1, int(cy+r)+2):
        for x in range(int(cx-r)-1, int(cx+r)+2):
            if (x-cx)**2+(y-cy)**2 <= r*r: S.px(x, y, c)
def hoof(cx, cy):
    disc(cx, cy, 3.6, 'P'); disc(cx+0.5, cy+0.8, 2.2, 'p')
    S.rect(int(cx)-2, int(cy)-3, int(cx)+2, int(cy)-3, 'h'); S.px(int(cx), int(cy)-2, 'h')   # cleft hoof
# --- gun (axis tip -> stock)
tx, ty = 26, 2
for dx in (-6, -2, 2, 6):                                   # four tines
    thick(tx+dx, ty, tx+dx*0.55+1, ty+11, 0.9, 'u'); S.px(tx+dx, ty, 'L')
thick(tx-6, ty+11, tx+7, ty+11, 1.2, 'u')                   # bridge
thick(tx+1, ty+12, tx+4, ty+20, 1.8, 'u')                   # neck
thick(tx+3, ty+19, 40, 46, 2.6, 'u'); thick(tx+2, ty+19, 38, 46, 0.8, 'l')   # barrel
thick(38, 44, 46, 58, 4.6, 'u'); thick(36, 45, 42, 56, 1.0, 'l'); thick(48, 46, 49, 58, 1.0, 'U')  # receiver
thick(33, 52, 28, 62, 2.2, 'U')                              # magazine
thick(41, 58, 39, 63, 0.8, 'k'); thick(39, 63, 43, 63, 0.7, 'k')   # trigger guard
thick(45, 58, 44, 66, 2.3, 'U')                              # grip
disc(52, 74, 12, 'u'); disc(49, 71, 7, 'l'); disc(47, 69, 3, 'L')   # round stock
# --- pig arms (thinner) with trotters
thick(0, 83, 31, 36, 4.2, 'P'); thick(2, 83, 33, 37, 1.6, 'p')     # left arm under the barrel
hoof(32, 34)
thick(63, 83, 46, 62, 4.2, 'P'); thick(62, 83, 47, 64, 1.6, 'p')   # right arm on the grip
hoof(45, 60)
o = S.outline()
if __name__ == '__main__':
    o.png('fp_gun.png', 6)
