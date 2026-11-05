from painter import Sprite
from PIL import Image
out={}
# lighter
S=Sprite(6,11,{'o':'#ff8a1e','y':'#ffe14d','w':'#fff8d0','s':'#c9ccd2','S':'#8e9196','r':'#e0283c','R':'#a01a2c','h':'#ff7a8a'})
S.px(2,0,'o'); S.rect(1,1,3,2,'o'); S.rect(2,1,2,2,'y'); S.px(2,3,'w')
S.rect(0,4,5,4,'S'); S.rect(1,4,4,4,'s'); S.rect(4,3,5,3,'S')
S.rect(0,5,5,10,'r'); S.rect(5,5,5,10,'R'); S.rect(1,6,1,9,'h')
out['lighter']=S
# CD
S=Sprite(11,11,{'s':'#dfe2e6','S':'#a9adb4','c':'#7fe3f0','m':'#ff8ad0','y':'#ffe680','k':'#4a4e56'})
for y in range(11):
    for x in range(11):
        import math
        d=math.hypot(x-5,y-5)
        if d<=5.3:
            if d<1.3: continue
            if d<2.1: S.px(x,y,'k'); continue
            a=math.atan2(y-5,x-5)
            c='S' if d>4.6 else ('c' if -2.4<a<-1.2 else 'm' if -1.2<=a<0 else 'y' if 0<=a<0.9 else 's')
            S.px(x,y,c)
out['cd']=S
# wine glass
S=Sprite(7,11,{'g':'#d8eef5','G':'#9fc4d0','r':'#9a1434','R':'#6a0c22','w':'#ffffff'})
S.rect(0,0,6,0,'g'); S.rect(0,1,0,4,'g'); S.rect(6,1,6,4,'G'); S.rect(1,5,5,5,'G')
S.rect(1,2,5,4,'r'); S.rect(4,2,5,4,'R'); S.px(1,1,'w'); S.rect(1,1,5,1,'g'); S.rect(1,2,5,2,'r'); S.px(2,2,'w')
S.rect(3,6,3,9,'g'); S.rect(1,10,5,10,'g'); S.px(5,10,'G')
out['wine']=S
# burger
S=Sprite(9,8,{'t':'#e8a24a','T':'#c27a2a','w':'#fff6d8','g':'#5be35b','G':'#2fa84a','b':'#6a3418','y':'#ffd93d','r':'#e0283c'})
S.rect(1,0,7,0,'t'); S.rect(0,1,8,2,'t'); S.rect(6,1,8,2,'T'); S.px(2,1,'w'); S.px(5,1,'w'); S.px(3,2,'w')
S.rect(0,3,8,3,'g'); S.px(1,3,'G'); S.px(4,3,'G'); S.px(7,3,'G')
S.rect(0,4,8,4,'r'); S.rect(0,5,8,5,'b'); S.rect(0,6,8,6,'y'); S.px(8,6,'.')
S.rect(1,7,7,7,'T')
out['burger']=S
# kalimotxo katxi
S=Sprite(9,12,{'s':'#ff3d5a','w':'#f4f4f2','W':'#c9ccd2','d':'#8a2232','D':'#5e1424','i':'#e8f6ff','f':'#d9a0a8'})
S.px(8,0,'s'); S.px(7,1,'s'); S.px(6,2,'s')
S.rect(0,3,8,3,'w'); S.rect(0,4,8,4,'W')
for y,(a,b) in enumerate([(0,8),(1,7),(1,7),(1,7),(1,7),(2,6),(2,6)],start=4):
    S.rect(a,y,b,y,'w')
for y,(a,b) in enumerate([(1,7),(2,6),(2,6),(2,6),(2,6),(3,5)],start=5):
    S.rect(a,y,b,y,'d'); S.px(b,y,'D')
S.px(3,6,'i'); S.px(5,7,'i'); S.px(2,5,'f'); S.px(6,4,'s'); S.px(6,5,'s'); S.px(6,3,'s')
S.rect(2,11,6,11,'W')
out['kalimotxo']=S
# fork bullet
S=Sprite(5,9,{'p':'#ff7eb6','w':'#ffd1e6','P':'#d4508e'})
for x in (0,2,4): S.rect(x,0,x,2,'p'); S.px(x,0,'w')
S.rect(0,3,4,3,'p'); S.rect(1,4,3,4,'P'); S.rect(2,5,2,8,'p')
out['fork']=S
# pick
def pick(c,e):
    S=Sprite(9,10,{'g':c,'b':e,'w':'#ffffff'})
    for y,(a,b) in enumerate([(1,7),(0,8),(0,8),(0,8),(1,7),(1,7),(2,6),(3,5),(4,4)]):
        S.rect(a,y,b,y,'g')
    S.rect(1,1,1,4,'w'); S.px(2,1,'w')
    for y in range(9):
        row=[x for x in range(9) if S.get(x,y)!='.']
        S.px(max(row),y,'b')
    return S
out['pick_red']=pick('#ff3d5a','#9c1028'); out['pick_blue']=pick('#3da5ff','#174f9c'); out['pick_yellow']=pick('#ffe14d','#a8820c')
ims=[]
for k,S in out.items():
    o=S.outline(); o.png(f'it_{k}.png',10); ims.append(Image.open(f'it_{k}.png'))
    open(f'it_{k}.ts','w').write(o.ts(k))
W=sum(i.width+10 for i in ims); H=max(i.height for i in ims); im=Image.new('RGB',(W,H),(142,145,150)); x=0
for i in ims: im.paste(i,(x,0)); x+=i.width+10
im.save('items.png')
