/**
 * Router Configuration
 * Defines application routes and navigation
 * Phase 2 Sprint 2.2 - Main Views
 */

import { createHashRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { DashboardView } from '../views/Dashboard/DashboardView'
import { SpaceEditorView } from '../views/SpaceEditor/SpaceEditorView'
import { SettingsView } from '../views/Settings/SettingsView'
import { TasksView } from '../views/Tasks/TasksView'

/**
 * Application router configuration
 * Using HashRouter for Electron compatibility
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardView />
      },
      {
        path: 'spaces/new',
        element: <SpaceEditorView />
      },
      {
        path: 'spaces/:spaceId/edit',
        element: <SpaceEditorView />
      },
      {
        path: 'tasks',
        element: <TasksView />
      },
      {
        path: 'settings',
        element: <SettingsView />
      }
    ]
  }
])
