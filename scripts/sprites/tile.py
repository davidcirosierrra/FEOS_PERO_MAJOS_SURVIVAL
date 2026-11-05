import math
from PIL import Image
N=32
g=[[0]*N for _ in range(N)]
def mark(x,y): g[int(round(y))%N][int(round(x))%N]=1
def ellipse(cx,cy,rx,ry):
    for i in range(720):
        a=i/720*2*math.pi; mark(cx+math.cos(a)*rx, cy+math.sin(a)*ry)
h=N/2-0.5
ellipse(h,h,3.0,3.0)                        # centre
for dx,dy in ((0,-1),(1,0),(0,1),(-1,0)):   # petals
    rx,ry=(4.4,5.4) if dx==0 else (5.4,4.4)
    ellipse(h+dx*8.6,h+dy*8.6,rx,ry)
for cx,cy in ((-0.5,-0.5),(N-0.5,-0.5),(-0.5,N-0.5),(N-0.5,N-0.5)):  # corner arcs (join with neighbours)
    ellipse(cx,cy,4.2,4.2)
for i in range(N): g[0][i]=1; g[i][0]=1      # joint
rows=[]
for y in range(N):
    r=''
    for x in range(N):
        if g[y][x]: r+='g'
        elif g[(y-1)%N][(x-1)%N]: r+='l'
        else: r+='.'
    rows.append(r)
cols={'g':(92,95,101),'l':(186,189,194),'.':(152,155,160)}
im=Image.new('RGB',(N*4,N*4))
for ty in range(4):
    for tx in range(4):
        for y in range(N):
            for x in range(N): im.putpixel((tx*N+x,ty*N+y),cols[rows[y][x]])
im=im.resize((N*4*4,N*4*4),Image.NEAREST); im.save('tile.png')
open('tile.txt','w').write('\n'.join(rows))
