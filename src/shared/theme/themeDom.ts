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

// Fundo do topo da página em cada tema (--color-bg-page), para a barra do sistema combinar.
const COR_DA_BARRA: Record<Theme, string> = {
  light: '#eef0f6',
  dark: '#11131c',
}

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  // O tema do app pode diferir do sistema; as duas metas passam a seguir o tema escolhido.
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', COR_DA_BARRA[theme]))
}

export const initializeTheme = () => {
  applyTheme(readInitialTheme())
}
