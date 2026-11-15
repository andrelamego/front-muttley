import type { EventoPublico } from './eventoTypes'

/** Uma prateleira da página de explorar: um título e os eventos que cabem nele. */
export interface SecaoEventos {
  chave: string
  titulo: string
  descricao: string
  eventos: EventoPublico[]
}

export interface ContextoExplorar {
  /** Data de hoje em YYYY-MM-DD. */
  hoje: string
  /** Disciplinas dos eventos em que a pessoa já se inscreveu, mais recentes primeiro. */
  disciplinasDaPessoa?: string[]
  /** Eventos em que a pessoa já está inscrita: ficam fora de "Para você". */
  inscritos?: ReadonlySet<number>
}

const SEMANA_DIAS = 7
/** Abaixo disso a disciplina não ganha prateleira própria: um carrossel de um item só fragmenta a página. */
export const MINIMO_PRATELEIRA = 2

/** Soma dias a uma data YYYY-MM-DD sem passar por fuso horário. */
export const somarDias = (data: string, dias: number): string => {
  const [a, m, d] = data.split('-').map(Number)
  const resultado = new Date(Date.UTC(a, m - 1, d + dias))
  return resultado.toISOString().slice(0, 10)
}

/** Inscrições abertas primeiro; dentro de cada grupo, o mais próximo primeiro. */
const ordenar = (eventos: EventoPublico[]) =>
  [...eventos].sort(
    (a, b) =>
      Number(a.inscricoesEncerradas) - Number(b.inscricoesEncerradas) ||
      (a.data || '').localeCompare(b.data || '')
  )

const plural = (n: number, um: string, varios: string) =>
  `${n} ${n === 1 ? um : varios}`

/**
 * Agrupa a programação em prateleiras: recomendações pelo histórico da pessoa,
 * o que acontece nos próximos dias, uma por disciplina e o restante.
 * Um evento pode aparecer em mais de uma prateleira, como numa vitrine.
 */
export const secoesExplorar = (
  eventos: EventoPublico[],
  { hoje, disciplinasDaPessoa = [], inscritos = new Set() }: ContextoExplorar
): SecaoEventos[] => {
  const secoes: SecaoEventos[] = []
  const abertos = eventos.filter((e) => !e.inscricoesEncerradas)

  const interesses = [...new Set(disciplinasDaPessoa.filter(Boolean))]
  if (interesses.length > 0) {
    const recomendados = abertos.filter(
      (e) =>
        e.disciplina &&
        interesses.includes(e.disciplina) &&
        !inscritos.has(e.id)
    )
    if (recomendados.length > 0) {
      const citadas = interesses
        .filter((d) => recomendados.some((e) => e.disciplina === d))
        .slice(0, 2)
      secoes.push({
        chave: 'para-voce',
        titulo: 'Para você',
        descricao: `Porque você se inscreveu em eventos de ${citadas.join(' e ')}`,
        eventos: ordenar(recomendados),
      })
    }
  }

  const limite = somarDias(hoje, SEMANA_DIAS)
  const semana = abertos.filter((e) => e.data >= hoje && e.data <= limite)
  if (semana.length > 0) {
    secoes.push({
      chave: 'semana',
      titulo: 'Nos próximos 7 dias',
      descricao: 'Acontecem até a próxima semana',
      eventos: ordenar(semana),
    })
  }

  const porDisciplina = new Map<string, EventoPublico[]>()
  // Eventos sem disciplina e de disciplinas pequenas dividem a última prateleira.
  const avulsos: EventoPublico[] = []
  for (const e of eventos) {
    if (!e.disciplina) avulsos.push(e)
    else
      porDisciplina.set(e.disciplina, [
        ...(porDisciplina.get(e.disciplina) ?? []),
        e,
      ])
  }
  // Disciplinas com mais eventos abertos sobem; empate fica em ordem alfabética.
  const abertosEm = (lista: EventoPublico[]) =>
    lista.filter((e) => !e.inscricoesEncerradas).length
  const prateleiras = [...porDisciplina.entries()].filter(([, lista]) => {
    if (lista.length >= MINIMO_PRATELEIRA) return true
    avulsos.push(...lista)
    return false
  })
  prateleiras
    .sort(
      ([a, la], [b, lb]) =>
        abertosEm(lb) - abertosEm(la) || a.localeCompare(b, 'pt-BR')
    )
    .forEach(([disciplina, lista]) =>
      secoes.push({
        chave: `disciplina:${disciplina}`,
        titulo: disciplina,
        descricao: plural(
          abertosEm(lista),
          'evento com inscrições abertas',
          'eventos com inscrições abertas'
        ),
        eventos: ordenar(lista),
      })
    )

  if (avulsos.length > 0) {
    secoes.push({
      chave: 'outros',
      titulo: prateleiras.length > 0 ? 'Mais eventos' : 'Programação',
      descricao:
        prateleiras.length > 0
          ? 'De outras disciplinas e abertos a todos os cursos'
          : 'Todos os eventos abertos, do mais próximo ao mais distante',
      eventos: ordenar(avulsos),
    })
  }

  return secoes
}

/** Hoje no fuso do navegador, em YYYY-MM-DD. */
export const hojeLocal = (agora = new Date()) =>
  `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
