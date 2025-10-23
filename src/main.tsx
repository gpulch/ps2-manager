import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SourceProvider } from './contexts/SourceContext'
import { NavProvider } from './contexts/NavContext'
import { ToastProvider } from './ui/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <NavProvider>
        <SourceProvider>
          <App />
        </SourceProvider>
      </NavProvider>
    </ToastProvider>
  </StrictMode>,
)
