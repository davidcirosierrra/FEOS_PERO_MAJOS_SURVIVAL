from painter import Sprite
# First-person fork-rifle (held upright, slightly to the right) with the player's hand.
def rifle(skin, skinS):
    pal = {'u':'#3346a8','U':'#1f2a6e','l':'#6577d6','f':skin,'F':skinS,'k':'#2a2a30'}
    S = Sprite(9, 26, pal)
    for x in (1,4,7): S.rect(x,0,x,5,'u'); S.px(x,0,'l'); S.px(x,1,'l')
    S.rect(1,6,7,6,'u'); S.rect(2,7,6,7,'u'); S.rect(3,8,5,8,'U'); S.rect(4,9,4,10,'u')
    S.rect(3,11,5,19,'u'); S.rect(5,11,5,19,'U'); S.rect(3,11,3,19,'l')
    S.rect(5,15,7,17,'U'); S.px(6,18,'k')               # trigger guard
    S.rect(2,20,6,25,'u'); S.rect(6,20,6,25,'U'); S.rect(2,20,2,23,'l')   # stock
    S.rect(1,15,4,18,'f'); S.rect(4,15,4,18,'F'); S.rect(0,16,0,18,'f')   # hand
    return S.outline()
parts = {'bassist': rifle('#eab994', '#c98e66'), 'pig': rifle('#ffa3cc', '#f07fb0')}
if __name__ == '__main__':
    parts['bassist'].png('rifle.png', 12)
