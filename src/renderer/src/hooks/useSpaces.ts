/**
 * useSpaces Hook (ViewModel)
 * Manages spaces state and operations
 * Phase 2 Sprint 2.2 - Main Views
 */

import { useState, useEffect, useCallback } from 'react'
import type { Space } from '../../../modules/workspace/types/workspace.types'
import type { Result } from '../../../shared/types/common.types'

/**
 * Spaces ViewModel Hook
 */
export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load all spaces
   */
  const loadSpaces = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<Space[]> = await window.api.spaces.list()

      if (result.success && result.data) {
        setSpaces(result.data)
      } else {
        setError(result.error || 'Failed to load spaces')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new space
   */
  const createSpace = useCallback(async (spaceData: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<Space> = await window.api.spaces.create(spaceData)

      if (result.success && result.data) {
        setSpaces((prev) => [...prev, result.data!])
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to create space')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update an existing space
   */
  const updateSpace = useCallback(async (id: string, updates: Partial<Space>) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<Space> = await window.api.spaces.update(id, updates)

      if (result.success && result.data) {
        setSpaces((prev) => prev.map((space) => (space.id === id ? result.data! : space)))
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to update space')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a space
   */
  const deleteSpace = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<void> = await window.api.spaces.delete(id)

      if (result.success) {
        setSpaces((prev) => prev.filter((space) => space.id !== id))
        return { success: true }
      } else {
        setError(result.error || 'Failed to delete space')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Execute a space
   */
  const executeSpace = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await window.api.spaces.execute(id)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to execute space')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get a single space by ID
   */
  const getSpace = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<Space> = await window.api.spaces.get(id)

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to get space')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load spaces on mount
  useEffect(() => {
    loadSpaces()
  }, [loadSpaces])

  return {
    spaces,
    loading,
    error,
    loadSpaces,
    createSpace,
    updateSpace,
    deleteSpace,
    executeSpace,
    getSpace
  }
}
