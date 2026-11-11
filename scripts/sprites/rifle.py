from kit import Art
# First-person fork-rifle: held upright in both hands, seen from just behind it.
# python3 scripts/sprites/rifle.py -> rifle.png
def rifle(skin, skinS, skinH, nail):
    pal = {'u':'#3346a8','U':'#1f2a6e','l':'#6577d6','L':'#a9b6f6','k':'#141630','K':'#262a52','x':'#ff7eb6','X':'#c0508a',
           'f':skin,'F':skinS,'h':skinH,'n':nail,'s':'#c9ccd2','y':'#ffe14d'}
    S = Art(17, 46, pal)
    # tines
    for x in (3, 8, 13):
        S.rect(x-1, 1, x, 11, 'u'); S.rect(x-1, 1, x-1, 10, 'l'); S.px(x-1, 0, 'L'); S.px(x-1, 1, 'L'); S.px(x-1, 2, 'L'); S.px(x, 0, 'l'); S.rect(x, 4, x, 11, 'U')
    # shoulders of the fork, narrowing into the neck
    S.rect(2, 12, 13, 13, 'u'); S.rect(2, 12, 2, 13, 'l'); S.rect(12, 12, 13, 13, 'U')
    S.rect(3, 14, 12, 14, 'u'); S.px(3, 14, 'l'); S.px(12, 14, 'U')
    S.rect(4, 15, 11, 15, 'u'); S.px(11, 15, 'U'); S.rect(5, 16, 10, 16, 'U'); S.rect(5, 16, 6, 16, 'u')
    # barrel with the band's pink ring
    S.rect(6, 17, 9, 27, 'u'); S.rect(6, 17, 6, 27, 'l'); S.rect(9, 17, 9, 27, 'U')
    S.rect(5, 19, 10, 20, 'x'); S.rect(10, 19, 10, 20, 'X'); S.px(5, 19, 'L')
    # receiver: bolt, ejection port, tiny fork logo
    S.rect(4, 28, 11, 37, 'u'); S.rect(4, 28, 4, 37, 'l'); S.rect(11, 28, 11, 37, 'U'); S.rect(4, 28, 11, 28, 'l')
    S.rect(6, 30, 9, 33, 'k'); S.rect(6, 30, 9, 30, 'K'); S.px(7, 31, 'y'); S.px(8, 32, 's')
    S.px(6, 35, 'x'); S.px(8, 35, 'x'); S.rect(6, 36, 8, 36, 'x')
    S.rect(12, 29, 13, 30, 's'); S.px(14, 29, 's')                            # bolt handle
    # magazine
    S.rect(1, 31, 3, 38, 'K'); S.rect(1, 31, 1, 38, 'u'); S.rect(1, 38, 3, 38, 'k'); S.px(2, 33, 'x'); S.px(2, 35, 'x')
    # trigger guard + grip
    S.rect(12, 34, 14, 34, 'U'); S.rect(14, 34, 14, 38, 'U'); S.px(12, 36, 'k')
    S.rect(10, 38, 13, 45, 'U'); S.rect(10, 38, 10, 45, 'u')
    # stock going down out of view
    S.rect(5, 38, 9, 45, 'u'); S.rect(5, 38, 5, 45, 'l'); S.rect(8, 40, 8, 45, 'U')
    # front hand around the barrel
    S.rect(4, 22, 11, 26, 'f'); S.rect(3, 23, 3, 25, 'f'); S.rect(12, 23, 12, 25, 'F'); S.rect(4, 26, 11, 26, 'F'); S.rect(4, 22, 9, 22, 'h')
    S.rect(7, 23, 7, 25, 'n'); S.px(11, 22, 'F')
    # rear hand on the grip
    S.rect(9, 39, 15, 43, 'f'); S.rect(16, 40, 16, 42, 'F'); S.rect(9, 43, 15, 43, 'F'); S.rect(9, 39, 14, 39, 'h'); S.rect(12, 40, 12, 42, 'n')
    S.rect(11, 44, 16, 45, 'f'); S.rect(15, 44, 16, 45, 'F')                  # wrist
    return S.outline()
parts = {'bassist': rifle('#eab994', '#c98e66', '#f6d2b4', '#c98e66'), 'pig': rifle('#ffa3cc', '#f07fb0', '#ffd0e4', '#7a2a4a')}
if __name__ == '__main__':
    parts['pig'].png('rifle.png', 12)
