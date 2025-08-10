import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider, useToast } from './components/ui/ToastNotification.tsx'
import { setGlobalToast } from './utils/errorHandler'

// Initialize global toast system
const AppWithErrorHandler = () => {
  const toast = useToast();
  
  useEffect(() => {
    // Set the global toast instance for the error handler
    setGlobalToast(toast);
  }, [toast]);
  
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider position="top-right">
      <AppWithErrorHandler />
    </ToastProvider>
  </StrictMode>,
)
