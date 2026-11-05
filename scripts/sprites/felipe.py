from painter import Sprite
# Basque-style tavern frontage: painted green wood, stone, striped awning, bottles in the windows.
pal = {
 'b':'#17402a','B':'#0f2c1d','x':'#2a6a44',          # sign board / bevel
 'y':'#ffd23d','Y':'#b8860b',                         # gilded letters + shadow
 'g':'#2e8b57','G':'#1f6b40','w':'#f4f4f2','W':'#cfd2d6','k':'#1a1416','s':'#9aa0a8',
 'v':'#245a3a','V':'#173f28','q':'#3a8a5a',           # painted wood (dark green)
 'c':'#c9b48a','C':'#a8936a','z':'#ddcca4',           # stone
 'd':'#6b3b1e','D':'#4a2812',                         # door wood
 'e':'#bfe2ee','E':'#86b8c8',                         # glass
 'r':'#a01a30','R':'#ffcf5a','a':'#d98a1e','o':'#3fae4f','O':'#7a3e1c','p':'#f0e0b0','t':'#e05a3a',
 'L':'#ffe9a0','l':'#c8a040',
}
GLYPH = {
 'F':['yyy','y..','yy.','y..','y..'], 'E':['yyy','y..','yy.','y..','yyy'], 'L':['y..','y..','y..','y..','yyy'],
 'I':['yyy','.y.','.y.','.y.','yyy'], 'P':['yy.','y.y','yy.','y..','y..'],
}
parts = {}
def letter(ch):
    S = Sprite(6, 8, pal)
    S.rect(0,0,5,7,'b'); S.rect(0,0,5,0,'x'); S.rect(0,0,0,7,'x'); S.rect(5,1,5,7,'B'); S.rect(1,7,5,7,'B')
    for y,row in enumerate(GLYPH[ch]):
        for x,c in enumerate(row):
            if c=='y': S.px(1+x,1+y,'y' if y < 3 else 'Y')   # gilded, darker at the bottom
    return S.outline()
for i,ch in enumerate('FELIPE'): parts[f'sign{i}'] = letter(ch)

A = Sprite(40, 5, pal)                                # striped awning
A.rect(0,0,39,0,'s')
for x in range(40):
    c = 'g' if (x//3)%2==0 else 'w'
    A.rect(x,1,x,3,c)
    A.px(x,3,'G' if c=='g' else 'W')
    if x%3!=2: A.px(x,4,'G' if c=='g' else 'W')
parts['awning'] = A.outline()

def window(flip=False):
    S = Sprite(10, 10, pal)
    S.rect(0,0,9,9,'v'); S.rect(0,0,9,0,'q'); S.rect(9,0,9,9,'V'); S.rect(0,9,9,9,'V')
    S.rect(1,1,8,7,'k')
    bottles = [(2,'o'),(3,'a'),(4,'r'),(6,'o'),(7,'a')]
    for x,c in bottles:
        S.rect(x,3,x,5,c); S.px(x,2,'O' if c!='r' else 'r'); S.px(x,3,'W')   # body + label shine
    S.rect(1,6,8,6,'s')                                  # shelf
    S.row(7,2,'ptptpt')                                  # pintxos on the counter
    S.px(1,1,'E'); S.px(2,1,'E')                         # glass glint
    S.rect(0,8,9,8,'q')                                  # sill
    return S.outline()
parts['windowL'] = window(); parts['windowR'] = window()

F = Sprite(40, 15, pal)                                 # frontage (core)
F.rect(0,0,39,14,'c')
for y in range(1,14):                                    # stone courses
    for x in range(40):
        if y%3==0: F.px(x,y,'C')
        elif (x + (y//3)*3) % 7 == 0: F.px(x,y,'C')
        elif (x*7+y*3)%11==0: F.px(x,y,'z')
F.rect(0,0,39,0,'V'); F.rect(0,1,39,1,'v')
F.rect(1,2,12,11,'k'); F.rect(27,2,38,11,'k')           # window recesses (windows sit on top)
F.rect(15,3,24,14,'v'); F.rect(15,3,24,3,'q'); F.rect(24,3,24,14,'V')   # door frame
F.rect(16,4,19,13,'d'); F.rect(20,4,23,13,'d'); F.rect(19,4,19,13,'D'); F.rect(23,4,23,13,'D')
F.rect(17,5,18,8,'e'); F.rect(21,5,22,8,'e'); F.px(17,5,'w'); F.px(21,5,'w'); F.rect(18,6,18,8,'E'); F.rect(22,6,22,8,'E')
F.px(18,10,'R'); F.px(21,10,'R')                         # handles
F.rect(13,4,13,6,'l'); F.px(13,3,'L'); F.rect(26,4,26,6,'l'); F.px(26,3,'L')   # wall lamps
F.rect(0,13,14,14,'v'); F.rect(25,13,39,14,'v'); F.rect(0,13,14,13,'q'); F.rect(25,13,39,13,'q')  # wooden skirting
F.rect(14,14,25,14,'s')                                  # step
parts['facade'] = F.outline()

if __name__ == '__main__':
    from PIL import Image
    # preview assembled
    layout = {**{f'sign{i}':(2+i*6,0) for i in range(6)}, 'awning':(0,10), 'facade':(0,14), 'windowL':(1,15), 'windowR':(28,15)}
    W,H,sc = 44, 32, 12
    im = Image.new('RGB',(W*sc,H*sc),(152,155,160))
    for name in ['facade','windowL','windowR','awning'] + [f'sign{i}' for i in range(6)]:
        S = parts[name]; ox,oy = layout[name]
        for y in range(S.h):
            for x in range(S.w):
                c=S.g[y][x]
                if c=='.': continue
                hx=S.pal[c].lstrip('#'); col=tuple(int(hx[i:i+2],16) for i in (0,2,4))
                for yy in range(sc):
                    for xx in range(sc): im.putpixel(((ox+x)*sc+xx,(oy+y)*sc+yy),col)
    im.save('felipe.png')
