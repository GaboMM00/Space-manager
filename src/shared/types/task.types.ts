/**
 * Tipos relacionados con Tareas
 */

import { BaseEntity } from './common.types';

/**
 * Estado de la tarea
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Prioridad de la tarea
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Recordatorio
 */
export interface Reminder {
  id: string;
  dateTime: string;
  notified: boolean;
}

/**
 * Tarea
 */
export interface Task extends BaseEntity {
  spaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  subtasks?: Task[];
  reminders?: Reminder[];
  calendarEventId?: string;
}

/**
 * DTO para crear tarea
 */
export interface CreateTaskDto {
  spaceId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

/**
 * DTO para actualizar tarea
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
