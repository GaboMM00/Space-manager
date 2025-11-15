/**
 * Preload script - Expone API segura al renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';
import {
  SPACE_CHANNELS,
  TASK_CHANNELS,
  ANALYTICS_CHANNELS,
  SETTINGS_CHANNELS,
  EXECUTION_EVENTS,
} from '@shared/constants';

// Tipos para el API
export interface ElectronAPI {
  // Spaces API
  spaces: {
    getAll: () => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<void>;
    execute: (id: string, options?: any) => Promise<any>;
  };

  // Tasks API
  tasks: {
    getAll: () => Promise<any>;
    getBySpace: (spaceId: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<void>;
  };

  // Analytics API
  analytics: {
    getSummary: () => Promise<any>;
    getSpaceMetrics: (spaceId: string, days?: number) => Promise<any>;
    getExecutionLogs: (filters?: any) => Promise<any>;
  };

  // Settings API
  settings: {
    get: () => Promise<any>;
    update: (data: any) => Promise<any>;
    reset: () => Promise<any>;
  };

  // Events
  on: {
    executionStarted: (callback: (data: any) => void) => () => void;
    executionProgress: (callback: (data: any) => void) => () => void;
    executionCompleted: (callback: (data: any) => void) => () => void;
    executionFailed: (callback: (data: any) => void) => () => void;
  };
}

// Implementación del API
const electronAPI: ElectronAPI = {
  spaces: {
    getAll: () => ipcRenderer.invoke(SPACE_CHANNELS.GET_ALL),
    getById: (id: string) => ipcRenderer.invoke(SPACE_CHANNELS.GET_BY_ID, id),
    create: (data: any) => ipcRenderer.invoke(SPACE_CHANNELS.CREATE, data),
    update: (id: string, data: any) => ipcRenderer.invoke(SPACE_CHANNELS.UPDATE, id, data),
    delete: (id: string) => ipcRenderer.invoke(SPACE_CHANNELS.DELETE, id),
    execute: (id: string, options?: any) =>
      ipcRenderer.invoke(SPACE_CHANNELS.EXECUTE, id, options),
  },

  tasks: {
    getAll: () => ipcRenderer.invoke(TASK_CHANNELS.GET_ALL),
    getBySpace: (spaceId: string) => ipcRenderer.invoke(TASK_CHANNELS.GET_BY_SPACE, spaceId),
    create: (data: any) => ipcRenderer.invoke(TASK_CHANNELS.CREATE, data),
    update: (id: string, data: any) => ipcRenderer.invoke(TASK_CHANNELS.UPDATE, id, data),
    delete: (id: string) => ipcRenderer.invoke(TASK_CHANNELS.DELETE, id),
  },

  analytics: {
    getSummary: () => ipcRenderer.invoke(ANALYTICS_CHANNELS.GET_SUMMARY),
    getSpaceMetrics: (spaceId: string, days?: number) =>
      ipcRenderer.invoke(ANALYTICS_CHANNELS.GET_SPACE_METRICS, spaceId, days),
    getExecutionLogs: (filters?: any) =>
      ipcRenderer.invoke(ANALYTICS_CHANNELS.GET_EXECUTION_LOGS, filters),
  },

  settings: {
    get: () => ipcRenderer.invoke(SETTINGS_CHANNELS.GET),
    update: (data: any) => ipcRenderer.invoke(SETTINGS_CHANNELS.UPDATE, data),
    reset: () => ipcRenderer.invoke(SETTINGS_CHANNELS.RESET),
  },

  on: {
    executionStarted: (callback: (data: any) => void) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on(EXECUTION_EVENTS.STARTED, handler);
      return () => ipcRenderer.removeListener(EXECUTION_EVENTS.STARTED, handler);
    },
    executionProgress: (callback: (data: any) => void) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on(EXECUTION_EVENTS.PROGRESS, handler);
      return () => ipcRenderer.removeListener(EXECUTION_EVENTS.PROGRESS, handler);
    },
    executionCompleted: (callback: (data: any) => void) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on(EXECUTION_EVENTS.COMPLETED, handler);
      return () => ipcRenderer.removeListener(EXECUTION_EVENTS.COMPLETED, handler);
    },
    executionFailed: (callback: (data: any) => void) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on(EXECUTION_EVENTS.FAILED, handler);
      return () => ipcRenderer.removeListener(EXECUTION_EVENTS.FAILED, handler);
    },
  },
};

// Exponer API de forma segura
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Declaración de tipos global para TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
