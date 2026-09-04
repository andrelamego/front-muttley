import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastViewport } from './shared/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastViewport />
  </StrictMode>
)
