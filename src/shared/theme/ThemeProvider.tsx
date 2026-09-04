import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext'
import { applyTheme, readInitialTheme } from './themeDom'
import { THEME_STORAGE_KEY, type Theme } from './themePolicy'

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [setTheme, theme])

  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
