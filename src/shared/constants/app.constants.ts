/**
 * Constantes generales de la aplicación
 */

export const APP_NAME = 'Space Manager';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Sistema modular de gestión de espacios de trabajo digitales';

/**
 * Rutas de directorios
 */
export const DIR_PATHS = {
  USER_DATA: 'userData',
  DATA: 'data',
  LOGS: 'logs',
  BACKUPS: 'backups',
  PLUGINS: 'plugins',
} as const;

/**
 * Nombres de archivos
 */
export const FILE_NAMES = {
  SPACES: 'spaces.json',
  TASKS: 'tasks.json',
  SETTINGS: 'settings.json',
  ANALYTICS_DB: 'analytics.db',
} as const;

/**
 * Valores por defecto
 */
export const DEFAULTS = {
  EXECUTION_DELAY: 500,
  TIMEOUT: 30000,
  ANALYTICS_RETENTION_DAYS: 90,
  SYNC_INTERVAL: 300000, // 5 minutos
  THEME: 'system' as const,
} as const;

/**
 * Límites
 */
export const LIMITS = {
  MAX_SPACES: 100,
  MAX_RESOURCES_PER_SPACE: 50,
  MAX_SUBTASKS: 10,
  MAX_REMINDERS: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;
