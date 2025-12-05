/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcuts management
 * Phase 2 Sprint 2.3 - UX y Accesibilidad
 */

import { useEffect, useCallback } from 'react'

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: () => void
  description: string
}

/**
 * Check if keyboard event matches shortcut
 */
const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
  const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
  const altMatch = shortcut.alt ? event.altKey : !event.altKey
  const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey

  return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch
}

/**
 * Format shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = []

  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.meta) parts.push('Cmd')

  parts.push(shortcut.key.toUpperCase())

  return parts.join('+')
}

/**
 * Hook for managing keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]): void => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if user is typing in input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Find matching shortcut
      const matchedShortcut = shortcuts.find((shortcut) => matchesShortcut(event, shortcut))

      if (matchedShortcut) {
        event.preventDefault()
        matchedShortcut.handler()
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
