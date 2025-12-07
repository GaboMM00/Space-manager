/**
 * Window API type declarations
 * Extends Window interface with Electron API
 */

import { Result, SystemInfo } from '../../../shared/types/ipc.types'

declare global {
  interface Window {
    electron: any
    api: {
      // System
      system: {
        ping: () => Promise<Result<{ pong: boolean; timestamp: number }>>
        getInfo: () => Promise<Result<SystemInfo>>
      }

      // Spaces
      spaces: {
        create: (data: any) => Promise<Result<any>>
        update: (id: string, data: any) => Promise<Result<any>>
        delete: (id: string) => Promise<Result<void>>
        get: (id: string) => Promise<Result<any>>
        list: (filters?: any) => Promise<Result<any[]>>
        execute: (id: string) => Promise<Result<any>>
      }

      // Tasks (Phase 3 Sprint 3.1)
      tasks: {
        create: (data: any) => Promise<Result<any>>
        update: (id: string, data: any) => Promise<Result<any>>
        delete: (id: string) => Promise<Result<void>>
        get: (id: string) => Promise<Result<any>>
        list: (filters?: any) => Promise<Result<any[]>>
        toggle: (id: string) => Promise<Result<any>>
        stats: (spaceId: string) => Promise<Result<any>>
        reorder: (taskIds: string[]) => Promise<Result<void>>
      }

      // Analytics (Phase 3 Sprint 3.2)
      analytics: {
        getSpaceUsage: () => Promise<Result<any[]>>
        getRecentTrends: (days?: number) => Promise<Result<any[]>>
        getTopErrors: () => Promise<Result<any[]>>
        getResourcePerformance: () => Promise<Result<any[]>>
        getStats: (dateRange?: any) => Promise<Result<any>>
        getDailyMetrics: (spaceId: string, days?: number) => Promise<Result<any[]>>
        getResourceStats: (spaceId: string) => Promise<Result<any[]>>
        getExecutionLogs: (filters?: any) => Promise<Result<any[]>>
        deleteOldLogs: (daysToKeep?: number) => Promise<Result<number>>
      }

      // Event listeners
      on: (channel: string, callback: (...args: any[]) => void) => () => void
      once: (channel: string, callback: (...args: any[]) => void) => void
    }
  }
}

export {}
