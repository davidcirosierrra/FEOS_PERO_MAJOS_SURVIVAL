# Big scenery textures for the first-person view: street wall tile and the concert stage.
from painter import Sprite
FONT = {
 'F':['###','#..','##.','#..','#..'], 'E':['###','#..','##.','#..','###'], 'O':['###','#.#','#.#','#.#','###'],
 'S':['###','#..','###','..#','###'], 'P':['##.','#.#','##.','#..','#..'], 'R':['##.','#.#','##.','#.#','#.#'],
 'M':['#.#','###','###','#.#','#.#'], 'A':['.#.','#.#','###','#.#','#.#'], 'J':['..#','..#','..#','#.#','.#.'],
 ' ':['...','...','...','...','...'],
}
def text(S, x, y, s, c):
    for ch in s:
        for j,row in enumerate(FONT[ch]):
            for i,v in enumerate(row):
                if v=='#': S.px(x+i, y+j, c)
        x += 4

# ---------------------------------------------------------------- street wall (four old-town buildings)
from kit import text as ktext
wp = {
 's':'#8c8f96','S':'#6c6f76','t':'#a3a6ac',                 # stone base
 'o':'#d9a85a','O':'#b88a40','b':'#8ab8d0','B':'#6a98b0','p':'#e8b0b8','P':'#c8909a','e':'#a8c49a','E':'#86a478',  # plaster colours
 'k':'#1e2228','g':'#2a3e4e','G':'#5a8098','w':'#f4f4f2','W':'#c9ccd2',
 'r':'#151518','d':'#6b3b1e','D':'#4a2812','y':'#ffd23d','Y':'#ffb84a','c':'#fff3c4',
 'x':'#ff7eb6','v':'#9b4f9e','n':'#2a1a30','f':'#3fae4f','F':'#e0283c','q':'#17402a','Q':'#2e8b57','z':'#5ef6ff',
}
BW = 48
W = Sprite(BW*4, 64, wp)
def building(i, col, shade, ground, lit):
    x0 = i*BW
    W.rect(x0,0,x0+BW-1,63,col); W.rect(x0+BW-3,0,x0+BW-2,63,shade)
    for y in range(3, 46, 7):                                   # weathering
        W.rect(x0+2+(y*5)%30, y, x0+5+(y*5)%30, y, shade)
    W.rect(x0,0,x0+BW-1,1,'W'); W.rect(x0,2,x0+BW-1,2,shade)   # cornice
    n = 0
    for wx in (x0+8, x0+28):
        for wy in (6, 26):
            on = n in lit; n += 1
            W.rect(wx-1,wy-1,wx+10,wy+13,'W')                    # stone frame
            W.rect(wx,wy,wx+9,wy+12,'Y' if on else 'g')
            if on:
                W.rect(wx,wy,wx+1,wy+12,'c'); W.rect(wx+8,wy,wx+9,wy+12,'c'); W.rect(wx+2,wy,wx+7,wy+2,'y')   # curtains + lamp glow
            else:
                W.px(wx+1,wy+1,'G'); W.px(wx+6,wy+1,'G'); W.px(wx+2,wy+2,'G')
            W.rect(wx+4,wy,wx+5,wy+12,'k'); W.rect(wx,wy+6,wx+9,wy+6,'k')
            W.rect(wx-2,wy+13,wx+11,wy+13,'r')                   # iron balcony
            for bx in range(wx-2,wx+12,2): W.rect(bx,wy+10,bx,wy+13,'r')
            W.rect(wx-2,wy+10,wx+11,wy+10,'r')
            if (n + i) % 2: W.rect(wx-1,wy+8,wx+1,wy+9,'f'); W.px(wx,wy+7,'F'); W.rect(wx+8,wy+8,wx+10,wy+9,'f'); W.px(wx+9,wy+7,'x')   # geraniums
    W.rect(x0,46,x0+BW-1,63,'s')                               # stone ground floor
    for y in range(46,64):
        for x in range(x0,x0+BW):
            if y%5==0 or (x+(y//5)*4)%9==0: W.px(x,y,'S')
            elif (x*3+y)%13==0: W.px(x,y,'t')
    W.rect(x0+BW-1,0,x0+BW-1,63,'S'); W.px(x0+BW-1,20,'r'); W.px(x0+BW-1,44,'r')   # drainpipe
    W.rect(x0+6,49,x0+15,63,'d'); W.rect(x0+15,49,x0+15,63,'D'); W.rect(x0+10,49,x0+10,63,'D'); W.px(x0+13,56,'y')   # door
    W.rect(x0+5,48,x0+16,48,'W')
    if ground == 'poster':                                      # band posters
        W.rect(x0+24,50,x0+40,60,'n'); W.rect(x0+25,51,x0+39,59,'v'); text(W, x0+26, 52, 'FPM', 'x'); W.rect(x0+26,58,x0+38,58,'x')
        W.rect(x0+19,52,x0+22,58,'w'); W.rect(x0+20,53,x0+21,54,'F')
    elif ground == 'shop':
        W.rect(x0+24,49,x0+40,63,'k'); W.rect(x0+25,50,x0+39,62,'g'); W.rect(x0+32,50,x0+32,62,'k'); W.px(x0+26,51,'G'); W.px(x0+27,52,'G')
    elif ground == 'bar':                                       # tavern: green wood, lit window, sign
        W.rect(x0+20,46,x0+44,48,'q')
        W.rect(x0+17,39,x0+47,46,'q'); W.rect(x0+17,39,x0+47,39,'Q'); ktext(W, x0+19, 41, 'TABERNA', 'y')
        W.rect(x0+22,49,x0+42,63,'q'); W.rect(x0+23,50,x0+41,59,'Y'); W.rect(x0+23,50,x0+41,51,'y'); W.rect(x0+32,50,x0+32,59,'q')
        for bx,c in ((25,'f'),(27,'F'),(29,'d'),(35,'F'),(37,'f'),(39,'d')): W.rect(x0+bx,54,x0+bx,57,c); W.px(x0+bx,53,'k')
        W.rect(x0+23,58,x0+41,58,'d')
    elif ground == 'records':                                   # record shop with a neon sign
        W.rect(x0+20,41,x0+44,46,'n'); ktext(W, x0+22, 41, 'DISKO', 'z'); W.rect(x0+21,47,x0+43,47,'x')
        W.rect(x0+22,49,x0+42,63,'k'); W.rect(x0+23,50,x0+41,61,'g')
        for cx in (27, 33, 39):
            for dy in range(-2,3):
                for dx in range(-2,3):
                    if abs(dx)+abs(dy) <= 3: W.px(x0+cx+dx, 55+dy, 'r')
            W.px(x0+cx,55,'x' if cx != 33 else 'y')
building(0,'o','O','poster',{1})
building(1,'b','B','bar',{0,3})
building(2,'p','P','shop',{2})
building(3,'e','E','records',{0,1})

# ---------------------------------------------------------------- concert stage (backdrop)
sp = {
 'm':'#7a7f88','M':'#4a4e56','k':'#141218','K':'#24222a','w':'#e8e8ea',
 'x':'#ff7eb6','X':'#c0508a','v':'#9b4f9e','n':'#2a1630',
 'c':'#5ef6ff','y':'#ffe14d','r':'#ff3d5a','g':'#3a3440',
 'd':'#5a3a24','D':'#3a2414','s':'#c9ccd2',
 # translucent light beams (rgba)
 '1':'#ff7eb640','2':'#5ef6ff38','3':'#ffe14d38','4':'#9b4f9e48',
}
St = Sprite(160, 76, sp)
# light beams first (behind everything)
import math
for i,(lx,c,ang) in enumerate([(30,'1',0.35),(62,'2',-0.15),(98,'3',0.15),(130,'4',-0.35)]):
    for y in range(10,62):
        half = (y-10)*0.28 + 1
        cx = lx + (y-10)*ang
        for x in range(int(cx-half), int(cx+half)+1): St.px(x,y,c)
# truss towers + top truss
for x0 in (6,148):
    St.rect(x0,4,x0+5,62,'M'); St.rect(x0+1,4,x0+4,62,'k')
    for y in range(4,62,4): St.px(x0+1+(y//4)%4,y,'m'); St.px(x0+4-(y//4)%4,y+2,'m')
St.rect(6,4,153,9,'M'); St.rect(7,5,152,8,'k')
for x in range(7,153,4): St.px(x,5,'m'); St.px(x+2,8,'m'); St.px(x+1,6,'m'); St.px(x+3,7,'m')
# light cans
for lx,c in [(30,'x'),(46,'y'),(62,'c'),(80,'r'),(98,'y'),(114,'c'),(130,'x')]:
    St.rect(lx-2,10,lx+2,13,'K'); St.rect(lx-1,13,lx+1,14,c)
# banner
St.rect(36,16,124,28,'n'); St.rect(37,17,123,27,'v')
text(St, 51, 20, 'FEOS PERO MAJOS', 'x')
# speaker stacks
for x0 in (14,128):
    for y0 in (38,48):
        St.rect(x0,y0,x0+17,y0+9,'K'); St.rect(x0+1,y0+1,x0+16,y0+8,'k')
        for cx in (x0+5,x0+12):
            for dy in range(-3,4):
                for dx in range(-3,4):
                    if 2<=math.hypot(dx,dy)<=3.2: St.px(cx+dx,y0+4+dy,'g')
            St.px(cx,y0+4,'M')
# drum kit + amps
St.rect(70,46,90,57,'k'); St.rect(71,47,89,56,'g')
for dy in range(-5,6):
    for dx in range(-5,6):
        if math.hypot(dx,dy)<=5.3: St.px(80+dx,51+dy,'w' if math.hypot(dx,dy)>4.3 else 'x')
for dy in range(-2,3):
    for dx in range(-1,2): St.px(80+dx,51+dy,'w')          # pink kick drum with a white mark
St.rect(62,40,68,40,'y'); St.rect(65,41,65,52,'s'); St.rect(92,38,99,38,'y'); St.rect(95,39,95,52,'s')   # cymbals
St.rect(40,44,55,57,'K'); St.rect(41,45,54,52,'g'); St.rect(41,54,54,56,'s')   # amp left
St.rect(105,44,120,57,'K'); St.rect(106,45,119,52,'g'); St.rect(106,54,119,56,'s')
St.rect(58,42,58,57,'s'); St.px(58,41,'k'); St.rect(102,42,102,57,'s'); St.px(102,41,'k')  # mic stands
# stage deck
St.rect(4,58,155,62,'d'); St.rect(4,58,155,58,'w'); St.rect(4,63,155,75,'D')
for x in range(4,156,10): St.rect(x,63,x,75,'d')
St.rect(20,64,140,65,'x')                                   # pink LED strip

# ---------------------------------------------------------------- roof (terracotta tiles + wooden eave)
rp = {'t':'#b8502e','T':'#8a3a22','h':'#d8744a','k':'#4a2216','w':'#6b3b1e','W':'#4a2812'}
Rf = Sprite(32, 24, rp)
Rf.rect(0,0,31,19,'t')
for row in range(5):                      # overlapping rows of curved tiles
    y0 = row*4
    off = 4 if row % 2 else 0
    for x in range(32):
        c = ((x + off) % 8)
        if c == 0: Rf.rect(x, y0, x, y0+3, 'k')          # gap between tiles
        elif c in (1, 2): Rf.rect(x, y0, x, y0+3, 'h')   # lit side of the curve
        elif c in (6, 7): Rf.rect(x, y0, x, y0+3, 'T')   # shadow side
    Rf.rect(0, y0+3, 31, y0+3, 'T')
Rf.rect(0,20,31,21,'w'); Rf.rect(0,22,31,23,'W')          # wooden eave at the bottom edge
for x in range(0,32,4): Rf.px(x,22,'k')                   # rafter ends

if __name__ == '__main__':
    from PIL import Image
    def png(S, path, sc, bg=(42,26,48)):
        im = Image.new('RGBA', (S.w*sc, S.h*sc), bg+(255,))
        for y in range(S.h):
            for x in range(S.w):
                c=S.g[y][x]
                if c=='.': continue
                hx=S.pal[c].lstrip('#'); col=[int(hx[i:i+2],16) for i in (0,2,4)]; a=int(hx[6:8],16) if len(hx)==8 else 255
                for yy in range(sc):
                    for xx in range(sc):
                        p=(x*sc+xx,y*sc+yy); o=im.getpixel(p)
                        im.putpixel(p, tuple(int(o[k]*(1-a/255)+col[k]*a/255) for k in range(3))+(255,))
        im.save(path)
    png(W,'wall.png',5); png(St,'stage.png',4)
