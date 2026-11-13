/** Lê "AAAA-MM-DD" como data de calendário local; undefined se vazia ou inválida. */
export const deDataIso = (valor: string): Date | undefined => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!m) return undefined
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const d = new Date(ano, mes - 1, dia)
  // Rejeita datas que o Date "corrige", como 30/02.
  return d.getMonth() === mes - 1 && d.getDate() === dia ? d : undefined
}

/** Converte para "AAAA-MM-DD" usando a data local (sem toISOString, que usa UTC). */
export const paraDataIso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
