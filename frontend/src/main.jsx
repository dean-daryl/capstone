import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster theme='dark' position='top-right' toastOptions={{  classNames: {
      toast: 'bg-gray-800/60',
  }}}/>
    <App />
  </StrictMode>,
)
