/**
 * Ventana principal de la aplicación
 */

import { BrowserWindow } from 'electron';
import path from 'path';
import { createLogger } from '@shared/utils';

const logger = createLogger('MainWindow');

export function createMainWindow(): BrowserWindow {
  logger.info('Creating main window...');

  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Space Manager',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false, // No mostrar hasta que esté lista
  });

  // Cargar la aplicación
  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:5173');
    window.webContents.openDevTools();
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Mostrar cuando esté lista
  window.once('ready-to-show', () => {
    window.show();
    logger.info('Main window ready and visible');
  });

  // Handler para cerrar
  window.on('closed', () => {
    logger.info('Main window closed');
  });

  return window;
}
