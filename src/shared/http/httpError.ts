export interface ApiErrorPayload {
  message?: string
  error?: string
  erro?: string
  erros?: string[]
}

export class HttpError extends Error {
  readonly status: number
  readonly validationErrors?: string[]
  readonly originalError?: unknown

  constructor(
    message: string,
    status: number,
    validationErrors?: string[],
    originalError?: unknown
  ) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.validationErrors = validationErrors
    this.originalError = originalError

    // Manter cadeia de protótipo consistente em TypeScript
    Object.setPrototypeOf(this, HttpError.prototype)
  }

  static fromAxiosError(error: {
    response?: { status: number; data: unknown }
    message?: string
  }): HttpError {
    const status = error.response?.status ?? 0
    const data = error.response?.data as ApiErrorPayload | undefined

    let message = ''
    let validationErrors: string[] | undefined

    if (data && typeof data === 'object') {
      if (Array.isArray(data.erros) && data.erros.length > 0) {
        validationErrors = data.erros
        message = data.erros.join('\n')
      } else if (typeof data.erro === 'string' && data.erro.trim().length > 0) {
        message = data.erro
      } else if (
        typeof data.message === 'string' &&
        data.message.trim().length > 0
      ) {
        message = data.message
      } else if (
        typeof data.error === 'string' &&
        data.error.trim().length > 0
      ) {
        message = data.error
      }
    }

    if (!message) {
      switch (status) {
        case 400:
          message = 'Dados inválidos na requisição.'
          break
        case 401:
          message = 'Email ou senha inválidos.'
          break
        case 403:
          message =
            'Acesso negado. Você não possui permissão para executar esta ação.'
          break
        case 404:
          message = 'O recurso solicitado não foi encontrado.'
          break
        case 409:
          message = 'Conflito de estado ou registro já existente.'
          break
        case 500:
        case 502:
        case 503:
          message = 'Serviço temporariamente indisponível. Tente novamente.'
          break
        default:
          message =
            error.message || 'Falha na comunicação com o servidor do Muttley.'
          break
      }
    }

    return new HttpError(message, status, validationErrors, error)
  }
}
