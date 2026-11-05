from painter import Sprite
pal = {
 'P':'#ffa3cc','p':'#f07fb0','D':'#d0608f','L':'#ffd0e4','S':'#ff86b8','n':'#7a2a4a','e':'#1b0c14','w':'#ffffff',
 'v':'#8e4a9a','V':'#6a3274','x':'#ff7eb6','h':'#5a2a3e',
 'u':'#3346a8','U':'#1f2a6e','l':'#6577d6',
}
S = Sprite(22, 30, pal)
# ears
S.row(1,6,'DD'); S.row(2,5,'DpP'); S.row(1,14,'DD'); S.row(2,14,'PpD')
# head (round)
S.rect(6,3,15,11,'P'); S.rect(5,5,16,9,'P'); S.rect(7,2,14,2,'P')
S.rect(15,4,16,10,'p'); S.px(15,11,'p'); S.px(6,11,'p')
S.row(3,8,'LL')                                           # highlight
S.row(5,7,'ee'); S.row(5,13,'ee'); S.px(7,5,'w'); S.px(13,5,'w')   # eyes with shine
S.row(4,7,'D'); S.row(4,14,'D')                          # little brows
S.rect(8,7,13,10,'S'); S.row(7,8,'      ')
S.rect(8,7,13,10,'S'); S.px(8,7,'p'); S.px(13,7,'p'); S.px(8,10,'p'); S.px(13,10,'p')
S.px(9,8,'n'); S.px(9,9,'n'); S.px(12,8,'n'); S.px(12,9,'n')     # nostrils
S.row(11,9,'DnnD')                                       # smile
# body with band tee (purple, pink fist-ish mark)
S.rect(5,12,16,22,'P'); S.rect(4,14,17,20,'P')
S.rect(6,13,15,21,'v'); S.rect(15,13,15,21,'V'); S.rect(6,21,15,21,'V')
for x in (8,10,12): S.rect(x,14,x,15,'x')
S.rect(8,16,12,16,'x'); S.rect(10,17,10,19,'x')          # pink fork on the band tee
S.rect(16,13,17,19,'p')                                  # right arm shade
S.rect(3,15,4,20,'P'); S.rect(3,20,4,21,'p')             # left arm
S.rect(17,19,18,21,'P')                                  # hand on the rifle
# legs + hooves
S.rect(7,23,9,26,'P'); S.rect(12,23,14,26,'P'); S.rect(9,23,9,26,'p'); S.rect(14,23,14,26,'p')
S.rect(7,27,9,28,'h'); S.rect(12,27,14,28,'h'); S.px(8,28,'.'); S.px(13,28,'.')
# curly tail on the left
S.px(2,22,'D'); S.px(1,21,'D'); S.px(2,20,'D'); S.px(3,21,'D')
# fork-rifle
for x in (17,19,21): S.rect(x,1,x,4,'u'); S.px(x,1,'l')
S.rect(17,5,21,5,'u'); S.rect(18,6,20,6,'u'); S.px(19,7,'u'); S.px(19,8,'u')
S.rect(19,9,20,22,'u'); S.rect(20,9,20,22,'U'); S.px(19,9,'l'); S.px(19,10,'l')
S.rect(20,23,21,25,'U'); S.rect(18,23,19,26,'u'); S.rect(17,25,19,27,'u'); S.px(17,25,'l')
o = S.outline()
o.png('pig.png', 12)
open('pig.ts','w').write(o.ts('PIG'))
print(o.w, o.h)
