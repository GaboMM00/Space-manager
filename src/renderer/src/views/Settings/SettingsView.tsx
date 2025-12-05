/**
 * Settings View
 * Application settings and configuration
 * Phase 2 Sprint 2.2 - Main Views
 */

import React from 'react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { useTheme } from '../../theme/theme-context'

/**
 * Settings View Component
 */
export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your Space Manager preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardBody padding>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    theme === 'light'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">☀️</div>
                    <div className="font-medium text-gray-900 dark:text-white">Light</div>
                  </div>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌙</div>
                    <div className="font-medium text-gray-900 dark:text-white">Dark</div>
                  </div>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    theme === 'system'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💻</div>
                    <div className="font-medium text-gray-900 dark:text-white">System</div>
                  </div>
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardBody padding>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Version</span>
                <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {navigator.platform}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Electron</span>
                <span className="font-medium text-gray-900 dark:text-white">32.2.6</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
