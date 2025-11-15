/**
 * Constantes de eventos IPC
 */

/**
 * Canales IPC para Spaces
 */
export const SPACE_CHANNELS = {
  GET_ALL: 'space:getAll',
  GET_BY_ID: 'space:getById',
  CREATE: 'space:create',
  UPDATE: 'space:update',
  DELETE: 'space:delete',
  EXECUTE: 'space:execute',
  EXPORT: 'space:export',
  IMPORT: 'space:import',
} as const;

/**
 * Canales IPC para Tasks
 */
export const TASK_CHANNELS = {
  GET_ALL: 'task:getAll',
  GET_BY_SPACE: 'task:getBySpace',
  CREATE: 'task:create',
  UPDATE: 'task:update',
  DELETE: 'task:delete',
  TOGGLE_STATUS: 'task:toggleStatus',
} as const;

/**
 * Canales IPC para Analytics
 */
export const ANALYTICS_CHANNELS = {
  GET_SUMMARY: 'analytics:getSummary',
  GET_SPACE_METRICS: 'analytics:getSpaceMetrics',
  GET_EXECUTION_LOGS: 'analytics:getExecutionLogs',
  GET_ERROR_LOGS: 'analytics:getErrorLogs',
  EXPORT_DATA: 'analytics:exportData',
  CLEANUP: 'analytics:cleanup',
} as const;

/**
 * Canales IPC para Settings
 */
export const SETTINGS_CHANNELS = {
  GET: 'settings:get',
  UPDATE: 'settings:update',
  RESET: 'settings:reset',
} as const;

/**
 * Eventos de Execution
 */
export const EXECUTION_EVENTS = {
  STARTED: 'execution:started',
  PROGRESS: 'execution:progress',
  COMPLETED: 'execution:completed',
  FAILED: 'execution:failed',
  CANCELLED: 'execution:cancelled',
} as const;

/**
 * Eventos generales
 */
export const APP_EVENTS = {
  READY: 'app:ready',
  ERROR: 'app:error',
  NOTIFICATION: 'app:notification',
} as const;
