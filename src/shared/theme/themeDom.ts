import {
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from './themePolicy'

export const readInitialTheme = (): Theme =>
  resolveInitialTheme(
    window.localStorage.getItem(THEME_STORAGE_KEY),
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export const initializeTheme = () => {
  applyTheme(readInitialTheme())
}
