import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '../config/env'
import { HttpError } from './httpError'

let authTokenGetter: (() => string | null) | null = null
let unauthorizedHandler: (() => void) | null = null

export const setAuthTokenGetter = (getter: () => string | null) => {
  authTokenGetter = getter
}

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler
}

export const clearAuthToken = () => {
  authTokenGetter = () => null
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = authTokenGetter
      ? authTokenGetter()
      : localStorage.getItem('token')
    const url = config.url || ''
    const isAuthRoute =
      url.includes('/auth/login') || url.includes('/auth/register')

    // Vincula o token utilizado nesta requisição específica
    ;(config as unknown as Record<string, unknown>).__muttleyRequestToken =
      token

    if (token && !isAuthRoute) {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else if (isAuthRoute) {
      config.headers.delete('Authorization')
    }

    return config
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      const activeToken = authTokenGetter
        ? authTokenGetter()
        : localStorage.getItem('token')
      const requestToken = (
        error.config as unknown as Record<string, unknown> | undefined
      )?.__muttleyRequestToken

      // Se a resposta 401 pertencer a uma requisição antiga cujo token já foi substituído
      // ou se o usuário já realizou logout voluntário, descarta o efeito colateral sobre a nova sessão.
      const isStaleSession =
        !activeToken || (requestToken && requestToken !== activeToken)

      if (!isStaleSession) {
        if (unauthorizedHandler) {
          unauthorizedHandler()
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('role')
          localStorage.removeItem('usuario')
          window.dispatchEvent(new CustomEvent('muttley:unauthorized'))
        }
      }
    }

    const httpError = HttpError.fromAxiosError(error)
    return Promise.reject(httpError)
  }
)

export default apiClient
