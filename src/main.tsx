import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SuperAdminAuthProvider } from './contexts/SuperAdminAuthContext.tsx'
import { TenantProvider } from './contexts/TenantContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import { registerServiceWorker } from './lib/register-service-worker.ts'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <SuperAdminAuthProvider>
          <AuthProvider>
            <TenantProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </TenantProvider>
          </AuthProvider>
        </SuperAdminAuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
