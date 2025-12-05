/**
 * File Executor
 * Opens files with their default or specified application
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import { shell } from 'electron'
import { spawn } from 'child_process'
// import * as path from 'path' // TODO: Will be needed for file type detection
import type { Resource } from '../../workspace/types/workspace.types'
import type { ValidationResult } from '../types/execution.types'
import { BaseExecutor } from './BaseExecutor'

/**
 * Executor for opening files
 */
export class FileExecutor extends BaseExecutor {
  getType(): string {
    return 'file'
  }

  async execute(resource: Resource): Promise<void> {
    const filePath = resource.path

    this.logger.info(`Opening file: ${resource.name}`, { path: filePath })

    try {
      // If a specific application is specified in args, use it
      if (resource.args && resource.args.length > 0) {
        const appPath = resource.args[0]
        await this.openWithApplication(filePath, appPath)
      } else {
        // Otherwise use default application
        await this.openWithDefaultApp(filePath)
      }

      this.logger.info(`File opened successfully: ${resource.name}`)
    } catch (error) {
      this.logger.error(`Failed to open file: ${resource.name}`, { error })
      throw new Error(`Failed to open file: ${(error as Error).message}`)
    }
  }

  async validate(resource: Resource): Promise<ValidationResult> {
    // Check resource type
    const typeCheck = this.validateResourceType(resource, 'file')
    if (!typeCheck.valid) {
      return typeCheck
    }

    // Check if path is provided
    if (!resource.path || resource.path.trim() === '') {
      return {
        valid: false,
        error: 'File path is required'
      }
    }

    // Check if file exists
    const pathCheck = await this.validatePathExists(resource.path)
    if (!pathCheck.valid) {
      return pathCheck
    }

    // If specific application is provided, check if it exists
    if (resource.args && resource.args.length > 0) {
      const appPath = resource.args[0]
      const appCheck = await this.validatePathExists(appPath)
      if (!appCheck.valid) {
        return {
          valid: false,
          error: `Specified application not found: ${appPath}`,
          warnings: ['File will be opened with default application instead']
        }
      }
    }

    return { valid: true }
  }

  canExecute(resource: Resource): boolean {
    // Files can be opened on any platform
    return resource.type === 'file'
  }

  /**
   * Open file with system default application
   */
  private async openWithDefaultApp(filePath: string): Promise<void> {
    try {
      // Use Electron's shell.openPath for cross-platform file opening
      const result = await shell.openPath(filePath)

      // If result is not empty, it means there was an error
      if (result) {
        throw new Error(result)
      }
    } catch (error) {
      this.logger.error('Failed to open file with default application', { error, filePath })
      throw error
    }
  }

  /**
   * Open file with a specific application
   */
  private async openWithApplication(filePath: string, appPath: string): Promise<void> {
    const platform = process.platform

    try {
      if (platform === 'win32') {
        // Windows: Use start command
        spawn('cmd', ['/c', 'start', '', appPath, filePath], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      } else if (platform === 'darwin') {
        // macOS: Use open command
        spawn('open', ['-a', appPath, filePath], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      } else {
        // Linux: Direct execution
        spawn(appPath, [filePath], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      }
    } catch (error) {
      this.logger.error('Failed to open file with specified application', {
        error,
        filePath,
        appPath
      })
      throw error
    }
  }

  /**
   * Get file extension
   * TODO: Use for future file type detection
   */
  // private getFileExtension(filePath: string): string {
  //   return path.extname(filePath).toLowerCase()
  // }

  /**
   * Check if file is a document
   * TODO: Use for future file type handling
   */
  // private isDocument(filePath: string): boolean {
  //   const docExtensions = [
  //     '.pdf',
  //     '.doc',
  //     '.docx',
  //     '.xls',
  //     '.xlsx',
  //     '.ppt',
  //     '.pptx',
  //     '.txt',
  //     '.rtf',
  //     '.odt',
  //     '.ods',
  //     '.odp'
  //   ]
  //   return docExtensions.includes(this.getFileExtension(filePath))
  // }

  /**
   * Check if file is an image
   * TODO: Use for future file type handling
   */
  // private isImage(filePath: string): boolean {
  //   const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp', '.ico']
  //   return imageExtensions.includes(this.getFileExtension(filePath))
  // }

  /**
   * Check if file is a video
   * TODO: Use for future file type handling
   */
  // private isVideo(filePath: string): boolean {
  //   const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm']
  //   return videoExtensions.includes(this.getFileExtension(filePath))
  // }

  /**
   * Check if file is audio
   * TODO: Use for future file type handling
   */
  // private isAudio(filePath: string): boolean {
  //   const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a']
  //   return audioExtensions.includes(this.getFileExtension(filePath))
  // }
}
