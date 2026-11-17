import type { EventoPublico } from './eventoTypes.ts'
import { formatModalidade, getTicketDateParts } from './ticketFormat.ts'

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** Quebra o texto em linhas de até `largura` caracteres; passando de `max`, a última termina em reticências. */
export const quebrarLinhas = (
  texto: string,
  largura: number,
  max: number
): string[] => {
  const linhas: string[] = []
  for (const palavra of texto.trim().split(/\s+/).filter(Boolean)) {
    const ultima = linhas.length - 1
    if (ultima >= 0 && `${linhas[ultima]} ${palavra}`.length <= largura) {
      linhas[ultima] = `${linhas[ultima]} ${palavra}`
    } else {
      linhas.push(palavra)
    }
  }
  if (linhas.length > max) {
    linhas.length = max
    linhas[max - 1] = `${linhas[max - 1]}…`
  }
  return linhas
}

// Papel claro sobre o tema escuro; tinta escura sobre o tema claro, para o ingresso não sumir no fundo.
const PALETAS = {
  papel: {
    corpo: '#f4f5f8',
    canhoto: '#e8eaf0',
    titulo: '#0e1330',
    rotulo: '#5d6385',
    rodape: '#4a5070',
    picote: '#b9bdd0',
    furo: '#c9cdda',
    dia: '#2236e0',
  },
  tinta: {
    corpo: '#1a1d2a',
    canhoto: '#222637',
    titulo: '#e9ebf5',
    rotulo: '#8e93ab',
    rodape: '#b1b5c9',
    picote: '#3d4360',
    furo: '#2f3448',
    dia: '#ffd93b',
  },
}

export type PaletaCartao = keyof typeof PALETAS

/** Ingresso do evento desenhado em SVG, para usar como imagem do carrossel do hero. */
export const cartaoEventoSvg = (
  evento: EventoPublico,
  paleta: PaletaCartao = 'papel'
): string => {
  const c = PALETAS[paleta]
  const { dia, mes, horario } = getTicketDateParts(
    evento.data,
    evento.horarioInicio
  )
  const tema = quebrarLinhas(evento.tema, 25, 2)
    .map(
      (linha, i) =>
        `<text x="24" y="${84 + i * 28}" font-size="23" font-weight="800" fill="${c.titulo}">${escapar(linha)}</text>`
    )
    .join('')
  const rodape = [evento.local, formatModalidade(evento.modalidade)]
    .filter(Boolean)
    .join(' · ')
  // Formato 2,4:1, como os cartões do carrossel: corpo com o tema e canhoto com a data.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200" viewBox="0 0 480 200" font-family="Archivo, system-ui, sans-serif">
<rect width="480" height="200" fill="${c.corpo}"/>
<rect x="376" width="104" height="200" fill="${c.canhoto}"/>
<text x="24" y="38" font-size="11" font-weight="800" letter-spacing="2" fill="${c.rotulo}">FATEC ZONA LESTE</text>
${tema}
<text x="24" y="172" font-size="13" fill="${c.rodape}">${escapar(quebrarLinhas(rodape, 44, 1)[0] ?? '')}</text>
<line x1="376" y1="16" x2="376" y2="184" stroke="${c.picote}" stroke-width="2" stroke-dasharray="6 6"/>
<circle cx="376" cy="0" r="12" fill="${c.furo}"/><circle cx="376" cy="200" r="12" fill="${c.furo}"/>
<text x="428" y="104" font-size="54" font-weight="900" fill="${c.dia}" text-anchor="middle">${escapar(dia)}</text>
<text x="428" y="132" font-size="15" font-weight="800" fill="${c.titulo}" text-anchor="middle">${escapar(mes.toUpperCase())}</text>
${horario ? `<text x="428" y="154" font-size="13" fill="${c.rotulo}" text-anchor="middle">${escapar(horario)}</text>` : ''}
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
