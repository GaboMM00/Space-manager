/**
 * Application Executor
 * Launches native applications
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import { spawn } from 'child_process'
import * as path from 'path'
import type { Resource } from '../../workspace/types/workspace.types'
import type { ValidationResult } from '../types/execution.types'
import { BaseExecutor } from './BaseExecutor'

/**
 * Executor for launching native applications
 */
export class ApplicationExecutor extends BaseExecutor {
  getType(): string {
    return 'application'
  }

  async execute(resource: Resource): Promise<void> {
    const appPath = resource.path
    const args = resource.args || []
    const workingDir = resource.workingDirectory

    this.logger.info(`Launching application: ${resource.name}`, {
      path: appPath,
      args,
      workingDir
    })

    try {
      // Spawn the application process
      const childProcess = spawn(appPath, args, {
        cwd: workingDir,
        detached: true,
        stdio: 'ignore',
        shell: false
      })

      // Unref to allow parent process to exit independently
      childProcess.unref()

      this.logger.info(`Application launched successfully: ${resource.name}`, {
        pid: childProcess.pid
      })
    } catch (error) {
      this.logger.error(`Failed to launch application: ${resource.name}`, { error })
      throw new Error(`Failed to launch application: ${(error as Error).message}`)
    }
  }

  async validate(resource: Resource): Promise<ValidationResult> {
    // Check resource type
    const typeCheck = this.validateResourceType(resource, 'application')
    if (!typeCheck.valid) {
      return typeCheck
    }

    // Check if path is provided
    if (!resource.path || resource.path.trim() === '') {
      return {
        valid: false,
        error: 'Application path is required'
      }
    }

    // Check if application exists
    const pathCheck = await this.validatePathExists(resource.path)
    if (!pathCheck.valid) {
      return pathCheck
    }

    // Check if working directory exists (if provided)
    if (resource.workingDirectory) {
      const workingDirCheck = await this.validatePathExists(resource.workingDirectory)
      if (!workingDirCheck.valid) {
        return {
          valid: false,
          error: `Working directory does not exist: ${resource.workingDirectory}`,
          warnings: ['Application will be launched without a working directory']
        }
      }
    }

    return { valid: true }
  }

  canExecute(resource: Resource): boolean {
    if (resource.type !== 'application') {
      return false
    }

    const ext = path.extname(resource.path).toLowerCase()
    const platform = process.platform

    // Windows
    if (platform === 'win32') {
      return ['.exe', '.bat', '.cmd', '.com', '.msi'].includes(ext) || ext === ''
    }

    // macOS
    if (platform === 'darwin') {
      return ['.app', ''].includes(ext) || resource.path.startsWith('/Applications/')
    }

    // Linux and others
    return true
  }

  /**
   * Check if application requires elevated permissions
   * This is a heuristic check and may not be 100% accurate
   * TODO: Use this method in future enhancement for privilege detection
   */
  // private requiresElevation(appPath: string): boolean {
  //   const lowerPath = appPath.toLowerCase()

  //   // Common paths that typically require elevation
  //   const elevatedPaths = [
  //     'program files',
  //     'system32',
  //     'windows',
  //     '/usr/bin',
  //     '/usr/sbin',
  //     '/sbin'
  //   ]

  //   return elevatedPaths.some((p) => lowerPath.includes(p))
  // }
}
