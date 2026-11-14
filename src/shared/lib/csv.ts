// Ponto e vírgula e BOM: o Excel em português abre o arquivo com colunas e acentos corretos.
const SEPARADOR = ';'
const BOM = String.fromCharCode(0xfeff)

const celula = (valor: string | number | null | undefined): string => {
  let texto = valor === null || valor === undefined ? '' : String(valor)
  // Evita injeção de fórmula ao abrir no Excel (=, +, -, @ no início).
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

export const paraCsv = (
  linhas: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>
): string => BOM + linhas.map((l) => l.map(celula).join(SEPARADOR)).join('\r\n')

/** Faz o navegador baixar o texto como arquivo. */
export const baixarArquivo = (
  conteudo: string,
  nome: string,
  tipo = 'text/csv;charset=utf-8'
) => {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  link.click()
  URL.revokeObjectURL(url)
}
