// Regra de presença: de 10 minutos antes do início até 10 minutos após o fim, limites inclusivos.
// O relógio do servidor prevalece; aqui serve só para orientar a interface.
const TOLERANCIA_MS = 10 * 60 * 1000

export interface PresenceWindow {
  abre: Date
  fecha: Date
}

/** Monta a data em hora local a partir de "AAAA-MM-DD" e "HH:mm[:ss]"; null se inválida. */
export const parseEventDateTime = (
  data?: string | null,
  horario?: string | null
): Date | null => {
  if (!data || !horario) return null
  const [ano, mes, dia] = data.split('-').map(Number)
  const [hora, minuto = 0] = horario.split(':').map(Number)
  if ([ano, mes, dia, hora, minuto].some((n) => !Number.isInteger(n)))
    return null
  if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59) return null

  const resultado = new Date(ano, mes - 1, dia, hora, minuto)
  // Rejeita datas que o Date "corrige", como 30/02 ou mês 13.
  if (
    resultado.getFullYear() !== ano ||
    resultado.getMonth() !== mes - 1 ||
    resultado.getDate() !== dia
  )
    return null
  return resultado
}

export const getPresenceWindow = (
  data?: string | null,
  horarioInicio?: string | null,
  horarioFim?: string | null
): PresenceWindow | null => {
  const inicio = parseEventDateTime(data, horarioInicio)
  const fim = parseEventDateTime(data, horarioFim)
  if (!inicio || !fim) return null
  return {
    abre: new Date(inicio.getTime() - TOLERANCIA_MS),
    fecha: new Date(fim.getTime() + TOLERANCIA_MS),
  }
}

export const isWithinPresenceWindow = (
  data?: string | null,
  horarioInicio?: string | null,
  horarioFim?: string | null,
  agora: Date = new Date()
): boolean => {
  const janela = getPresenceWindow(data, horarioInicio, horarioFim)
  if (!janela) return false
  return agora >= janela.abre && agora <= janela.fecha
}

export const formatHora = (d: Date) =>
  `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`

export const formatPresenceWindow = (janela: PresenceWindow): string =>
  `Disponível das ${formatHora(janela.abre)} às ${formatHora(janela.fecha)}`
