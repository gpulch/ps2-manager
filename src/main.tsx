import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SourceProvider } from './contexts/SourceContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SourceProvider>
      <App />
    </SourceProvider>
  </StrictMode>,
)
