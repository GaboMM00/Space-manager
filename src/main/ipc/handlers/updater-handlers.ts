/**
 * Auto-Updater IPC Handlers
 * Handles IPC communication for application updates
 * Phase 6 Sprint 6.1 - Packaging & Distribution
 */

import { ipcMain, createSuccessResult, createErrorResult } from '../ipc-main'
import { IPC_CHANNELS } from '../../../shared/types/ipc.types'
import { Result } from '../../../shared/types/common.types'
import { logger } from '../../../shared/utils/logger'

// Reference to the auto-updater service (will be set from main/index.ts)
let autoUpdaterServiceInstance: any = null

/**
 * Set the auto-updater service instance
 */
export function setAutoUpdaterService(service: any): void {
  autoUpdaterServiceInstance = service
}

/**
 * Register all auto-updater IPC handlers
 */
export function registerUpdaterHandlers(): void {
  logger.info('Registering auto-updater IPC handlers')

  // CHECK for updates
  ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK_FOR_UPDATES, async (): Promise<Result<void>> => {
    logger.debug('Handling UPDATER_CHECK_FOR_UPDATES')

    if (!autoUpdaterServiceInstance) {
      return createErrorResult<void>('Auto-updater not available')
    }

    try {
      await autoUpdaterServiceInstance.checkForUpdates()
      return createSuccessResult()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to check for updates:', errorMessage)
      return createErrorResult<void>(errorMessage)
    }
  })

  // DOWNLOAD update
  ipcMain.handle(IPC_CHANNELS.UPDATER_DOWNLOAD_UPDATE, async (): Promise<Result<void>> => {
    logger.debug('Handling UPDATER_DOWNLOAD_UPDATE')

    if (!autoUpdaterServiceInstance) {
      return createErrorResult<void>('Auto-updater not available')
    }

    try {
      await autoUpdaterServiceInstance.downloadUpdate()
      return createSuccessResult()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to download update:', errorMessage)
      return createErrorResult<void>(errorMessage)
    }
  })

  // INSTALL and restart
  ipcMain.handle(IPC_CHANNELS.UPDATER_QUIT_AND_INSTALL, async (): Promise<Result<void>> => {
    logger.debug('Handling UPDATER_QUIT_AND_INSTALL')

    if (!autoUpdaterServiceInstance) {
      return createErrorResult<void>('Auto-updater not available')
    }

    try {
      autoUpdaterServiceInstance.quitAndInstall()
      return createSuccessResult()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to quit and install:', errorMessage)
      return createErrorResult<void>(errorMessage)
    }
  })

  logger.info('Auto-updater IPC handlers registered successfully')
}
