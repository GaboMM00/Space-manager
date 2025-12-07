/**
 * useAnalytics Hook (ViewModel)
 * Manages analytics state and operations
 * Phase 5 Sprint 5.3.2 - Analytics Dashboard UI Integration
 */

import { useState, useCallback } from 'react'
import type { Result } from '../../../shared/types/common.types'

/**
 * Analytics ViewModel Hook
 */
export const useAnalytics = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get overall stats
   */
  const getStats = useCallback(async (dateRange?: { start: number; end: number }) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<any> = await window.api.analytics.getStats(dateRange)

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to load stats')
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
   * Get space usage statistics
   */
  const getSpaceUsage = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<any[]> = await window.api.analytics.getSpaceUsage()

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to load space usage')
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
   * Get recent trends
   */
  const getRecentTrends = useCallback(async (days?: number) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<any[]> = await window.api.analytics.getRecentTrends(days)

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to load trends')
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
   * Get daily metrics for a space
   */
  const getDailyMetrics = useCallback(async (spaceId: string, days: number = 30) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<any[]> = await window.api.analytics.getDailyMetrics(spaceId, days)

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to load daily metrics')
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
   * Get execution logs with filters
   */
  const getExecutionLogs = useCallback(async (filters?: any) => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<any[]> = await window.api.analytics.getExecutionLogs(filters)

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to load execution logs')
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
   * Get top errors
   */
  const getTopErrors = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result: Result<any[]> = await window.api.analytics.getTopErrors()

      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to load top errors')
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

  return {
    loading,
    error,
    getStats,
    getSpaceUsage,
    getRecentTrends,
    getDailyMetrics,
    getExecutionLogs,
    getTopErrors
  }
}
