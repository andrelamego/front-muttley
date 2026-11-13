/** Frase de resumo do painel da coordenação, a partir de eventosAtivosNaSemana. */
export const formatResumoSemana = (eventosNaSemana: number): string => {
  if (eventosNaSemana <= 0) return 'Nenhum evento acontece esta semana.'
  if (eventosNaSemana === 1) return '1 evento acontece esta semana.'
  return `${eventosNaSemana} eventos acontecem esta semana.`
}
