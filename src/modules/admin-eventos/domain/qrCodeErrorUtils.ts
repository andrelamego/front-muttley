/**
 * Analisa e normaliza erros ocorridos no download/geração de QR Codes como Blob.
 * Trata códigos HTTP 503, 404, 401, 403 e extrai mensagens JSON válidas
 * sem vazar stack traces, queries SQL ou exceções internas para o usuário.
 */
export async function parseBlobErrorMessage(
  err: unknown,
  fallbackMessage: string
): Promise<string> {
  if (!err) return fallbackMessage
  const axiosErr = err as {
    response?: {
      status?: number
      data?: unknown
    }
    status?: number
    message?: string
  }

  const status = axiosErr?.response?.status || axiosErr?.status

  if (status === 503) {
    return 'Serviço gerador de QR Code temporariamente indisponível. Tente novamente em instantes.'
  }
  if (status === 404) {
    return 'Evento não encontrado para geração de QR Code.'
  }
  if (status === 401) {
    return 'Sessão expirada. Faça login novamente para continuar.'
  }
  if (status === 403) {
    return 'Você não possui permissão administrativa para acessar este QR Code.'
  }

  const data = axiosErr?.response?.data
  if (data instanceof Blob) {
    try {
      const text = await data.text()
      const json = JSON.parse(text)
      if (
        json.erro &&
        typeof json.erro === 'string' &&
        !json.erro.includes('Exception') &&
        !json.erro.toLowerCase().includes('sql')
      ) {
        return json.erro
      }
      if (json.message && typeof json.message === 'string') {
        return json.message
      }
    } catch {
      // Ignora falha de parse
    }
  }

  if (axiosErr?.message && !axiosErr.message.includes('status code')) {
    return axiosErr.message
  }

  return fallbackMessage
}
