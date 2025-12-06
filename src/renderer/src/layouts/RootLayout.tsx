/**
 * Root Layout
 * Main application layout with sidebar navigation
 * Phase 2 Sprint 2.2 - Main Views
 * Updated Sprint 2.3 - UX y Accesibilidad
 */

import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { Sidebar, SidebarItem, SidebarSection } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Dropdown, DropdownItem, DropdownLabel } from '../components/ui/Dropdown'
import { useTheme } from '../theme/theme-context'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

/**
 * Root Layout Component
 */
export const RootLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      handler: () => navigate('/spaces/new'),
      description: 'Create new space'
    },
    {
      key: 'd',
      ctrl: true,
      handler: () => navigate('/dashboard'),
      description: 'Go to dashboard'
    },
    {
      key: 't',
      ctrl: true,
      handler: () => navigate('/tasks'),
      description: 'Go to tasks'
    },
    {
      key: ',',
      ctrl: true,
      handler: () => navigate('/settings'),
      description: 'Open settings'
    },
    {
      key: 't',
      ctrl: true,
      shift: true,
      handler: () => {
        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
        const currentIndex = themes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex])
      },
      description: 'Toggle theme'
    }
  ])

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  // Icons (simple SVG icons)
  const HomeIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )

  const SettingsIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  const ThemeIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )

  const TasksIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )

  const sidebar = (
    <Sidebar
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
            SM
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Space Manager</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
          </div>
        </div>
      }
      footer={
        <Dropdown
          trigger={
            <Button variant="ghost" size="sm" fullWidth>
              {ThemeIcon}
              <span className="flex-1 text-left">Theme: {theme}</span>
            </Button>
          }
          align="start"
        >
          <DropdownLabel>Theme</DropdownLabel>
          <DropdownItem onClick={() => setTheme('light')}>Light</DropdownItem>
          <DropdownItem onClick={() => setTheme('dark')}>Dark</DropdownItem>
          <DropdownItem onClick={() => setTheme('system')}>System</DropdownItem>
        </Dropdown>
      }
    >
      <SidebarSection title="Main">
        <SidebarItem
          icon={HomeIcon}
          active={isActive('/dashboard')}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </SidebarItem>
        <SidebarItem
          icon={TasksIcon}
          active={isActive('/tasks')}
          onClick={() => navigate('/tasks')}
        >
          Tasks
        </SidebarItem>
      </SidebarSection>

      <SidebarSection title="Settings">
        <SidebarItem
          icon={SettingsIcon}
          active={isActive('/settings')}
          onClick={() => navigate('/settings')}
        >
          Settings
        </SidebarItem>
      </SidebarSection>
    </Sidebar>
  )

  const header = (
    <Header
      title="Space Manager"
      right={
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/spaces/new')}
        >
          + New Space
        </Button>
      }
    />
  )

  return (
    <MainLayout sidebar={sidebar} header={header}>
      <Outlet />
    </MainLayout>
  )
}
