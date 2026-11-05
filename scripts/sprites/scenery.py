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

# ---------------------------------------------------------------- street wall (two buildings)
wp = {
 's':'#8c8f96','S':'#6c6f76','t':'#a3a6ac',                 # stone base
 'o':'#d9a85a','O':'#b88a40','b':'#8ab8d0','B':'#6a98b0','p':'#e8b0b8','P':'#c8909a',  # plaster colours
 'k':'#1e2228','g':'#3a5868','G':'#6a90a8','w':'#f4f4f2','W':'#c9ccd2',
 'r':'#151518','d':'#6b3b1e','D':'#4a2812','y':'#ffd23d',
 'x':'#ff7eb6','v':'#9b4f9e','n':'#2a1a30',
}
W = Sprite(96, 64, wp)
def building(x0, col, shade, poster):
    W.rect(x0,0,x0+47,63,col); W.rect(x0+46,0,x0+47,63,shade)
    W.rect(x0,0,x0+47,1,'W')                                   # cornice
    for wx in (x0+8, x0+28):
        for wy in (6, 26):
            W.rect(wx-1,wy-1,wx+10,wy+13,'W')                    # stone frame
            W.rect(wx,wy,wx+9,wy+12,'g'); W.rect(wx+4,wy,wx+5,wy+12,'k'); W.rect(wx,wy+6,wx+9,wy+6,'k')
            W.px(wx+1,wy+1,'G'); W.px(wx+6,wy+1,'G')
            W.rect(wx-2,wy+13,wx+11,wy+13,'r')                   # iron balcony
            for bx in range(wx-2,wx+12,2): W.rect(bx,wy+10,bx,wy+13,'r')
            W.rect(wx-2,wy+10,wx+11,wy+10,'r')
    W.rect(x0,46,x0+47,63,'s')                                 # stone ground floor
    for y in range(46,64):
        for x in range(x0,x0+48):
            if y%5==0 or (x+(y//5)*4)%9==0: W.px(x,y,'S')
            elif (x*3+y)%13==0: W.px(x,y,'t')
    W.rect(x0+6,49,x0+15,63,'d'); W.rect(x0+15,49,x0+15,63,'D'); W.px(x0+13,56,'y')   # door
    if poster:                                                  # band poster
        W.rect(x0+24,50,x0+40,60,'n'); W.rect(x0+25,51,x0+39,59,'v')
        text(W, x0+26, 52, 'FPM', 'x')
        W.rect(x0+26,58,x0+38,58,'x')
    else:
        W.rect(x0+24,49,x0+40,63,'k'); W.rect(x0+25,50,x0+39,62,'g'); W.rect(x0+32,50,x0+32,62,'k')  # shop window
W.rect(0,0,95,63,'o')
building(0,'o','O',True); building(48,'b','B',False)

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
