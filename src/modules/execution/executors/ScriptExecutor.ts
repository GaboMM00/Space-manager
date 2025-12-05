/**
 * Script Executor
 * Executes scripts (PowerShell, Bash, Python, etc.)
 * Phase 1 Sprint 1.4 - Execution Engine
 */

import { spawn } from 'child_process'
import * as path from 'path'
import type { Resource } from '../../workspace/types/workspace.types'
import type { ValidationResult } from '../types/execution.types'
import { BaseExecutor } from './BaseExecutor'

/**
 * Supported script interpreters
 */
type ScriptInterpreter =
  | 'powershell'
  | 'bash'
  | 'cmd'
  | 'python'
  | 'node'
  | 'ruby'
  | 'perl'
  | 'php'

/**
 * Executor for running scripts
 */
export class ScriptExecutor extends BaseExecutor {
  getType(): string {
    return 'script'
  }

  async execute(resource: Resource): Promise<void> {
    const scriptPath = resource.path
    const args = resource.args || []
    const workingDir = resource.workingDirectory || path.dirname(scriptPath)

    // Detect interpreter from file extension if not specified
    const interpreter = this.detectInterpreter(scriptPath)

    this.logger.info(`Executing script: ${resource.name}`, {
      path: scriptPath,
      interpreter,
      args,
      workingDir
    })

    try {
      const command = this.getInterpreterCommand(interpreter)
      const fullArgs = [scriptPath, ...args]

      const childProcess = spawn(command, fullArgs, {
        cwd: workingDir,
        detached: true,
        stdio: 'pipe',
        shell: false
      })

      // Log stdout for debugging
      childProcess.stdout.on('data', (data) => {
        this.logger.debug(`[Script ${resource.name}] stdout:`, data.toString())
      })

      // Log stderr for debugging
      childProcess.stderr.on('data', (data) => {
        this.logger.warn(`[Script ${resource.name}] stderr:`, data.toString())
      })

      // Unref to allow parent process to exit independently
      childProcess.unref()

      this.logger.info(`Script started successfully: ${resource.name}`, {
        pid: childProcess.pid
      })
    } catch (error) {
      this.logger.error(`Failed to execute script: ${resource.name}`, { error })
      throw new Error(`Failed to execute script: ${(error as Error).message}`)
    }
  }

  async validate(resource: Resource): Promise<ValidationResult> {
    // Check resource type
    const typeCheck = this.validateResourceType(resource, 'script')
    if (!typeCheck.valid) {
      return typeCheck
    }

    // Check if path is provided
    if (!resource.path || resource.path.trim() === '') {
      return {
        valid: false,
        error: 'Script path is required'
      }
    }

    // Check if script exists
    const pathCheck = await this.validatePathExists(resource.path)
    if (!pathCheck.valid) {
      return pathCheck
    }

    // Validate interpreter is available
    const interpreter = this.detectInterpreter(resource.path)
    const interpreterAvailable = await this.isInterpreterAvailable(interpreter)

    if (!interpreterAvailable) {
      return {
        valid: false,
        error: `Interpreter '${interpreter}' is not available on this system`,
        warnings: ['Please install the required interpreter to execute this script']
      }
    }

    return { valid: true }
  }

  canExecute(resource: Resource): boolean {
    if (resource.type !== 'script') {
      return false
    }

    const interpreter = this.detectInterpreter(resource.path)
    const platform = process.platform

    // Check platform-specific interpreter support
    if (interpreter === 'powershell' && platform !== 'win32') {
      // PowerShell Core is cross-platform, but we'll be conservative
      return false
    }

    if (interpreter === 'cmd' && platform !== 'win32') {
      return false
    }

    if (interpreter === 'bash' && platform === 'win32') {
      // Bash might be available via WSL or Git Bash, but we'll be conservative
      return false
    }

    return true
  }

  /**
   * Detect interpreter based on file extension
   */
  private detectInterpreter(scriptPath: string): ScriptInterpreter {
    const ext = path.extname(scriptPath).toLowerCase()

    const interpreterMap: Record<string, ScriptInterpreter> = {
      '.ps1': 'powershell',
      '.sh': 'bash',
      '.bash': 'bash',
      '.cmd': 'cmd',
      '.bat': 'cmd',
      '.py': 'python',
      '.js': 'node',
      '.mjs': 'node',
      '.rb': 'ruby',
      '.pl': 'perl',
      '.php': 'php'
    }

    return interpreterMap[ext] || 'bash'
  }

  /**
   * Get command to execute interpreter
   */
  private getInterpreterCommand(interpreter: ScriptInterpreter): string {
    const platform = process.platform

    const commands: Record<ScriptInterpreter, string> = {
      powershell: platform === 'win32' ? 'powershell.exe' : 'pwsh',
      bash: platform === 'win32' ? 'bash.exe' : '/bin/bash',
      cmd: 'cmd.exe',
      python: platform === 'win32' ? 'python.exe' : 'python3',
      node: platform === 'win32' ? 'node.exe' : 'node',
      ruby: platform === 'win32' ? 'ruby.exe' : 'ruby',
      perl: platform === 'win32' ? 'perl.exe' : 'perl',
      php: platform === 'win32' ? 'php.exe' : 'php'
    }

    return commands[interpreter] || 'bash'
  }

  /**
   * Check if interpreter is available on the system
   */
  private async isInterpreterAvailable(interpreter: ScriptInterpreter): Promise<boolean> {
    return new Promise((resolve) => {
      const command = this.getInterpreterCommand(interpreter)
      const testProcess = spawn(command, ['--version'], {
        stdio: 'ignore'
      })

      testProcess.on('error', () => {
        resolve(false)
      })

      testProcess.on('close', (code) => {
        resolve(code === 0)
      })

      // Timeout after 2 seconds
      setTimeout(() => {
        testProcess.kill()
        resolve(false)
      }, 2000)
    })
  }
}
