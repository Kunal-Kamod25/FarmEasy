import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress Google library warnings in production
if (process.env.NODE_ENV === 'production') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('google') || args[0].includes('credentials'))) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('google') || args[0].includes('credentials'))) {
      return;
    }
    originalError(...args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
