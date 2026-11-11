# The band, from the photo: everybody in the pink football shirt. One parametric musician,
# seven looks. python3 scripts/sprites/band.py -> band.png (contact sheet)
from kit import Art, text

PAL = {
 'f':'#eab994','F':'#c98e66','E':'#d49c74',          # skin (light)
 'g':'#c98a5e','G':'#a06a42','Q':'#b47a50',          # skin (tanned)
 'e':'#1b120c','m':'#a8584a','t':'#ffffff',
 'H':'#1c1410','h':'#3a2a20','b':'#5a3c26','B':'#7a5636','y':'#c9a05a',   # hair: black, dark, brown, light brown, tips
 's':'#8a7566','S':'#6e5a4c',                         # buzz cut / stubble
 'p':'#ff8fc0','P':'#e0609a','w':'#f4f4f2','W':'#c9ccd2','n':'#1f2a6e',   # shirt
 'k':'#16141c','K':'#2c2a36','j':'#2a2e3a','J':'#1c1f28','d':'#3e5689','D':'#2b3c64',
 'u':'#3346a8','U':'#1f2a6e','l':'#6577d6',           # fork blue
 'r':'#e0283c','R':'#a01a30','o':'#d9963b','O2':'#000','N':'#a06a34','M':'#7a4c22','c':'#fff3c4',
 'x':'#9aa0aa','X':'#5a5f6a','z':'#5ef6ff','v':'#9b4f9e','q':'#c0343e',
}
PAL.pop('O2')

def musician(skin='f', hair=None, beard=None, glasses=None, fat=False, short=0, weapon='guitar', wcol=('r','R'),
             shorts=('j','J'), cup=False, extra=None, smile=False):
    sk, sh = (skin, {'f':'F','g':'G'}[skin])
    x0, x1 = (3, 18) if fat else (5, 16)          # torso
    W = x1 + 7
    S = Art(W, 32, PAL)
    # ---- legs + shoes
    S.rect(x0+1, 26, x1-1, 27, shorts[0]); S.rect(x0+1, 27, 10, 28, shorts[0]); S.rect(12, 27, x1-1, 28, shorts[0])
    S.rect(10, 27, 10, 28, shorts[1]); S.rect(x1-1, 26, x1-1, 28, shorts[1])
    S.rect(7, 29, 9, 30, sk); S.rect(13, 29, 15, 30, sk); S.rect(9, 29, 9, 30, sh); S.rect(15, 29, 15, 30, sh)
    S.rect(6, 31, 10, 31, 'k'); S.rect(12, 31, 16, 31, 'k'); S.px(6, 31, 'w'); S.px(12, 31, 'w')
    # ---- shirt: pink, white collar and side panels, navy letters
    S.rect(x0, 14, x1, 25, 'p'); S.rect(x0+1, 13, x1-1, 13, 'p')
    if fat:
        S.rect(x0-1, 18, x1+1, 24, 'p'); S.rect(x0, 25, x1, 25, 'P'); S.rect(x1+1, 18, x1+1, 24, 'P')
    S.rect(x1, 14, x1, 25, 'P'); S.rect(x0, 25, x1, 25, 'P')
    S.rect(x0, 15, x0, 24, 'w')
    S.rect(9, 13, 13, 13, 'w'); S.px(10, 14, 'w'); S.px(12, 14, 'w'); S.px(11, 14, sk)
    text(S, 6, 17, 'FPM', 'n')
    S.px(x1-3, 15, 'r'); S.px(x0+2, 15, 'w')                 # crest + maker's mark
    # ---- arms (short sleeves)
    ax0, ax1 = x0 - 2 - (1 if fat else 0), x1 + 1 + (1 if fat else 0)
    for ax in (ax0, ax1):
        S.rect(ax, 15, ax+1, 18, 'p'); S.rect(ax, 18, ax+1, 18, 'w'); S.rect(ax, 19, ax+1, 23, sk)
    S.rect(ax0, 15, ax0, 17, 'p'); S.px(ax0, 15, '.'); S.px(ax1+1, 15, '.'); S.rect(ax1+1, 19, ax1+1, 23, sh)
    S.rect(ax0, 24, ax0+1, 25, sk)                           # left hand
    # ---- head
    S.rect(8, 4, 14, 11, sk); S.rect(9, 12, 13, 12, sk); S.rect(14, 5, 14, 11, sh)
    S.px(7, 7, sh); S.px(7, 8, sh); S.px(15, 7, sh); S.px(15, 8, sh)
    S.px(9, 7, 'e'); S.px(13, 7, 'e'); S.rect(8, 6, 10, 6, 'h'); S.rect(12, 6, 14, 6, 'h')
    S.px(11, 8, sh); S.px(11, 9, sh)
    if smile: S.rect(9, 10, 13, 10, 't'); S.px(8, 10, 'm'); S.px(14, 10, 'm'); S.rect(9, 11, 13, 11, 'm')
    else: S.rect(10, 10, 12, 10, 'm')
    if beard: beard(S, sk, sh)
    if hair: hair(S)
    if glasses == 'white':
        S.rect(7, 6, 15, 6, 'w'); S.rect(8, 6, 10, 8, 'w'); S.rect(12, 6, 14, 8, 'w'); S.rect(9, 7, 10, 7, 'k'); S.rect(13, 7, 14, 7, 'k'); S.px(9, 7, 'K'); S.px(13, 7, 'K')
    elif glasses == 'clear':
        S.rect(8, 6, 10, 8, 'k'); S.rect(12, 6, 14, 8, 'k'); S.px(11, 7, 'k'); S.px(7, 7, 'k'); S.px(15, 7, 'k')
        S.px(9, 7, 'z'); S.px(13, 7, 'z'); S.px(9, 8, sk) if False else None
        S.rect(9, 7, 9, 7, 'c'); S.rect(13, 7, 13, 7, 'c')
    if cup:                                                   # kalimotxo in the left hand
        S.rect(ax0-1, 21, ax0+1, 24, 'q'); S.rect(ax0-1, 21, ax0+1, 21, 'w'); S.px(ax0+1, 23, 'R'); S.rect(ax0, 25, ax0+1, 25, sk)
    if extra: extra(S, x0, x1, ax0, ax1)
    # ---- instrument-fork, held upright on the right
    wx = ax1 + 1
    if weapon != 'sticks':
        for x in (wx, wx+2, wx+4): S.rect(x, 1, x, 4, 'u'); S.px(x, 1, 'l')
        S.rect(wx, 5, wx+4, 5, 'u'); S.rect(wx+1, 6, wx+3, 6, 'u')
    if weapon in ('guitar', 'bass'):
        long = weapon == 'bass'
        S.rect(wx+2, 7, wx+2, 19 if long else 17, 'N'); S.rect(wx+3, 7, wx+3, 19 if long else 17, 'M')
        for y in range(8, 18, 3): S.px(wx+2, y, 'c')
        by = 20 if long else 18
        S.rect(wx, by, wx+4, by+ (8 if long else 7), wcol[0]); S.px(wx, by, '.'); S.px(wx+4, by, '.'); S.px(wx, by+(8 if long else 7), '.'); S.px(wx+4, by+(8 if long else 7), '.')
        S.rect(wx+4, by+1, wx+4, by+6, wcol[1]); S.rect(wx+1, by+2, wx+3, by+2, 'k'); S.rect(wx+1, by+5, wx+3, by+5, 'x'); S.px(wx+1, by+6, 'w')
        S.rect(wx+2, by, wx+2, by+5, 'c')
        if long: S.px(wx-1, 6, 'x'); S.px(wx+5, 6, 'x'); S.px(wx-1, 8, 'x'); S.px(wx+5, 8, 'x')
    elif weapon == 'mic':
        S.rect(wx+1, 7, wx+3, 10, 'x'); S.rect(wx+3, 7, wx+3, 10, 'X'); S.px(wx+1, 7, 'w'); S.px(wx+2, 9, 'X'); S.rect(wx+1, 11, wx+3, 11, 'k')
        S.rect(wx+2, 12, wx+2, 27, 'k'); S.rect(wx+1, 12, wx+1, 14, 'K'); S.px(wx+3, 20, 'r')
    elif weapon == 'sticks':
        for dx in (0, 3):
            x = wx + dx
            S.px(x, 2, 'l'); S.px(x+1, 2, 'l'); S.rect(x, 3, x+1, 4, 'u')        # little fork tips
            S.rect(x, 5, x, 24, 'o'); S.rect(x+1, 5, x+1, 24, 'N'); S.px(x, 5, 'c')
    elif weapon == 'rifle':
        S.rect(wx+2, 7, wx+3, 21, 'u'); S.rect(wx+3, 9, wx+3, 21, 'U'); S.px(wx+2, 9, 'l')
        S.rect(wx+1, 22, wx+3, 28, 'u'); S.rect(wx+3, 22, wx+4, 25, 'U'); S.px(wx+1, 22, 'l')
    S.rect(ax1, 20, ax1+2, 22, sk); S.rect(ax1, 22, ax1+2, 22, sh)               # right hand gripping it
    # ---- short people lose a few rows of leg and torso
    for row in ([29, 23, 22, 21][:short]):
        del S.g[row]; S.h -= 1
    return S.outline()

# ---------- hair
def curly_wig(S):                # huge black curly mane down to the chest
    for y in range(0, 19):
        half = 5 + (1 if 2 <= y <= 14 else 0) + (1 if 5 <= y <= 12 else 0)
        for x in range(11-half, 12+half):
            if 8 <= x <= 14 and 5 <= y <= 12: continue
            if y > 12 and 8 <= x <= 14: continue
            S.px(x, y, 'h' if (x*7 + y*5) % 6 == 0 else 'B' if (x*3 + y*11) % 17 == 0 else 'H')
    S.rect(8, 4, 14, 4, 'H'); S.px(8, 5, 'H'); S.px(14, 5, 'H')
def short_dark(S):
    S.rect(8, 2, 14, 4, 'H'); S.rect(7, 3, 15, 5, 'H'); S.rect(8, 5, 14, 5, '.') ; S.rect(8, 5, 14, 5, 'f') if False else None
    S.rect(9, 2, 12, 2, 'h'); S.px(7, 6, 'H'); S.px(15, 6, 'H')
def short_brown(S):
    S.rect(8, 2, 14, 4, 'b'); S.rect(7, 3, 15, 5, 'b'); S.rect(9, 2, 12, 2, 'B'); S.px(7, 6, 'b'); S.px(15, 6, 'b'); S.rect(10, 5, 13, 5, 'b')
def fringe(S):                   # clean-shaven guitarist: longer fringe swept to one side
    S.rect(8, 1, 14, 4, 'B'); S.rect(7, 2, 15, 6, 'B'); S.rect(9, 1, 13, 1, 'y'); S.rect(8, 5, 12, 5, 'B'); S.px(8, 6, 'B'); S.px(13, 2, 'y'); S.px(7, 7, 'B'); S.px(15, 7, 'B')
def dreads(S):
    S.rect(8, 1, 14, 4, 'b'); S.rect(7, 2, 15, 5, 'b'); S.rect(9, 1, 12, 1, 'B')
    for x, y1 in ((5, 17), (6, 19), (7, 15), (15, 15), (16, 19), (17, 17), (4, 13), (18, 13)):
        y0 = 3 if 6 <= x <= 16 else 5
        for y in range(y0, y1+1): S.px(x, y, 'B' if y % 3 == 0 else 'b')
        S.px(x, y1, 'y'); S.px(x, y1-4, 'r' if x % 2 else 'o')                    # beads + bleached tips
    S.rect(8, 5, 14, 5, 'f')
def buzz(S):
    S.rect(8, 3, 14, 4, 's'); S.rect(9, 2, 13, 2, 's'); S.rect(8, 3, 9, 3, 'S'); S.px(7, 5, 's'); S.px(15, 5, 's'); S.px(7, 6, 's'); S.px(15, 6, 's')
    for x in range(8, 15, 2): S.px(x, 4, 'S')
# ---------- beards
def stubble(S, sk, sh):
    for y in (10, 11, 12):
        for x in range(8, 15):
            if (x + y) % 2 == 0 and S.get(x, y) in (sk, sh): S.px(x, y, 'S')
def full_beard(col, long=0):
    def f(S, sk, sh):
        S.rect(8, 9, 14, 12 + long, col); S.rect(7, 8, 7, 10, col); S.rect(15, 8, 15, 10, col); S.rect(9, 13 + long, 13, 13 + long, col)
        S.rect(10, 10, 12, 10, 'm'); S.rect(9, 9, 13, 9, col); S.px(11, 9, sh)
        S.px(9, 12 + long, 'h' if col != 'h' else 'H'); S.px(13, 11, 'h' if col != 'h' else 'H')
    return f
# ---------- extras
def all_instruments(S, x0, x1, ax0, ax1):   # the wildcard: guitar on the back, sticks in the waistband
    S.rect(2, 3, 3, 7, 'M'); S.px(1, 4, 'w'); S.px(4, 4, 'w'); S.px(1, 6, 'w'); S.px(4, 6, 'w')
    for i, (x, y) in enumerate([(3, 8), (4, 9), (4, 10), (5, 11), (5, 12), (6, 13)]): S.px(x, y, 'N')
    S.rect(13, 22, 13, 27, 'o'); S.rect(15, 23, 15, 27, 'o'); S.px(13, 22, 'c'); S.px(15, 23, 'c')
    S.rect(x0+1, 12, x0+1, 12, 'k')
def headband(S, *a):
    S.rect(7, 5, 15, 5, 'w'); S.px(16, 6, 'w')

BAND = {
 'SINGER_A':  musician(hair=curly_wig, beard=stubble, glasses='white', weapon='mic', cup=True),
 'SINGER_B':  musician(skin='g', hair=short_dark, beard=stubble, weapon='mic', smile=True, cup=True, shorts=('d','D')),
 'DRUMMER':   musician(hair=short_brown, glasses='clear', weapon='sticks', smile=True),
 'RASTA':     musician(hair=dreads, beard=full_beard('b'), glasses='white', weapon='guitar', wcol=('o','M'), shorts=('d','D')),
 'BASSMAN':   musician(hair=short_dark, beard=full_beard('h', 1), fat=True, weapon='bass', wcol=('u','U')),
 'GUITAR':    musician(hair=fringe, weapon='guitar', wcol=('r','R'), smile=True),
 'WILDCARD':  musician(hair=buzz, short=3, weapon='rifle', extra=all_instruments),
}

if __name__ == '__main__':
    from PIL import Image
    import pig
    sc = 10
    sprites = list(BAND.items()) + [('PIG', pig.o if hasattr(pig, 'o') else None)]
    sprites = [(n, s) for n, s in sprites if s is not None]
    Wt = sum(s.w + 3 for _, s in sprites) * sc; Ht = (max(s.h for _, s in sprites) + 2) * sc
    im = Image.new('RGB', (Wt, Ht), (120, 122, 130)); x = sc
    for n, s in sprites:
        oy = Ht - (s.h + 1) * sc
        for yy in range(s.h):
            for xx in range(s.w):
                c = s.g[yy][xx]
                if c == '.': continue
                hx = s.pal[c].lstrip('#'); col = tuple(int(hx[i:i+2], 16) for i in (0, 2, 4))
                im.paste(col, (x + xx*sc, oy + yy*sc, x + xx*sc + sc, oy + yy*sc + sc))
        x += (s.w + 3) * sc
    im.save('band.png'); print(im.size, [(n, s.w, s.h) for n, s in sprites])
