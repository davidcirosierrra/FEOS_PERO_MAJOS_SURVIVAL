from painter import Sprite
pal = {
 'H':'#2e2018','h':'#4b3526','s':'#6e5a4c','f':'#eab994','F':'#c98e66','E':'#d49c74','e':'#1b120c','b':'#24170f','m':'#a8584a',
 'B':'#3b2a1e','D':'#24180f','G':'#b9b3aa','g':'#8a837a',
 't':'#a3a6ac','T':'#7e8188',
 'r':'#c0343e','R':'#87222d','k':'#3b2f36','w':'#dcc8b4',
 'j':'#3e5689','J':'#2b3c64','K':'#1f1a17','L':'#5a4a40',
 'M':'#3a2414','p':'#e4e6ea','N':'#a06a34','n':'#7a4c22','S':'#2b2226',
 'u':'#3346a8','U':'#1f2a6e','l':'#6577d6',
}
S = Sprite(22, 32, pal)
# --- bass on the back: headstock over the left shoulder, neck going behind
S.rect(1,0,2,4,'M'); S.px(0,1,'p'); S.px(0,3,'p'); S.px(3,1,'p'); S.px(3,3,'p'); S.px(1,0,'n')
for i,(x,y) in enumerate([(2,4),(3,5),(3,6),(4,7),(4,8),(5,9),(5,10),(6,11),(6,12)]):
    S.px(x,y,'N'); S.px(x+1,y,'n') if i%2 else None
# --- head
S.rect(8,1,14,2,'H'); S.rect(7,3,15,4,'H'); S.row(1,9,'hh'); S.row(2,10,'hhh'); S.row(3,12,'hh')  # quiff, swept right
S.rect(7,5,7,8,'s'); S.rect(15,5,15,8,'s')            # shaved sides
S.rect(8,5,14,11,'f')                                 # face
S.rect(14,6,14,11,'F')                                # shade on one side
S.px(6,7,'E'); S.px(6,8,'E'); S.px(16,7,'E'); S.px(16,8,'E')  # ears
S.row(6,8,'bbb'); S.row(6,12,'bbb')                   # heavy brows
S.px(9,7,'e'); S.px(13,7,'e')                          # eyes
S.px(11,8,'F'); S.px(11,9,'F'); S.px(12,9,'F')        # nose
# --- beard (full, long, grey streak at the chin)
for y,(x0,x1) in enumerate([(7,8),(7,8),(7,15),(7,15),(7,15),(7,15),(8,14),(8,14),(9,13)], start=9):
    S.rect(x0,y,x1,y,'B')
S.rect(14,9,15,10,'B')
S.row(11,9,'DDDDD'); S.row(12,10,'DmD')               # moustache + lip
S.px(8,13,'D'); S.px(14,13,'D'); S.px(9,15,'D'); S.px(13,15,'D')
S.row(13,10,'G'); S.row(14,9,'GgG'); S.row(15,10,'GgG'); S.row(16,10,'gG'); S.px(12,17,'B'); S.px(11,17,'G')
# --- torso: grey tee with plaid flannel open on top
S.rect(4,16,17,25,'t'); S.rect(4,16,7,25,'r'); S.rect(14,16,17,25,'r')
S.rect(5,15,8,15,'r'); S.rect(13,15,16,15,'r')
for y in range(15,27):
    for x in list(range(3,9))+list(range(13,19)):
        if S.get(x,y) in 'rR':
            S.px(x,y,'k' if (x//2+y//2)%3==0 else ('R' if (x+y)%4==0 else 'r'))
        if y%4==2 and S.get(x,y)=='r': S.px(x,y,'w')
S.rect(9,18,12,25,'t'); S.rect(12,18,12,25,'T'); S.px(9,17,'T')
# bass strap across the chest (from right shoulder down to left hip)
for i in range(9): S.px(14-i, 16+i, 'S')
# arms / sleeves
S.rect(2,17,3,24,'r'); S.rect(18,17,19,21,'r')
for y in range(17,25):
    S.px(2,y,'R' if y%3==0 else 'k' if y%3==1 else 'r')
S.rect(2,25,3,26,'f')                                  # left hand hanging
S.rect(18,22,19,23,'f')                                # right hand on the rifle
# --- fork-rifle held upright on the right
for x in (17,19,21): S.rect(x,2,x,5,'u'); S.px(x,2,'l')
S.rect(17,6,21,6,'u'); S.rect(18,7,20,7,'u'); S.px(19,8,'u'); S.px(19,9,'u')
S.rect(19,10,20,21,'u'); S.rect(20,10,20,21,'U'); S.px(19,10,'l'); S.px(19,11,'l')
S.rect(18,24,20,24,'U'); S.px(21,24,'U'); S.rect(20,25,21,27,'U')   # trigger/grip + magazine
S.rect(18,25,19,28,'u'); S.rect(17,27,19,29,'u'); S.px(17,27,'l')  # round stock
# --- legs
S.rect(5,26,16,26,'L')                                 # belt
S.rect(6,27,10,30,'j'); S.rect(12,27,16,30,'j'); S.rect(10,27,10,30,'J'); S.rect(16,27,16,30,'J')
S.rect(6,31,10,31,'K'); S.rect(12,31,16,31,'K'); S.px(5,31,'K'); S.px(17,31,'K')
o = S.outline()
o.png('bassist.png', 12)
open('bassist.ts','w').write(o.ts('BASSIST'))
print(o.w, o.h)
