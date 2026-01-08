import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/index.js'

// Suppress browser extension errors (React DevTools, etc.)
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('runtime.lastError') ||
     args[0].includes('message channel closed'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Provider store={store}>
      <App />
    </Provider>

  </StrictMode>,
)
