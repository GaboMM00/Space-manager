/**
 * System IPC handlers
 * Handles system-level operations like ping and system info
 */

import { app } from 'electron'
import { IPC_CHANNELS } from '../../../shared/types/ipc.types'
import { ipcMain, createSuccessResult } from '../ipc-main'
import { logger } from '../../../shared/utils/logger'

/**
 * Register all system handlers
 */
export function registerSystemHandlers(): void {
  // Ping handler
  ipcMain.handle(IPC_CHANNELS.SYSTEM_PING, async () => {
    logger.debug('Ping received')
    return createSuccessResult({
      pong: true,
      timestamp: Date.now()
    })
  })

  // System info handler
  ipcMain.handle(IPC_CHANNELS.SYSTEM_INFO, async () => {
    logger.debug('System info requested')

    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node
    }

    return createSuccessResult(systemInfo)
  })

  logger.info('System IPC handlers registered')
}
