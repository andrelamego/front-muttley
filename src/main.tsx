import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastViewport } from './shared/ui'
import { initializeTheme, ThemeProvider } from './shared/theme'
import { MotionPreferences } from './shared/motion'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MotionPreferences>
        <App />
        <ToastViewport />
      </MotionPreferences>
    </ThemeProvider>
  </StrictMode>
)
