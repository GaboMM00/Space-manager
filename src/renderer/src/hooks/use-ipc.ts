/**
 * React hook for IPC communication
 * Provides typed interface to communicate with Main process
 */

import { useCallback, useEffect, useState } from 'react'
import { Result } from '../../../shared/types/common.types'

/**
 * Hook for invoking IPC calls
 */
export function useIPCInvoke<TData = any, TArgs extends any[] = any[]>(
  channel: string
) {
  const [data, setData] = useState<TData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invoke = useCallback(
    async (...args: TArgs): Promise<Result<TData>> => {
      setIsLoading(true)
      setError(null)

      try {
        const result: Result<TData> = await window.api[channel](...args)

        if (result.success && result.data !== undefined) {
          setData(result.data)
        } else if (!result.success) {
          setError(result.error || 'Unknown error')
        }

        setIsLoading(false)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setIsLoading(false)

        return {
          success: false,
          error: errorMessage
        }
      }
    },
    [channel]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    isLoading,
    error,
    invoke,
    reset
  }
}

/**
 * Hook for IPC event listeners
 */
export function useIPCListener<TData = any>(
  channel: string,
  callback: (data: TData) => void
): void {
  useEffect(() => {
    const unsubscribe = window.api.on(channel, callback)

    return () => {
      unsubscribe()
    }
  }, [channel, callback])
}

/**
 * Hook for one-time IPC event
 */
export function useIPCOnce<TData = any>(
  channel: string,
  callback: (data: TData) => void
): void {
  useEffect(() => {
    window.api.once(channel, callback)
  }, [channel, callback])
}

/**
 * Hook for system ping
 */
export function useSystemPing() {
  const [isPinging, setIsPinging] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ping = useCallback(async () => {
    setIsPinging(true)
    setError(null)

    const startTime = Date.now()

    try {
      const result = await window.api.system.ping()

      if (result.success && result.data) {
        const endTime = Date.now()
        setLatency(endTime - startTime)
      } else {
        setError(result.error || 'Ping failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ping failed')
    } finally {
      setIsPinging(false)
    }
  }, [])

  return {
    ping,
    isPinging,
    latency,
    error
  }
}

/**
 * Hook for system info
 */
export function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSystemInfo = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await window.api.system.getInfo()

      if (result.success && result.data) {
        setSystemInfo(result.data)
      } else {
        setError(result.error || 'Failed to fetch system info')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system info')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSystemInfo()
  }, [fetchSystemInfo])

  return {
    systemInfo,
    isLoading,
    error,
    refetch: fetchSystemInfo
  }
}
