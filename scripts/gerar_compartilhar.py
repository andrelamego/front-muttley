import math, sys
from PIL import Image, ImageDraw, ImageFont
# Uso, a partir de front-muttley: python scripts/gerar_compartilhar.py public/imagens/compartilhar.jpg
# Precisa do Pillow e do repositório irmão Backend-Muttley, de onde vêm as fontes da identidade.
from pathlib import Path
R = str(Path(__file__).resolve().parents[2]) + '/'
FONTES = R + 'Backend-Muttley/src/main/resources/certificado/fontes/'
E = 2  # desenha em escala dobrada e reduz no fim, para as bordas saírem suaves
W, H = 1200 * E, 630 * E
COBALTO, ESCURO, TINTA, PAPEL, SINAL = '#2236e0', '#1a29b0', '#0e1330', '#eef0f6', '#ffd93b'

img = Image.new('RGBA', (W, H), COBALTO)
d = ImageDraw.Draw(img)

# Plateia em arco atrás dos ingressos, como na arte do login.
cx, cy = 900 * E, 40 * E
for fileira in range(7):
    raio = (250 + fileira * 52) * E
    n = 9 + fileira * 2
    for i in range(n):
        a = math.radians(28 + 96 * (i + 0.5) / n)
        x, y = cx + raio * math.cos(a), cy + raio * math.sin(a)
        cadeira = Image.new('RGBA', (30 * E, 22 * E), (0, 0, 0, 0))
        cd = ImageDraw.Draw(cadeira)
        cd.rounded_rectangle((2 * E, 2 * E, 28 * E, 20 * E), radius=6 * E, fill=ESCURO, outline=TINTA, width=3 * E)
        cd.line((5 * E, 15 * E, 25 * E, 15 * E), fill=TINTA, width=3 * E)
        cadeira = cadeira.rotate(90 - math.degrees(a), expand=True, resample=Image.BICUBIC)
        img.alpha_composite(cadeira, (int(x - cadeira.width / 2), int(y - cadeira.height / 2)))

def ingresso(carimbo=False):
    w, h, pad = 400 * E, 168 * E, 30 * E
    t = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    td = ImageDraw.Draw(t)
    x0, y0, x1, y1 = pad, pad, pad + w, pad + h
    td.rounded_rectangle((x0, y0, x1, y1), radius=14 * E, fill=TINTA)
    td.rounded_rectangle((x0 + 3 * E, y0 + 3 * E, x1 - 3 * E, y1 - 3 * E), radius=12 * E, fill=PAPEL)
    px, r = x0 + int(w * 0.72), 14 * E
    for yy in (y0, y1):  # recortes do picote, em cima e embaixo
        td.ellipse((px - r - 3 * E, yy - r - 3 * E, px + r + 3 * E, yy + r + 3 * E), fill=TINTA)
        td.ellipse((px - r, yy - r, px + r, yy + r), fill=(0, 0, 0, 0))
    td.rectangle((0, 0, t.width, y0 - 1), fill=(0, 0, 0, 0))
    td.rectangle((0, y1 + 1, t.width, t.height), fill=(0, 0, 0, 0))
    for yy in range(y0 + r + 10 * E, y1 - r - 6 * E, 14 * E):  # picote
        td.line((px, yy, px, yy + 7 * E), fill=TINTA, width=3 * E)
    bx = x0 + 28 * E
    td.rounded_rectangle((bx, y0 + 30 * E, bx + 190 * E, y0 + 48 * E), radius=6 * E, fill=TINTA)
    td.rounded_rectangle((bx, y0 + 62 * E, bx + 150 * E, y0 + 74 * E), radius=5 * E, fill=TINTA)
    td.rounded_rectangle((bx, y0 + 86 * E, bx + 110 * E, y0 + 98 * E), radius=5 * E, fill=TINTA)
    td.rounded_rectangle((bx, y0 + 124 * E, bx + 46 * E, y0 + 136 * E), radius=5 * E, fill=TINTA)
    td.rounded_rectangle((bx + 56 * E, y0 + 124 * E, bx + 130 * E, y0 + 136 * E), radius=5 * E, fill=TINTA)
    sx = px + (x1 - px) // 2
    td.rounded_rectangle((sx - 30 * E, y0 + 34 * E, sx + 30 * E, y0 + 70 * E), radius=6 * E, fill=TINTA)
    td.rounded_rectangle((sx - 30 * E, y0 + 112 * E, sx + 30 * E, y0 + 134 * E), radius=11 * E, fill=SINAL, outline=TINTA, width=3 * E)
    if carimbo:
        kx, ky = px - 56 * E, y0 + 96 * E
        td.ellipse((kx - 34 * E, ky - 34 * E, kx + 34 * E, ky + 34 * E), outline=TINTA, width=3 * E)
        td.ellipse((kx - 22 * E, ky - 22 * E, kx + 22 * E, ky + 22 * E), fill=SINAL, outline=TINTA, width=3 * E)
    return t

for (x, y, giro, carimbo) in [(740, 372, 6, False), (720, 248, -3, False), (700, 122, -9, True)]:
    t = ingresso(carimbo).rotate(giro, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(t, (x * E - t.width // 2 + 200 * E, y * E - t.height // 2 + 20 * E))

# Texto no terço esquerdo.
titulo = ImageFont.truetype(FONTES + 'bricolage-grotesque.woff2', 104 * E)
titulo.set_variation_by_name('ExtraBold')
texto = ImageFont.truetype(FONTES + 'schibsted-grotesk.woff2', 36 * E)
d = ImageDraw.Draw(img)
x = 72 * E
marca = Image.open(R + 'front-muttley/public/icon-192.png').convert('RGBA').resize((84 * E, 84 * E), Image.LANCZOS)
img.alpha_composite(marca, (x, 150 * E))
d.text((x, 250 * E), 'Muttley', font=titulo, fill='#ffffff')
d.rounded_rectangle((x + 4 * E, 384 * E, x + 84 * E, 394 * E), radius=5 * E, fill=SINAL)
for i, linha in enumerate(['Inscrição, presença e', 'certificado dos eventos', 'acadêmicos da Fatec']):
    d.text((x, (420 + i * 46) * E), linha, font=texto, fill='#e6e9ff')

img.convert('RGB').resize((1200, 630), Image.LANCZOS).save(sys.argv[1], quality=88, optimize=True, progressive=True)
