/**
 * URL Executor
 * Opens URLs in default or specified browser
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import { shell } from 'electron'
import type { Resource } from '../../workspace/types/workspace.types'
import type { ValidationResult } from '../types/execution.types'
import { BaseExecutor } from './BaseExecutor'

/**
 * Executor for opening URLs in browser
 */
export class URLExecutor extends BaseExecutor {
  getType(): string {
    return 'url'
  }

  async execute(resource: Resource): Promise<void> {
    const url = resource.path

    this.logger.info(`Opening URL: ${resource.name}`, { url })

    try {
      // Use Electron's shell.openExternal for cross-platform URL opening
      await shell.openExternal(url)

      this.logger.info(`URL opened successfully: ${resource.name}`)
    } catch (error) {
      this.logger.error(`Failed to open URL: ${resource.name}`, { error })
      throw new Error(`Failed to open URL: ${(error as Error).message}`)
    }
  }

  async validate(resource: Resource): Promise<ValidationResult> {
    // Check resource type
    const typeCheck = this.validateResourceType(resource, 'url')
    if (!typeCheck.valid) {
      return typeCheck
    }

    // Check if URL is provided
    if (!resource.path || resource.path.trim() === '') {
      return {
        valid: false,
        error: 'URL is required'
      }
    }

    // Validate URL format
    return this.validateURL(resource.path)
  }

  canExecute(resource: Resource): boolean {
    // URLs can be executed on any platform
    return resource.type === 'url'
  }

  // TODO: Future enhancement - browser selection in UI
  // private async openInSpecificBrowser(...) { }
  // private getBrowserPaths(...) { }
  // private getBrowserArgs(...) { }
}
