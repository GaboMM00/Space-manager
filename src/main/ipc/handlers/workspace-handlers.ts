/**
 * Workspace IPC Handlers
 * Handles IPC communication for workspace module
 */

import { ipcMain, createSuccessResult, createErrorResult } from '../ipc-main'
import { IPC_CHANNELS } from '../../../shared/types/ipc.types'
import { Result } from '../../../shared/types/common.types'
import { Space, SpaceExport } from '../../../modules/workspace/types/workspace.types'
import { getFileSystemService } from '../../services/FileSystemService'
import { createBackupService } from '../../services/BackupService'
import { createEventBus } from '../../../shared/utils/event-bus'
import { createSpaceService } from '../../../modules/workspace/services/SpaceService'
import { logger } from '../../../shared/utils/logger'

/**
 * Initialize services
 */
const fileSystem = getFileSystemService()
const backupService = createBackupService(fileSystem)
const eventBus = createEventBus()
const spaceService = createSpaceService(fileSystem, backupService, eventBus)

/**
 * Register all workspace-related IPC handlers
 */
export function registerWorkspaceHandlers(): void {
  logger.info('Registering workspace IPC handlers')

  // CREATE Space
  ipcMain.handle(IPC_CHANNELS.SPACES_CREATE, async (_event, data): Promise<Result<Space>> => {
    logger.debug('Handling SPACES_CREATE', { name: data.name })
    const result = await spaceService.createSpace(data)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Space>(result.error || 'Failed to create space', result.code)
  })

  // UPDATE Space
  ipcMain.handle(IPC_CHANNELS.SPACES_UPDATE, async (_event, id, updates): Promise<Result<Space>> => {
    logger.debug('Handling SPACES_UPDATE', { id })
    const result = await spaceService.updateSpace(id, updates)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Space>(result.error || 'Failed to update space', result.code)
  })

  // DELETE Space
  ipcMain.handle(IPC_CHANNELS.SPACES_DELETE, async (_event, id) => {
    logger.debug('Handling SPACES_DELETE', { id })
    const result = await spaceService.deleteSpace(id)
    if (result.success) {
      return createSuccessResult(undefined)
    }
    return createErrorResult(result.error || 'Failed to delete space')
  })

  // GET Space by ID
  ipcMain.handle(IPC_CHANNELS.SPACES_GET, async (_event, id): Promise<Result<Space>> => {
    logger.debug('Handling SPACES_GET', { id })
    const result = await spaceService.getSpaceById(id)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Space>(result.error || 'Space not found')
  })

  // LIST Spaces
  ipcMain.handle(IPC_CHANNELS.SPACES_LIST, async (_event, sortOptions) => {
    logger.debug('Handling SPACES_LIST')
    const spaces = await spaceService.getAllSpaces(sortOptions)
    return createSuccessResult(spaces)
  })

  // DUPLICATE Space
  ipcMain.handle(IPC_CHANNELS.SPACES_DUPLICATE, async (_event, id, newName): Promise<Result<Space>> => {
    logger.debug('Handling SPACES_DUPLICATE', { id, newName })
    const result = await spaceService.duplicateSpace(id, newName)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Space>(result.error || 'Failed to duplicate space')
  })

  // SEARCH Spaces
  ipcMain.handle(IPC_CHANNELS.SPACES_SEARCH, async (_event, filters) => {
    logger.debug('Handling SPACES_SEARCH', { filters })
    const spaces = await spaceService.searchSpaces(filters)
    return createSuccessResult(spaces)
  })

  // GET Statistics
  ipcMain.handle(IPC_CHANNELS.SPACES_STATS, async () => {
    logger.debug('Handling SPACES_STATS')
    const stats = await spaceService.getStatistics()
    return createSuccessResult(stats)
  })

  // EXPORT Space
  ipcMain.handle(IPC_CHANNELS.SPACES_EXPORT, async (_event, id): Promise<Result<SpaceExport>> => {
    logger.debug('Handling SPACES_EXPORT', { id })
    const result = await spaceService.exportSpace(id)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<SpaceExport>(result.error || 'Failed to export space')
  })

  // IMPORT Space
  ipcMain.handle(IPC_CHANNELS.SPACES_IMPORT, async (_event, exportData): Promise<Result<Space>> => {
    logger.debug('Handling SPACES_IMPORT')
    const result = await spaceService.importSpace(exportData)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Space>(result.error || 'Failed to import space')
  })

  // ADD Resource to Space
  ipcMain.handle(IPC_CHANNELS.SPACES_ADD_RESOURCE, async (_event, spaceId, resource): Promise<Result<Space>> => {
    logger.debug('Handling SPACES_ADD_RESOURCE', { spaceId, resourceName: resource.name })
    const result = await spaceService.addResource(spaceId, resource)
    if (result.success && result.data) {
      return createSuccessResult(result.data)
    }
    return createErrorResult<Space>(result.error || 'Failed to add resource', result.code)
  })

  // GET All Tags
  ipcMain.handle(IPC_CHANNELS.SPACES_GET_TAGS, async () => {
    logger.debug('Handling SPACES_GET_TAGS')
    const tags = await spaceService.getAllTags()
    return createSuccessResult(tags)
  })

  logger.info('Workspace IPC handlers registered successfully')
}
