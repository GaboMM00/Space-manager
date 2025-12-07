import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS } from '../shared/types/ipc.types'

// Custom typed API for renderer
const api = {
  // System
  system: {
    ping: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_PING),
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_INFO)
  },

  // Spaces
  spaces: {
    create: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.SPACES_CREATE, data),
    update: (id: string, data: any) => ipcRenderer.invoke(IPC_CHANNELS.SPACES_UPDATE, id, data),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SPACES_DELETE, id),
    get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SPACES_GET, id),
    list: (filters?: any) => ipcRenderer.invoke(IPC_CHANNELS.SPACES_LIST, filters),
    execute: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SPACES_EXECUTE, id)
  },

  // Tasks (Phase 3 Sprint 3.1)
  tasks: {
    create: (data: any) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_CREATE, data),
    update: (id: string, data: any) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_UPDATE, id, data),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_DELETE, id),
    get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_GET, id),
    list: (filters?: any) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_LIST, filters),
    toggle: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_TOGGLE, id),
    stats: (spaceId: string) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_STATS, spaceId),
    reorder: (taskIds: string[]) => ipcRenderer.invoke(IPC_CHANNELS.TASKS_REORDER, taskIds)
  },

  // Analytics (Phase 3 Sprint 3.2)
  analytics: {
    getSpaceUsage: () => ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_SPACE_USAGE),
    getRecentTrends: (days?: number) => ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_RECENT_TRENDS, days),
    getTopErrors: () => ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_TOP_ERRORS),
    getResourcePerformance: () => ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_RESOURCE_PERFORMANCE),
    getStats: (dateRange?: any) => ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_STATS, dateRange),
    getDailyMetrics: (spaceId: string, days?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_DAILY_METRICS, spaceId, days),
    getResourceStats: (spaceId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_RESOURCE_STATS, spaceId),
    getExecutionLogs: (filters?: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_EXECUTION_LOGS, filters),
    deleteOldLogs: (daysToKeep?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_DELETE_OLD_LOGS, daysToKeep)
  },

  // Event listeners (Main → Renderer)
  on: (channel: string, callback: (...args: any[]) => void) => {
    const subscription = (_event: any, ...args: any[]) => callback(...args)
    ipcRenderer.on(channel, subscription)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },

  // One-time event listener
  once: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (_event: any, ...args: any[]) => callback(...args))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
