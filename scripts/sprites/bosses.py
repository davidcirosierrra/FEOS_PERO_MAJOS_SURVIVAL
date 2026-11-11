# The five bosses after FELIPE (front view), each drawn whole and then split into break-off parts.
# python3 scripts/sprites/bosses.py  -> boss_*.png previews
import math, random
from kit import Art, Boss, text

BOSSES = {}

# ------------------------------------------------------------------ FURGONETA (the tour van)
def van():
    pal = {'w':'#f4ecd8','W':'#d6c9a8','p':'#ff7eb6','P':'#c0508a','g':'#8fd3e8','G':'#4f8fa8','k':'#1a1416','K':'#3a3640',
           's':'#c9ccd2','S':'#8a8e96','y':'#fff3b0','Y':'#ffb83d','r':'#e0283c','t':'#24222a','T':'#4a4652',
           'a':'#2a2630','A':'#5a5560','d':'#a06a3a','D':'#6a4222','v':'#9b4f9e','V':'#6a3274','h':'#ffffff','o':'#ff8a1e'}
    S = Art(40, 31, pal)
    # wheels (behind the bumper)
    for x0 in (6, 28): S.rect(x0, 26, x0+5, 30, 't'); S.rect(x0+1, 29, x0+4, 30, 'T')
    # body
    S.rect(4, 9, 35, 27, 'w'); S.rect(5, 8, 34, 8, 'w'); S.px(4, 9, '.'); S.px(35, 9, '.')
    S.rect(5, 8, 34, 8, 'W'); S.rect(35, 10, 35, 27, 'W')
    # windshield, two panes
    for x0 in (7, 21):
        S.rect(x0, 10, x0+11, 16, 'g'); S.rect(x0+7, 13, x0+11, 16, 'G'); S.rect(x0+9, 11, x0+11, 12, 'G')
        S.line(x0+1, 14, x0+4, 11, 'h'); S.line(x0+3, 15, x0+5, 13, 'h')
        S.line(x0+2, 16, x0+8, 15, 'k')                                   # wiper
    S.rect(6, 9, 33, 9, 'K'); S.rect(6, 17, 33, 17, 'K'); S.rect(6, 10, 6, 16, 'K'); S.rect(33, 10, 33, 16, 'K'); S.rect(19, 10, 20, 16, 'K')
    # two-tone front: pink with a cream V
    S.rect(4, 18, 34, 27, 'p'); S.rect(35, 18, 35, 27, 'P'); S.rect(4, 26, 34, 27, 'P')
    for i, y in enumerate(range(18, 26)):
        half = 8 - i
        S.rect(20-half, y, 19+half, y, 'w')
    S.rect(19, 19, 20, 20, 'P'); S.px(19, 19, 'p')                        # badge
    # headlights + indicators
    for cx in (8.5, 30.5):
        S.ellipse(cx, 21.5, 2.6, 2.6, 's'); S.ellipse(cx, 21.5, 1.6, 1.6, 'y'); S.px(int(cx), 21, 'h')
    for x0 in (5, 33): S.rect(x0, 25, x0+1, 25, 'o')
    # number plate
    S.rect(15, 24, 24, 26, 'h'); S.rect(15, 26, 24, 26, 'S')
    for x in (16, 18, 19, 21, 23): S.px(x, 25, 'k')
    # roof rack
    S.rect(5, 7, 34, 7, 'S'); 
    core_bumper = Art(36, 2, pal); core_bumper.rect(0, 0, 35, 1, 's'); core_bumper.rect(0, 1, 35, 1, 'S'); core_bumper.rect(1, 0, 6, 0, 'h'); core_bumper.rect(15, 0, 20, 0, 'h')
    # luggage on the rack
    S.rect(6, 1, 14, 6, 'a'); S.rect(7, 2, 13, 4, 'A'); S.rect(7, 5, 13, 5, 'K')
    for x in (8, 10, 12): S.px(x, 5, 's')
    for x in range(7, 14, 2): S.px(x, 3, 'a')
    S.rect(16, 1, 23, 6, 'd'); S.px(16, 1, '.'); S.px(23, 1, '.'); S.px(16, 6, '.'); S.px(23, 6, '.')
    S.rect(18, 1, 18, 6, 'D'); S.rect(21, 1, 21, 6, 'D'); S.rect(17, 2, 22, 2, 'D'); S.px(19, 4, 'y'); S.px(20, 4, 'y')
    S.rect(25, 3, 34, 6, 'v'); S.rect(27, 1, 31, 2, 'v'); S.rect(25, 6, 34, 6, 'V'); S.rect(34, 3, 34, 6, 'V'); S.px(29, 4, 'y'); S.px(31, 4, 'y'); S.px(27, 1, 'V')
    # mirrors
    S.rect(1, 12, 3, 15, 'K'); S.rect(1, 12, 2, 13, 'g'); S.px(3, 16, 'K')
    S.rect(36, 12, 38, 15, 'K'); S.rect(37, 12, 38, 13, 'g'); S.px(36, 16, 'K')
    B = Boss(40, 31)
    B.add('amp', S.cut(6, 1, 14, 6), 6, 1)
    B.add('drumcase', S.cut(16, 1, 23, 6), 16, 1)
    B.add('guitarcase', S.cut(25, 1, 34, 6), 25, 1)
    B.add('mirrorL', S.cut(1, 12, 3, 16), 1, 12)
    B.add('mirrorR', S.cut(36, 12, 38, 16), 36, 12)
    B.add('bumper', core_bumper, 2, 27, True)
    B.add('core', S.crop(4, 7, 35, 30), 4, 7)
    return B
BOSSES['van'] = van()

# ------------------------------------------------------------------ SEGURATA (the bouncer)
def bouncer():
    pal = {'f':'#d9a37a','F':'#b07a54','h':'#f0c49c','k':'#1c1a22','K':'#34313c','y':'#ffd23d','g':'#0c0c10','w':'#ffffff',
           'e':'#c9ccd2','t':'#2a2e3a','T':'#1c1f28','b':'#141216','c':'#16141c','C':'#2c2a36','m':'#7a3a30','r':'#3a3e46',
           'R':'#ff3d5a','l':'#5a5f6a','L':'#fff59d','s':'#a8785a','i':'#3a6ea8'}
    S = Art(40, 37, pal)
    # head (bald under the cap)
    S.rect(14, 3, 25, 12, 'f'); S.rect(15, 2, 24, 2, 'f'); S.rect(15, 13, 24, 13, 'f')
    S.rect(24, 4, 25, 12, 'F'); S.rect(16, 2, 19, 2, 'h'); S.px(15, 3, 'h')
    S.rect(13, 7, 13, 9, 'F'); S.rect(26, 7, 26, 9, 'F')
    S.px(17, 7, 'g'); S.px(22, 7, 'g')                                     # tiny eyes behind the shades
    S.rect(16, 5, 18, 5, 'F'); S.rect(21, 5, 23, 5, 'F')
    S.rect(19, 8, 20, 9, 'F'); S.px(19, 9, 'f')                            # nose
    S.rect(17, 11, 22, 11, 'm'); S.px(16, 12, 'm'); S.px(23, 12, 'm')      # frown
    for x in range(15, 25):
        if (x % 2) == 0: S.px(x, 13, 's')
    S.px(15, 12, 's'); S.px(24, 12, 's')
    for (x, y) in ((27, 9), (27, 10), (26, 11), (27, 12), (27, 13)): S.px(x, y, 'e')   # earpiece wire
    S.rect(16, 14, 23, 14, 'F')
    # torso: huge shoulders, black tee
    for y in range(15, 29):
        inset = 0 if y < 21 else (y - 21) // 3
        S.rect(9 + inset, y, 30 - inset, y, 'k')
    S.rect(17, 15, 22, 15, 'F')                                            # collar
    S.rect(28, 17, 29, 26, 'K'); S.rect(9, 15, 30, 15, 'K'); S.rect(17, 15, 22, 15, 'F')
    text(S, 11, 18, 'SEGUR', 'y')
    # sleeves + arms
    for x0, sh in ((4, 'k'), (31, 'k')):
        S.rect(x0, 15, x0+4, 20, sh); S.rect(x0, 21, x0+4, 28, 'f'); S.rect(x0, 29, x0+4, 31, 'f')
    S.px(4, 15, '.'); S.px(35, 15, '.')
    S.rect(8, 21, 8, 28, 'F'); S.rect(35, 21, 35, 31, 'F'); S.rect(4, 31, 8, 31, 'F'); S.rect(31, 31, 35, 31, 'F')
    S.rect(5, 23, 6, 25, 'i'); S.px(6, 24, 'f')                            # tattoo
    S.rect(32, 28, 34, 28, 'F'); S.rect(5, 28, 7, 28, 'F')
    # walkie-talkie (left fist) + torch (right fist)
    S.rect(1, 24, 3, 31, 'r'); S.rect(1, 19, 1, 23, 'g'); S.px(2, 25, 'R'); S.rect(2, 27, 2, 29, 'g'); S.px(3, 24, 'l')
    S.rect(36, 27, 38, 31, 'l'); S.rect(36, 23, 39, 26, 'l'); S.rect(36, 22, 39, 22, 'L'); S.px(37, 21, 'L'); S.px(38, 21, 'L'); S.px(38, 28, 'e')
    # belt, legs, boots
    S.rect(11, 29, 28, 29, 'T'); S.rect(19, 29, 20, 29, 'y')
    S.rect(11, 30, 18, 34, 't'); S.rect(21, 30, 28, 34, 't'); S.rect(18, 30, 18, 34, 'T'); S.rect(28, 30, 28, 34, 'T')
    S.rect(10, 35, 18, 36, 'b'); S.rect(21, 35, 29, 36, 'b'); S.rect(10, 35, 12, 35, 'C'); S.rect(21, 35, 23, 35, 'C')
    cap = Art(16, 5, pal)
    cap.rect(2, 0, 13, 3, 'c'); cap.rect(3, 0, 12, 0, 'C'); cap.rect(0, 3, 15, 4, 'C'); cap.rect(0, 4, 15, 4, 'c'); cap.rect(6, 1, 9, 2, 'y'); cap.px(7, 1, 'c'); cap.px(8, 2, 'c')
    shades = Art(12, 3, pal)
    shades.rect(0, 0, 11, 0, 'g'); shades.rect(1, 0, 4, 2, 'g'); shades.rect(7, 0, 10, 2, 'g'); shades.px(2, 0, 'w'); shades.px(8, 0, 'w'); shades.px(1, 2, '.'); shades.px(10, 2, '.')
    B = Boss(40, 37)
    B.add('walkie', S.cut(1, 19, 3, 31), 1, 19)
    B.add('torch', S.cut(36, 21, 39, 31), 36, 21)
    B.add('cap', cap, 12, 0, True)
    B.add('armL', S.cut(4, 15, 8, 31), 4, 15)
    B.add('armR', S.cut(31, 15, 35, 31), 31, 15)
    B.add('shades', shades, 14, 6, True)
    B.add('core', S.crop(9, 2, 30, 36), 9, 2)
    return B
BOSSES['bouncer'] = bouncer()

# ------------------------------------------------------------------ BAFLE DORREA (the PA stack)
def speakers():
    pal = {'k':'#141218','K':'#26232c','g':'#3a3642','G':'#55505e','s':'#c9ccd2','S':'#8a8e96','x':'#ff7eb6','X':'#c0508a',
           'c':'#5ef6ff','C':'#2a9ab0','y':'#ffe14d','r':'#ff3d5a','n':'#39ff6a','w':'#ffffff','m':'#7a7f88','o':'#ff8a1e'}
    S = Art(36, 39, pal)
    def cab(y0, y1):
        S.rect(3, y0, 32, y1, 'K'); S.rect(4, y0+1, 31, y1-1, 'g')
        for y in range(y0+1, y1):
            for x in range(4, 32):
                if (x + y) % 2 == 0: S.px(x, y, 'K')                       # grille cloth
        S.rect(3, y0, 32, y0, 'G'); S.rect(32, y0, 32, y1, 'k'); S.rect(3, y1, 32, y1, 'k')
        for (x, y) in ((3, y0), (32, y0), (3, y1), (32, y1)):
            S.px(x, y, 's')
        S.px(4, y0, 's'); S.px(3, y0+1, 's'); S.px(31, y0, 's'); S.px(32, y0+1, 'S'); S.px(4, y1, 'S'); S.px(3, y1-1, 's'); S.px(31, y1, 'S'); S.px(32, y1-1, 'S')
    def cone(T, cx, cy, r, cap='x'):
        T.ellipse(cx, cy, r, r, 's'); T.ellipse(cx, cy, r-1, r-1, 'k'); T.ring(cx, cy, r-2.6, r-1.9, 'G')
        T.ellipse(cx, cy, 1.6, 1.6, cap); T.px(int(cx), int(cy), 'w')
        T.ring(cx, cy, r-0.6, r+0.2, 'S') if False else None
    cab(24, 38); cone(S, 10.5, 31, 5.4); cone(S, 24.5, 31, 5.4)
    S.rect(5, 39 - 1, 8, 38, 'k'); S.rect(27, 38, 30, 38, 'k')
    # LED meter between the cabinets (the "mouth")
    S.rect(3, 21, 32, 23, 'k')
    for i, x in enumerate(range(5, 31, 2)):
        S.px(x, 22, 'n' if i < 7 else 'y' if i < 10 else 'r')
    # upper cabinet: blown holes under the eye cones
    cab(8, 20)
    for cx in (10.5, 24.5):
        S.ellipse(cx, 14, 4.6, 4.6, 'k'); S.px(int(cx)-1, 13, 'o'); S.px(int(cx)+2, 15, 'y'); S.px(int(cx), 16, 'r'); S.line(int(cx)-2, 15, int(cx)+1, 12, 'S')
    S.line(5, 8, 11, 10, 'r'); S.line(5, 9, 11, 11, 'r'); S.line(30, 8, 24, 10, 'r'); S.line(30, 9, 24, 11, 'r')   # angry brows
    # horn box
    S.rect(8, 2, 27, 7, 'K'); S.rect(8, 2, 27, 2, 'G'); S.rect(10, 3, 25, 6, 's'); S.rect(11, 4, 24, 5, 'k'); S.rect(12, 4, 15, 4, 'C'); S.rect(10, 6, 25, 6, 'S')
    # par cans on the top corners
    for x0, col in ((2, 'x'), (29, 'c')):
        S.rect(x0, 0, x0+4, 3, 'K'); S.rect(x0, 0, x0+4, 0, 'G'); S.rect(x0+1, 4, x0+3, 5, col); S.px(x0+2, 4, 'w'); S.rect(x0+2, 6, x0+2, 7, 'm')
    eye = Art(11, 11, pal); cone(eye, 5, 5, 5.2, 'r')
    B = Boss(36, 39)
    B.add('lightL', S.cut(2, 0, 6, 7), 2, 0)
    B.add('lightR', S.cut(29, 0, 33, 7), 29, 0)
    B.add('horn', S.cut(8, 2, 27, 7), 8, 2)
    B.add('eyeL', eye, 5, 9, True)
    B.add('eyeR', eye, 19, 9, True)
    B.add('core', S.crop(3, 8, 32, 38), 3, 8)
    return B
BOSSES['speakers'] = speakers()

# ------------------------------------------------------------------ MANAGERRA (the manager)
def manager():
    pal = {'f':'#e8b48c','F':'#c08a62','l':'#f6cfa8','h':'#16121a','H':'#3a3446','g':'#ffd23d','G':'#b8860b','k':'#0c0c10','w':'#ffffff',
           'W':'#cfd2d6','u':'#6a3f9a','U':'#48286e','i':'#8a5fc0','t':'#ff7eb6','T':'#c0508a','s':'#f4f4f2','c':'#7a4a22',
           'C':'#ff8a1e','m':'#b8bcc8','p':'#24222a','P':'#5ef6ff','b':'#8a5a2a','B':'#4a2a12','r':'#a0283a','e':'#141216','n':'#5be35b','N':'#2fa84a'}
    S = Art(40, 37, pal)
    # head, slick hair, aviators, big grin with a gold tooth
    S.rect(14, 4, 25, 13, 'f'); S.rect(15, 14, 24, 14, 'f'); S.rect(24, 5, 25, 13, 'F'); S.rect(13, 8, 13, 10, 'F'); S.rect(26, 8, 26, 10, 'F')
    S.rect(14, 1, 25, 4, 'h'); S.rect(13, 3, 13, 6, 'h'); S.rect(26, 3, 26, 6, 'h'); S.rect(15, 0, 24, 0, 'h'); S.rect(16, 2, 22, 2, 'H'); S.px(15, 3, 'H'); S.px(23, 1, 'H')
    S.rect(14, 6, 25, 6, 'g'); S.rect(15, 7, 18, 9, 'k'); S.rect(21, 7, 24, 9, 'k'); S.px(15, 9, 'f'); S.px(24, 9, 'F'); S.px(16, 7, 'w'); S.px(22, 7, 'w'); S.rect(15, 6, 18, 6, 'g'); S.rect(21, 6, 24, 6, 'g')
    S.rect(19, 9, 20, 10, 'F')
    S.rect(16, 11, 23, 12, 'w'); S.px(21, 11, 'g'); S.px(21, 12, 'g'); S.px(18, 12, 'W'); S.px(20, 12, 'W'); S.rect(16, 13, 23, 13, 'r'); S.px(15, 11, 'r'); S.px(24, 11, 'r')
    S.rect(24, 12, 28, 12, 'c'); S.px(29, 12, 'C')
    for (x, y) in ((30, 10), (31, 8), (30, 6), (31, 4)): S.px(x, y, 'm')
    S.rect(17, 15, 22, 15, 'F')
    # pinstripe suit with wide shoulder pads
    S.rect(6, 16, 33, 19, 'u'); S.rect(8, 20, 31, 29, 'u'); S.px(6, 16, '.'); S.px(33, 16, '.')
    for x in range(8, 32, 3): S.rect(x, 17, x, 29, 'i')
    S.rect(31, 20, 31, 29, 'U'); S.rect(8, 29, 31, 29, 'U'); S.rect(6, 19, 7, 19, 'U'); S.rect(32, 19, 33, 19, 'U')
    for i, w in enumerate([8, 8, 6, 6, 4, 4, 2, 2]):                        # shirt V + lapels
        y = 16 + i
        S.rect(20 - w//2 - 1, y, 19 + w//2 + 1, y, 'U'); S.rect(20 - w//2, y, 19 + w//2, y, 's')
    S.rect(26, 21, 28, 21, 'n'); S.px(27, 20, 'n'); S.px(28, 20, 'N')       # cash in the breast pocket
    S.px(19, 27, 'g'); S.px(20, 27, 'g')
    # right arm + briefcase full of contracts
    S.rect(33, 20, 36, 28, 'u'); S.rect(36, 20, 36, 28, 'U'); S.rect(33, 29, 36, 30, 'f'); S.rect(33, 28, 36, 28, 's')
    S.rect(32, 31, 37, 31, 'B'); S.rect(31, 32, 39, 36, 'b'); S.rect(31, 36, 39, 36, 'B'); S.rect(39, 32, 39, 36, 'B'); S.px(34, 33, 'g'); S.px(36, 33, 'g'); S.rect(31, 34, 39, 34, 'B')
    # legs + pointy shoes
    S.rect(10, 30, 18, 34, 'U'); S.rect(21, 30, 29, 34, 'U'); S.rect(12, 30, 12, 34, 'u'); S.rect(23, 30, 23, 34, 'u')
    S.rect(8, 35, 18, 36, 'e'); S.rect(21, 35, 30, 36, 'e'); S.px(9, 35, 'W'); S.px(22, 35, 'W')
    # left arm raised, phone to the ear (front overlay)
    arm = Art(9, 16, pal)
    arm.rect(1, 6, 4, 15, 'u'); arm.rect(1, 6, 1, 15, 'i'); arm.rect(2, 4, 5, 7, 'u'); arm.rect(4, 14, 8, 15, 'u'); arm.rect(4, 12, 6, 13, 'u'); arm.rect(1, 15, 8, 15, 'U')
    arm.rect(3, 1, 6, 4, 'f'); arm.rect(3, 4, 6, 4, 's'); arm.px(6, 2, 'F'); arm.px(3, 1, 'l')
    tie = Art(4, 11, pal)
    tie.rect(1, 0, 2, 0, 'T'); tie.rect(1, 1, 2, 7, 't'); tie.rect(0, 5, 3, 8, 't'); tie.rect(1, 9, 2, 10, 't'); tie.rect(2, 1, 2, 8, 'T'); tie.px(3, 8, 'T'); tie.px(2, 10, 'T')
    phone = Art(3, 8, pal); phone.rect(0, 0, 2, 7, 'p'); phone.rect(1, 1, 1, 5, 'P'); phone.px(1, 6, 'W')
    B = Boss(40, 37)
    B.add('cigar', S.cut(27, 4, 32, 12), 27, 4)
    B.add('phone', phone, 10, 4, True)
    B.add('briefcase', S.cut(31, 31, 39, 36), 31, 31)
    B.add('armL', arm, 4, 6, True)
    B.add('armR', S.cut(33, 20, 36, 30), 33, 20)
    B.add('tie', tie, 18, 16, True)
    B.add('core', S.crop(6, 0, 33, 36), 6, 0)
    return B
BOSSES['manager'] = manager()

# ------------------------------------------------------------------ LA PAJA (final boss: the bale)
def paja():
    pal = {'y':'#e8c24a','Y':'#c79a2a','h':'#fff0a0','d':'#9a7218','D':'#5a400c','w':'#ffffff','r':'#e0283c','k':'#1a1014',
           'g':'#ffd23d','G':'#b8860b','j':'#ff7eb6','c':'#5ef6ff','m':'#3a0c14','t':'#fff8e0','o':'#7a4a22','O2':'#000000',
           's':'#c9ccd2','S':'#8a8e96','p':'#ff9ac8'}
    pal.pop('O2')
    W, H = 52, 40
    S = Art(W, H, pal)
    rnd = random.Random(7)
    cx, cy, rx, ry = 25.5, 24, 18, 14.5
    S.ellipse(cx, cy, rx, ry, 'y')
    inside = lambda x, y, k=1.0: ((x-cx)/(rx*k))**2 + ((y-cy)/(ry*k))**2 <= 1
    for y in range(H):
        for x in range(W):
            if not inside(x, y): continue
            if (x-cx)/rx + (y-cy)/ry > 0.85: S.px(x, y, 'Y')
            if (x-cx)/rx + (y-cy)/ry < -0.95: S.px(x, y, 'h')
    # rolled-bale spiral
    for k in (0.84, 0.64, 0.44, 0.24):
        for a in range(0, 360, 2):
            t = math.radians(a)
            if rnd.random() < 0.72: S.px(round(cx + math.cos(t)*rx*k), round(cy + math.sin(t)*ry*k), 'd')
    for _ in range(90):                                                    # loose strands
        x, y = rnd.randint(8, 43), rnd.randint(10, 38)
        if inside(x, y, 0.95): S.px(x, y, rnd.choice('hhdY')); 
        if inside(x+1, y, 0.95) and rnd.random() < 0.5: S.px(x+1, y, S.get(x, y))
    # face
    for x0 in (15, 30):
        S.rect(x0, 19, x0+6, 24, 'w'); S.px(x0, 19, 'y'); S.px(x0+6, 19, 'y'); S.px(x0, 24, 'y'); S.px(x0+6, 24, 'y')
    S.rect(18, 21, 20, 23, 'r'); S.px(19, 22, 'k'); S.rect(31, 21, 33, 23, 'r'); S.px(32, 22, 'k'); S.px(18, 21, 'p'); S.px(31, 21, 'p')
    S.rect(16, 28, 35, 33, 'm'); S.px(16, 28, 'y'); S.px(35, 28, 'y'); S.px(16, 33, 'y'); S.px(35, 33, 'y'); S.rect(15, 29, 15, 31, 'm'); S.rect(36, 29, 36, 31, 'm')
    for x in range(17, 35, 3):
        S.rect(x, 28, x+1, 29, 't'); S.px(x, 30, 't')
    for x in range(18, 34, 3):
        S.rect(x, 32, x+1, 33, 't'); S.px(x+1, 31, 't')
    S.rect(23, 31, 28, 31, 'r')
    # straw tufts on top
    for x in range(10, 42):
        if 20 <= x <= 31: continue
        top = cy - ry*math.sqrt(max(0, 1-((x-cx)/rx)**2))
        hgt = rnd.randint(2, 6)
        for y in range(int(top)-hgt, int(top)+1): S.px(x, y, rnd.choice('yyhYd'))
    # arms: straw bundles, the right one holds a pitchfork
    for y in range(22, 28):
        S.rect(1, y, 8, y, 'y'); S.rect(43, y, 48, y, 'y')
    S.rect(1, 27, 8, 27, 'Y'); S.rect(43, 27, 48, 27, 'Y'); S.rect(5, 22, 5, 27, 'o'); S.rect(44, 22, 44, 27, 'o')
    for y in (21, 23, 25, 28): S.px(0, y, 'h'); S.px(1, y-1, 'y')
    S.rect(2, 21, 3, 21, 'h'); S.rect(46, 21, 47, 21, 'h')
    S.rect(49, 9, 49, 34, 'o'); S.rect(46, 5, 51, 5, 's') if False else None
    S.rect(47, 8, 51, 8, 's'); S.rect(47, 2, 47, 8, 's'); S.rect(49, 2, 49, 8, 's'); S.rect(51, 2, 51, 8, 'S'); S.px(47, 1, 'w'); S.px(49, 1, 'w'); S.px(51, 1, 'w')
    S.rect(47, 22, 50, 27, 'y'); S.rect(47, 27, 50, 27, 'Y')
    # crown
    C = Art(14, 8, pal)
    C.rect(0, 4, 13, 7, 'g'); C.rect(0, 7, 13, 7, 'G'); C.rect(13, 4, 13, 7, 'G')
    for x0 in (0, 4, 8, 12):
        C.rect(x0, 2, x0+1, 3, 'g'); C.px(x0, 1, 'g') if x0 < 12 else C.px(x0+1, 1, 'g')
    C.rect(6, 0, 7, 3, 'g'); C.px(3, 5, 'j'); C.px(6, 5, 'c'); C.px(7, 5, 'c'); C.px(10, 5, 'j'); C.px(1, 4, 'h'); C.px(2, 4, 'h')
    brows = Art(24, 6, pal)
    for t in (0, 1):
        brows.line(1, 1+t, 9, 4+t, 'k'); brows.line(22, 1+t, 14, 4+t, 'k')
    brows.px(0, 1, 'k'); brows.px(23, 1, 'k')
    B = Boss(W, H)
    B.add('crown', C, 19, 0)
    B.add('tuftL', S.cut(9, 0, 19, 12), 9, 0)
    B.add('tuftR', S.cut(32, 0, 42, 12), 32, 0)
    B.add('fork', S.cut(45, 0, 51, 35), 45, 0)
    B.add('armL', S.cut(0, 19, 7, 29), 0, 19)
    B.add('brows', brows, 14, 13, True)
    B.add('core', S.crop(7, 8, 44, 39), 7, 8)
    return B
BOSSES['paja'] = paja()

# ------------------------------------------------------------------ what they throw
SHOTS = {}
def shot(name, w, h, pal): S = Art(w, h, pal); SHOTS[name] = S; return S
# van: spanners + a bouncing wheel
S = shot('wrench', 5, 11, {'s':'#c9ccd2','S':'#8a8e96','w':'#ffffff'})
S.rect(0,0,1,2,'s'); S.rect(3,0,4,2,'s'); S.rect(0,2,4,3,'s'); S.rect(2,4,2,8,'s'); S.rect(1,9,3,10,'s'); S.px(2,9,'S'); S.px(4,3,'S'); S.px(0,0,'w'); S.rect(3,5,3,8,'S') if False else None
S = shot('wheel', 13, 13, {'t':'#24222a','T':'#4a4652','s':'#c9ccd2','S':'#8a8e96','p':'#ff7eb6'})
S.ellipse(6,6,6.3,6.3,'t'); S.ring(6,6,4.6,5.3,'T'); S.ellipse(6,6,3.4,3.4,'s'); S.ellipse(6,6,1.3,1.3,'p')
for a in range(0,360,60): S.px(round(6+math.cos(math.radians(a))*2.6), round(6+math.sin(math.radians(a))*2.6), 'S')
# bouncer: torches + crowd barriers
S = shot('torch', 5, 11, {'l':'#5a5f6a','L':'#3a3e46','y':'#fff59d','w':'#ffffff','r':'#ff3d5a'})
S.rect(1,0,3,6,'l'); S.rect(3,0,3,6,'L'); S.rect(0,7,4,9,'l'); S.rect(0,10,4,10,'y'); S.px(2,10,'w'); S.px(2,3,'r')
S = shot('barrier', 15, 11, {'s':'#c9ccd2','S':'#8a8e96','y':'#ffd23d','k':'#1a1416'})
S.rect(0,0,14,0,'s'); S.rect(0,7,14,7,'S')
for x in (0,2,4,6,8,10,12,14): S.rect(x,0,x,7,'s')
S.rect(0,0,0,10,'s'); S.rect(14,0,14,10,'S'); S.rect(0,10,2,10,'S'); S.rect(12,10,14,10,'S'); S.rect(5,2,9,4,'y'); S.px(7,3,'k')
# speakers: notes + a bass blast
S = shot('note', 7, 11, {'c':'#5ef6ff','C':'#2a9ab0','w':'#ffffff'})
S.rect(3,0,3,8,'c'); S.rect(4,0,6,1,'c'); S.rect(5,2,6,3,'C'); S.rect(0,7,3,10,'c'); S.px(0,7,'.'); S.px(0,10,'.'); S.px(1,8,'w'); S.rect(3,9,3,10,'C')
S = shot('bass', 13, 13, {'x':'#ff7eb6','X':'#c0508a','w':'#ffffff','k':'#1a1020','y':'#ffe14d'})
S.ellipse(6,6,6.3,6.3,'k'); S.ring(6,6,5.0,6.3,'x'); S.ring(6,6,2.8,3.7,'X'); S.ellipse(6,6,1.4,1.4,'y'); S.px(6,6,'w'); S.px(3,2,'w'); S.px(2,3,'w')
# manager: contracts + his briefcase
S = shot('contract', 7, 9, {'w':'#f4f4f2','W':'#c9ccd2','k':'#3a3640','r':'#e0283c'})
S.rect(0,0,6,8,'w'); S.rect(6,0,6,8,'W'); S.rect(0,8,6,8,'W')
for y in (1,3,5): S.rect(1,y,4,y,'k')
S.rect(1,6,2,6,'k'); S.rect(4,6,5,7,'r')
S = shot('briefcase', 13, 11, {'b':'#8a5a2a','B':'#4a2a12','g':'#ffd23d','h':'#b8803a'})
S.rect(4,0,8,0,'B'); S.px(4,1,'B'); S.px(8,1,'B'); S.rect(0,2,12,10,'b'); S.rect(0,10,12,10,'B'); S.rect(12,2,12,10,'B'); S.rect(0,5,12,5,'B'); S.rect(1,3,5,3,'h'); S.px(3,6,'g'); S.px(9,6,'g'); S.rect(5,5,7,6,'g')
# la paja: straw darts + mini bales
S = shot('straw', 5, 11, {'y':'#e8c24a','Y':'#c79a2a','h':'#fff0a0','o':'#7a4a22'})
S.rect(1,0,1,10,'y'); S.rect(2,1,2,10,'h'); S.rect(3,0,3,9,'Y'); S.px(0,2,'y'); S.px(4,3,'Y'); S.rect(1,5,3,6,'o'); S.px(2,10,'y'); S.px(1,10,'.'); S.px(0,8,'h')
S = shot('bale', 13, 11, {'y':'#e8c24a','Y':'#c79a2a','h':'#fff0a0','d':'#9a7218','o':'#7a4a22'})
S.rect(0,0,12,10,'y'); S.rect(0,9,12,10,'Y'); S.rect(11,0,12,10,'Y'); S.rect(0,0,12,0,'h')
rnd = random.Random(3)
for _ in range(26): S.px(rnd.randint(0,12), rnd.randint(1,9), rnd.choice('hdY'))
S.rect(3,0,3,10,'o'); S.rect(9,0,9,10,'o')

if __name__ == '__main__':
    from PIL import Image
    ims = []
    for k, b in BOSSES.items():
        b.preview(f'boss_{k}.png', 8); ims.append(Image.open(f'boss_{k}.png'))
    for k, s in SHOTS.items():
        s.outline().png(f'shot_{k}.png', 8); ims.append(Image.open(f'shot_{k}.png'))
    W = sum(i.width + 8 for i in ims[:5]); H = max(i.height for i in ims[:5])
    sheet = Image.new('RGB', (W, H + 120), (120, 122, 130)); x = 0
    for i in ims[:5]: sheet.paste(i, (x, 0)); x += i.width + 8
    x = 0
    for i in ims[5:]: sheet.paste(i, (x, H + 8)); x += i.width + 8
    sheet.save('bosses_sheet.png')
    print(sheet.size)
