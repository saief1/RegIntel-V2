import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { featureFlags } from './config/featureFlags'
import { AuthSessionProvider } from './context/AuthSessionProvider'
import './index.css'
import App from './App.tsx'

if (import.meta.env.DEV && featureFlags.useRealAuth) {
  console.info(
    '[RegIntel] VITE_USE_REAL_AUTH enabled — AuthSessionProvider will refresh real sessions',
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthSessionProvider>
          <App />
        </AuthSessionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
