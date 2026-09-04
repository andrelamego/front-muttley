import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from './themeContext'

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider.')
  }
  return context
}
