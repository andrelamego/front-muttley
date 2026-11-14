export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'muttley-theme'

export const isTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark'

export const resolveInitialTheme = (
  storedTheme: string | null,
  prefersDark: boolean
): Theme => {
  if (isTheme(storedTheme)) return storedTheme
  return prefersDark ? 'dark' : 'light'
}
