export interface AppConfig {
  apiBaseUrl: string
}

export const env: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
}
