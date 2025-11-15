/**
 * Tipos relacionados con configuración de la aplicación
 */

/**
 * Tema de la aplicación
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Configuración de notificaciones
 */
export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  onExecutionComplete: boolean;
  onExecutionFailed: boolean;
  onTaskDue: boolean;
}

/**
 * Configuración de ejecución
 */
export interface ExecutionSettings {
  continueOnError: boolean;
  showProgressNotifications: boolean;
  defaultDelay: number;
  confirmBeforeExecute: boolean;
}

/**
 * Configuración de analytics
 */
export interface AnalyticsSettings {
  enabled: boolean;
  retentionDays: number;
  autoCleanup: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
}

/**
 * Configuración de calendario
 */
export interface CalendarSettings {
  enabled: boolean;
  provider?: 'google' | 'outlook' | 'apple';
  syncInterval: number;
  autoCreateEvents: boolean;
}

/**
 * Configuración general
 */
export interface GeneralSettings {
  language: string;
  theme: Theme;
  startOnBoot: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
}

/**
 * Configuración completa de la aplicación
 */
export interface AppSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  execution: ExecutionSettings;
  analytics: AnalyticsSettings;
  calendar: CalendarSettings;
}
