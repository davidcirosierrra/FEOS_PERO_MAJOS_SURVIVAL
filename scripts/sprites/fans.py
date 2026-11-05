from painter import Sprite
base = {'f':'#eab994','F':'#c98e66','e':'#1b120c','K':'#1f1a17','w':'#f4f4f2','m':'#9a4a40'}
def body(S, shirt, shade, pants, pshade, shoes='K', arm_up=False, skin='f', skinS='F'):
    # head
    S.rect(5,3,10,8,skin); S.rect(10,4,10,8,skinS); S.px(4,5,skin); S.px(11,5,skinS); S.px(4,6,skin); S.px(11,6,skinS)
    S.px(6,5,'e'); S.px(9,5,'e'); S.px(8,7,'m')
    # torso
    S.rect(4,10,11,17,shirt); S.rect(11,10,11,17,shade); S.rect(5,9,10,9,shirt)
    # arms
    S.rect(2,11,3,16,shirt); S.rect(2,17,3,17,skin)
    if arm_up:
        S.rect(12,5,13,10,shirt); S.rect(12,3,13,4,skin)       # throwing arm up
    else:
        S.rect(12,11,13,16,shade); S.rect(12,17,13,17,skin)
    # legs
    S.rect(5,18,7,22,pants); S.rect(8,18,10,22,pants); S.rect(7,18,7,22,pshade); S.rect(10,18,10,22,pshade)
    S.rect(4,23,7,23,shoes); S.rect(8,23,11,23,shoes)

out = {}
# 1. metalhead: long black hair, black band tee, ripped jeans
pal = dict(base, H='#151217', h='#2c2630', k='#202024', z='#3a3a42', j='#4a5f8e', J='#33456d', s='#cfd2d8')
S = Sprite(16, 24, pal)
body(S, 'k', 'z', 'j', 'J', arm_up=True)
S.rect(4,1,11,3,'H'); S.rect(3,3,4,12,'H'); S.rect(11,3,12,11,'H'); S.row(1,6,'hh'); S.rect(5,2,10,3,'H')
S.row(12,6,'ss'); S.row(13,5,'s  s'); S.row(14,6,'ss')   # skull-ish print
S.px(6,20,'f'); S.px(9,21,'f')                              # ripped knees
out['metal'] = S
# 2. fan in the band tee, ponytail, pink trainers
pal = dict(base, b='#7a4422', B='#5a2e14', v='#9b4f9e', V='#743a78', x='#ff7eb6', j='#2f3f66', J='#22304f', P='#ff7eb6')
S = Sprite(16, 24, pal)
body(S, 'v', 'V', 'j', 'J', shoes='P')
S.rect(5,1,10,3,'b'); S.rect(4,3,4,7,'b'); S.rect(11,2,11,6,'b'); S.rect(12,2,13,3,'b'); S.rect(13,4,14,8,'B')  # ponytail
S.row(2,6,'BB')
for x in (6,8,10): S.px(x,11,'x')
S.rect(6,12,10,12,'x'); S.rect(8,13,8,15,'x')               # pink fork on the tee
S.px(7,7,'x'); S.px(8,7,'x')                                 # lipstick
out['bandtee'] = S
# 3. tourist: bald, moustache, Hawaiian shirt, bum bag, shorts, socks
pal = dict(base, y='#ffcf3d', Y='#e0a820', r='#ff5a3d', o='#2e6b3a', O='#c9ccd2', E='#d8c49a', M='#4a2e1c', c='#e8e8ea', C='#3a7ad0')
S = Sprite(16, 24, pal)
body(S, 'y', 'Y', 'E', 'E', arm_up=True)
S.row(7,6,'MMMM')                                            # moustache
S.rect(5,0,10,2,'c'); S.rect(4,3,12,3,'C'); S.px(7,1,'w')      # cap with brim
for (x,y) in [(5,11),(9,12),(6,14),(10,15),(4,16),(8,10)]: S.px(x,y,'r')   # flowers
S.rect(4,17,11,17,'o'); S.px(8,17,'O')                       # bum bag
S.rect(5,21,7,22,'f'); S.rect(8,21,10,22,'f'); S.rect(5,22,7,22,'w'); S.rect(8,22,10,22,'w')
out['tourist'] = S
# 4. punk: green mohawk, leather jacket with studs, red tee
pal = dict(base, g='#39e86a', G='#1fa84a', k='#1c1b20', z='#34323a', s='#d6d8dc', r='#d0283c', j='#2c2c34', J='#1c1c22', R='#8a1a28')
S = Sprite(16, 24, pal)
body(S, 'k', 'z', 'j', 'J')
S.rect(7,0,8,3,'g'); S.px(8,0,'G'); S.px(8,1,'G'); S.px(7,3,'G')
S.rect(5,3,6,3,'z'); S.rect(9,3,10,3,'z')                    # shaved sides
S.rect(7,10,8,17,'r'); S.px(8,12,'R')
for (x,y) in [(5,10),(10,10),(5,12),(10,12),(2,12),(13,12)]: S.px(x,y,'s')
S.px(5,6,'s')                                                 # nose ring... ear stud
out['punk'] = S

from PIL import Image
ims=[]
for k,S in out.items():
    o=S.outline(); o.png(f'fan_{k}.png', 10); ims.append(Image.open(f'fan_{k}.png'))
    open(f'fan_{k}.ts','w').write(o.ts(k))
W=sum(i.width for i in ims); im=Image.new('RGB',(W+30,ims[0].height),(142,145,150)); x=0
for i in ims: im.paste(i,(x,0)); x+=i.width+10
im.save('fans.png')
