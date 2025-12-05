/**
 * App Component
 * Main application entry point with routing
 * Phase 2 Sprint 2.2 - Main Views
 * Updated Sprint 2.3 - UX y Accesibilidad
 */

import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './theme/theme-context'
import { ToastProvider } from './context/ToastContext'
import { router } from './router'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
