# Victory scene: the stage the band was walking to, with the instruments waiting (120 px wide).
# python3 scripts/sprites/stage_win.py -> stage_win.png
import math
from kit import Art, text

pal = {
 'n':'#120a1c','N':'#1c1028','q':'#261636',                       # backdrop curtain
 'm':'#7a7f88','M':'#4a4e56','k':'#0e0c12','K':'#24222a','g':'#3a3642','G':'#55505e',
 'w':'#f4f4f2','W':'#c9ccd2','s':'#c9ccd2','S':'#8a8e96',
 'x':'#ff7eb6','X':'#c0508a','v':'#9b4f9e','V':'#6a3274','c':'#5ef6ff','y':'#ffe14d','Y':'#c79a2a','r':'#ff3d5a','R':'#a01a30',
 'd':'#8a5a34','D':'#5a3a20','e':'#3a2414','u':'#3346a8','U':'#1f2a6e','l':'#6577d6',
 'b':'#e8d8b0','o':'#ff8a1e','t':'#d9963b',
}
W, H = 120, 100
S = Art(W, H, pal)
# curtain
S.rect(0, 0, W-1, 71, 'n')
for x in range(0, W, 6):
    S.rect(x, 0, x+1, 71, 'N'); S.rect(x+3, 0, x+3, 71, 'q') if (x // 6) % 2 else None
# truss
S.rect(2, 2, 117, 8, 'M'); S.rect(3, 3, 116, 7, 'k')
for x in range(3, 116, 4): S.line(x, 7, x+2, 3, 'm'); S.line(x+2, 3, x+4, 7, 'M')
for x0 in (2, 112):
    S.rect(x0, 8, x0+5, 71, 'M'); S.rect(x0+1, 8, x0+4, 71, 'k')
    for y in range(9, 70, 4): S.line(x0+1, y, x0+4, y+2, 'm'); S.line(x0+4, y+2, x0+1, y+4, 'M')
# par cans
CANS = [(16,'x'),(31,'y'),(46,'c'),(60,'r'),(74,'c'),(89,'y'),(104,'x')]
for lx, c in CANS:
    S.rect(lx-2, 9, lx+2, 13, 'K'); S.rect(lx-2, 9, lx+2, 9, 'G'); S.rect(lx-1, 14, lx+1, 15, c); S.px(lx, 14, 'w')
# banner
S.rect(27, 18, 92, 30, 'V'); S.rect(28, 19, 91, 29, 'v'); S.rect(28, 29, 91, 29, 'V')
text(S, 31, 22, 'FEOS PERO MAJOS', 'V'); text(S, 30, 21, 'FEOS PERO MAJOS', 'w')
S.px(27, 17, 'm'); S.px(92, 17, 'm'); S.line(27, 17, 27, 9, 'm'); S.line(92, 17, 92, 9, 'm')

def cone(cx, cy, r, cap='x'):
    S.ellipse(cx, cy, r, r, 'S'); S.ellipse(cx, cy, r-1, r-1, 'k'); S.ring(cx, cy, r-2.6, r-1.9, 'G'); S.ellipse(cx, cy, 1.2, 1.2, cap)
# PA stacks
for x0 in (9, 95):
    for y0 in (40, 56):
        S.rect(x0, y0, x0+15, y0+15, 'K'); S.rect(x0+1, y0+1, x0+14, y0+14, 'g'); S.rect(x0, y0, x0+15, y0, 'G')
        cone(x0+7.5, y0+8, 5.6)
    S.rect(x0+2, 36, x0+13, 39, 'K'); S.rect(x0+3, 37, x0+12, 38, 's'); S.rect(x0+4, 37, x0+11, 37, 'k')
# backline amps
def amp(x0, y0, w, h, col):
    S.rect(x0, y0, x0+w-1, y0+h-1, 'K'); S.rect(x0+1, y0+4, x0+w-2, y0+h-2, col); S.rect(x0, y0, x0+w-1, y0, 'G')
    for y in range(y0+4, y0+h-1):
        for x in range(x0+1, x0+w-1):
            if (x + y) % 2: S.px(x, y, 'K')
    S.rect(x0+1, y0+1, x0+w-2, y0+2, 's')
    for x in range(x0+2, x0+w-2, 2): S.px(x, y0+2, 'k')
    S.px(x0+w-3, y0+1, 'r')
amp(29, 50, 13, 22, 'g'); amp(79, 44, 13, 12, 'g'); amp(79, 56, 13, 16, 'G')
# drum riser + kit
S.rect(42, 64, 78, 71, 'K'); S.rect(42, 64, 78, 64, 'G'); S.rect(43, 66, 77, 66, 'x')
S.ellipse(60, 54.5, 9.4, 9.4, 'W'); S.ellipse(60, 54.5, 8.3, 8.3, 'x'); S.ellipse(60, 54.5, 6.6, 6.6, 'w')
text(S, 55, 52, 'FPM', 'V')
S.ring(60, 54.5, 8.9, 9.6, 'S')
S.rect(50, 62, 51, 63, 'S'); S.rect(69, 62, 70, 63, 'S')
# toms
for x0 in (51, 62):
    S.rect(x0, 39, x0+7, 44, 'x'); S.rect(x0, 39, x0+7, 40, 'w'); S.rect(x0, 44, x0+7, 44, 'X'); S.rect(x0+7, 41, x0+7, 44, 'X'); S.px(x0+2, 42, 'S'); S.px(x0+5, 42, 'S')
S.rect(58, 43, 61, 46, 'S')
# snare + floor tom
S.rect(43, 50, 50, 54, 'W'); S.rect(43, 50, 50, 50, 'w'); S.rect(43, 54, 50, 54, 'S'); S.line(45, 55, 43, 63, 'S'); S.line(48, 55, 50, 63, 'S')
S.rect(70, 49, 78, 60, 'x'); S.rect(70, 49, 78, 50, 'w'); S.rect(78, 51, 78, 60, 'X'); S.rect(70, 60, 78, 60, 'X'); S.rect(71, 61, 71, 63, 'S'); S.rect(77, 61, 77, 63, 'S')
# cymbals + hi-hat
S.rect(38, 36, 49, 36, 'y'); S.rect(40, 37, 47, 37, 'Y'); S.rect(43, 38, 43, 49, 'S'); S.px(43, 35, 'S')
S.rect(70, 33, 82, 33, 'y'); S.rect(72, 34, 80, 34, 'Y'); S.rect(76, 35, 76, 48, 'S'); S.px(76, 32, 'S')
S.rect(36, 46, 42, 46, 'y'); S.rect(36, 48, 42, 48, 'Y'); S.rect(39, 49, 39, 63, 'S'); S.line(39, 60, 36, 63, 'S'); S.line(39, 60, 42, 63, 'S')
# stage deck (planks) + fascia
S.rect(0, 72, W-1, 83, 'd')
for y in (72, 76, 80): S.rect(0, y, W-1, y, 'D')
S.rect(0, 72, W-1, 72, 't')
for i, x in enumerate(range(0, W, 9)):
    S.rect(x + (3 if i % 2 else 0), 73, x + (3 if i % 2 else 0), 75, 'D'); S.rect(x + 5, 77, x + 5, 79, 'D'); S.rect(x + (1 if i % 2 else 6), 81, x + (1 if i % 2 else 6), 83, 'D')
S.rect(0, 84, W-1, H-1, 'K'); S.rect(0, 84, W-1, 84, 'e'); S.rect(6, 87, W-7, 88, 'x'); S.rect(6, 88, W-7, 88, 'X')
for x in range(8, W-8, 6): S.px(x, 87, 'w')
for x in range(0, W, 14): S.rect(x, 90, x, H-1, 'k')

def guitar(x, y, body, shade, guard, bass=False):
    """Instrument on a stand, headstock up. (x, y) = top of the headstock."""
    n = 22 if bass else 17
    S.rect(x+2, y, x+4, y+3, 'e'); S.px(x+1, y+1, 'S'); S.px(x+5, y+1, 'S'); S.px(x+1, y+3, 'S'); S.px(x+5, y+3, 'S')
    S.rect(x+3, y+4, x+3, y+n, 'd'); S.rect(x+2, y+4, x+2, y+n, 'e') if bass else None
    for yy in range(y+6, y+n, 3): S.px(x+3, yy, 'b')
    by = y + n
    S.ellipse(x+3, by+3, 3.6, 3.2, body); S.ellipse(x+3, by+8, 4.6, 4.4, body)
    S.px(x+3, by, '.'); S.px(x+2, by, '.') ; S.px(x+4, by, '.')
    S.rect(x+3, by, x+3, by+9, 'd') if False else None
    S.ellipse(x+2, by+8, 2.2, 2.6, guard)
    S.rect(x+2, by+4, x+4, by+4, 'k'); S.rect(x+2, by+7, x+4, by+7, 'k'); S.rect(x+2, by+10, x+4, by+10, 'S')
    S.rect(x+3, by+1, x+3, by+9, 'W')                                    # strings
    for yy in range(by+5, by+13):
        if S.get(x+7, yy) == body: S.px(x+7, yy, shade)
        if S.get(x+6, yy) == body and yy > by+9: S.px(x+6, yy, shade)
    S.px(x+6, by+10, 'w'); S.px(x+6, by+11, 'y')
    # stand
    S.line(x+3, by+13, x-1, 71, 'S'); S.line(x+3, by+13, x+7, 71, 'S'); S.rect(x+1, y+n-3, x+5, y+n-3, 'S')
guitar(22, 30, 'u', 'U', 'w', bass=True)
guitar(95 - 3, 38, 'r', 'R', 'b')
# mic stand centre-front + monitors
S.rect(60, 44, 60, 76, 'S'); S.rect(58, 41, 62, 43, 'G'); S.rect(58, 41, 62, 41, 'W'); S.px(60, 44, 'k'); S.line(60, 74, 55, 78, 'S'); S.line(60, 74, 65, 78, 'S'); S.rect(59, 76, 61, 78, 'S')
for x0 in (30, 76):
    S.rect(x0, 76, x0+13, 82, 'K'); S.rect(x0+1, 77, x0+12, 81, 'g'); S.rect(x0, 76, x0+13, 76, 'G')
    for x in range(x0+2, x0+12, 2): S.px(x, 79, 'K')
    S.px(x0, 76, '.'); S.px(x0+13, 76, '.')
# the setlist taped to the deck next to the mic
S.rect(66, 77, 72, 82, 'w'); S.rect(67, 78, 71, 78, 'k'); S.rect(67, 80, 70, 80, 'S'); S.rect(66, 76, 67, 77, 'y'); S.rect(71, 76, 72, 77, 'y'); S.rect(72, 78, 72, 82, 'W')

if __name__ == '__main__':
    S.png('stage_win.png', 8, (20, 12, 28))
    print(S.w, S.h, CANS)
