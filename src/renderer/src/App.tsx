/**
 * App Component
 * Main application entry point with routing
 * Phase 2 Sprint 2.2 - Main Views
 */

import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './theme/theme-context'
import { router } from './router'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
