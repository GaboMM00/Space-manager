/**
 * Punto de entrada principal de Electron
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { createLogger } from '@shared/utils';
import { getDatabaseService, getFileSystemService } from './services';
import { createMainWindow } from './windows/mainWindow';

const logger = createLogger('Main');

let mainWindow: BrowserWindow | null = null;

/**
 * Inicializa todos los servicios de la aplicación
 */
async function initializeServices(): Promise<void> {
  logger.info('Initializing services...');

  try {
    // Inicializar FileSystem
    getFileSystemService();
    logger.info('FileSystemService initialized');

    // Inicializar Database
    const dbService = getDatabaseService();
    await dbService.initialize();
    logger.info('DatabaseService initialized');

    // TODO: Inicializar más servicios cuando estén implementados
    // - SpaceService
    // - TaskService
    // - AnalyticsService
    // - etc.

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services', error);
    throw error;
  }
}

/**
 * Handler cuando la app está lista
 */
async function onAppReady(): Promise<void> {
  logger.info('App is ready');

  try {
    // Inicializar servicios
    await initializeServices();

    // Crear ventana principal
    mainWindow = createMainWindow();

    // TODO: Registrar IPC handlers

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Failed to start application', error);
    app.quit();
  }
}

/**
 * Cleanup antes de salir
 */
async function cleanup(): Promise<void> {
  logger.info('Cleaning up...');

  try {
    const dbService = getDatabaseService();
    await dbService.close();
    logger.info('Cleanup completed');
  } catch (error) {
    logger.error('Error during cleanup', error);
  }
}

// Event handlers
app.whenReady().then(onAppReady);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});

app.on('before-quit', async event => {
  event.preventDefault();
  await cleanup();
  app.exit(0);
});

// Error handlers
process.on('uncaughtException', error => {
  logger.error('Uncaught exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});
