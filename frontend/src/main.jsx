import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import QueryProvider from './app/providers/QueryProvider.jsx'

const THEME_KEY = 'guts_theme'
const savedTheme = window.localStorage.getItem(THEME_KEY) || 'dark'
document.documentElement.dataset.theme = savedTheme

const securityWarningKey = 'guts_self_xss_warning_shown'
if (!window.localStorage.getItem(securityWarningKey)) {
  window.localStorage.setItem(securityWarningKey, 'true')
  console.log('%cStop!', 'font-size:48px;font-weight:800;color:#ff3b30;background:#111;padding:8px 14px;border-radius:10px;')
  console.log('%cThis browser console is for developers only. Do not paste code here unless you fully trust it.', 'font-size:16px;font-weight:700;color:#ff3b30;')
  console.log('%cAnyone asking you to paste code here could be trying to steal your account or data.', 'font-size:14px;color:#f59e0b;')
  console.log('%cIf you need help, use the app UI or contact the system admin.', 'font-size:14px;color:#d1d5db;')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>,
)
