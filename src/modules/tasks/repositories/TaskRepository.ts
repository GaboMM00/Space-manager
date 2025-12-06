/**
 * Task Repository
 * Data access layer for tasks
 * Phase 3 Sprint 3.1 - Task Management System
 */

import { join } from 'path'
import { app } from 'electron'
import { BaseRepository } from '../../../main/services/DataStoreService'
import { FileSystemService } from '../../../main/services/FileSystemService'
import type { Task } from '../types/task.types'
import taskSchema from '../../../main/schemas/task.schema.json'

/**
 * Task Repository
 * Manages task data persistence
 */
export class TaskRepository extends BaseRepository<Task> {
  constructor(fileSystem: FileSystemService) {
    super(fileSystem, taskSchema)
  }

  /**
   * Get file path for tasks data store
   */
  protected getFilePath(): string {
    const userDataPath = app.getPath('userData')
    return join(userDataPath, 'tasks.json')
  }

  /**
   * Find tasks by space ID
   */
  async findBySpaceId(spaceId: string): Promise<Task[]> {
    const allTasks = await this.findAll()
    return allTasks.filter((task) => task.spaceId === spaceId)
  }

  /**
   * Find tasks by status
   */
  async findByStatus(status: string): Promise<Task[]> {
    const allTasks = await this.findAll()
    return allTasks.filter((task) => task.status === status)
  }
}
