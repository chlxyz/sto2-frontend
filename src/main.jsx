import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const stored = localStorage.getItem('sto2-theme')
document.documentElement.dataset.theme =
  stored ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
