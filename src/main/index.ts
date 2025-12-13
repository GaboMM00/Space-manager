import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { logger } from '../shared/utils/logger'
import { initializeDIContainer } from './di/container-setup'
import { registerSystemHandlers } from './ipc/handlers/system-handlers'
import { registerWorkspaceHandlers } from './ipc/handlers/workspace-handlers'
import { registerExecutionHandlers } from './ipc/handlers/execution-handlers'
import { registerTaskHandlers } from './ipc/handlers/task-handlers'
import { registerAnalyticsHandlers } from './ipc/handlers/analytics-handlers'
import { registerUpdaterHandlers, setAutoUpdaterService } from './ipc/handlers/updater-handlers'
import { closeSQLiteConnection } from './services/SQLiteService'
import { createAutoUpdaterService, AutoUpdaterService } from './services/AutoUpdaterService'

// Global reference to auto-updater service
let autoUpdaterService: AutoUpdaterService | null = null

/**
 * Initialize DI Container and IPC handlers
 */
function initializeApplication(): void {
  logger.info('Initializing application...')

  // Initialize Dependency Injection Container (Sprint 5.5.2)
  initializeDIContainer()

  // Initialize IPC handlers
  logger.info('Initializing IPC handlers...')

  // Register system handlers
  registerSystemHandlers()

  // Register workspace handlers
  registerWorkspaceHandlers()

  // Register execution handlers
  registerExecutionHandlers()

  // Register task handlers (Sprint 3.1)
  registerTaskHandlers()

  // Register analytics handlers (Sprint 3.2)
  registerAnalyticsHandlers()

  // Register auto-updater handlers (Sprint 6.1)
  registerUpdaterHandlers()

  logger.info('IPC handlers initialized successfully')
  logger.info('Application initialized successfully')
}

function createWindow(): BrowserWindow {
  logger.info('Creating main window...')

  // Verify preload script path
  const preloadPath = join(__dirname, '../preload/index.js')
  const fs = require('fs')
  const preloadExists = fs.existsSync(preloadPath)
  logger.info('Preload script path', { preloadPath, exists: preloadExists })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    logger.info('Main window ready and shown')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the remote URL for development or the local html file for production.
  if (process.env.NODE_ENV === 'development' && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    logger.debug('Loaded development URL', { url: process.env.ELECTRON_RENDERER_URL })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    logger.debug('Loaded production HTML file')
  }

  // Add error listeners to diagnose issues
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    logger.error('Failed to load renderer', { errorCode, errorDescription })
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logger.error('Renderer process gone', { details })
  })

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    logger.info('Renderer console', { level, message, line, sourceId })
  })

  // Log when the page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('Renderer finished loading')
  })

  // Log when the window is ready to show
  mainWindow.once('ready-to-show', () => {
    logger.info('Window ready to show')
  })

  // Open DevTools in development AND temporarily in production for debugging
  if (process.env.NODE_ENV === 'development' || true) {
    mainWindow.webContents.openDevTools()
    logger.debug('DevTools opened')
  }

  // Initialize auto-updater (only in production)
  if (process.env.NODE_ENV !== 'development') {
    autoUpdaterService = createAutoUpdaterService(mainWindow)
    // Set service instance for IPC handlers
    setAutoUpdaterService(autoUpdaterService)
    // Check for updates on app startup
    autoUpdaterService.checkForUpdates().catch((error) => {
      logger.error('Failed to check for updates on startup:', error)
    })
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  logger.info('Electron app ready', {
    version: app.getVersion(),
    platform: process.platform,
    environment: process.env.NODE_ENV
  })

  // Set app user model id for windows
  app.setAppUserModelId('com.spacemanager')

  // Initialize application (DI Container + IPC)
  initializeApplication()

  // Create main window
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger.info('All windows closed, quitting app')
    app.quit()
  }
})

// Cleanup before quitting
app.on('before-quit', () => {
  logger.info('App quitting, cleaning up...')
  closeSQLiteConnection()
})
