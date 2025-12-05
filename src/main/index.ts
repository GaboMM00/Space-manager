import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { logger } from '../shared/utils/logger'
import { registerSystemHandlers } from './ipc/handlers/system-handlers'
import { registerWorkspaceHandlers } from './ipc/handlers/workspace-handlers'
import { registerExecutionHandlers } from './ipc/handlers/execution-handlers'

/**
 * Initialize IPC handlers
 */
function initializeIPC(): void {
  logger.info('Initializing IPC handlers...')

  // Register system handlers
  registerSystemHandlers()

  // Register workspace handlers
  registerWorkspaceHandlers()

  // Register execution handlers
  registerExecutionHandlers()

  // TODO: Register other handlers in future sprints
  // - Task handlers (Sprint 3.1)
  // - Analytics handlers (Sprint 3.2)

  logger.info('IPC handlers initialized successfully')
}

function createWindow(): void {
  logger.info('Creating main window...')

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
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

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
    logger.debug('DevTools opened')
  }
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

  // Initialize IPC communication
  initializeIPC()

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
