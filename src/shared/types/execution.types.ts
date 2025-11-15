/**
 * Tipos relacionados con la ejecución de espacios
 */

import { Resource } from './space.types';

/**
 * Estado de ejecución
 */
export type ExecutionStatus =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Resultado de ejecución de recurso
 */
export interface ResourceExecutionResult {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  success: boolean;
  error?: string;
  startTime: number;
  endTime: number;
  durationMs: number;
}

/**
 * Contexto de ejecución
 */
export interface ExecutionContext {
  spaceId: string;
  spaceName: string;
  startTime: number;
  resources: Resource[];
  totalResources: number;
  processedResources: number;
}

/**
 * Resultado de ejecución de espacio
 */
export interface ExecutionResult {
  spaceId: string;
  success: boolean;
  startTime: number;
  endTime: number;
  durationMs: number;
  resourcesTotal: number;
  resourcesSuccess: number;
  resourcesFailed: number;
  results: ResourceExecutionResult[];
  error?: string;
}

/**
 * Progreso de ejecución
 */
export interface ExecutionProgress {
  spaceId: string;
  status: ExecutionStatus;
  progress: number; // 0-100
  currentResource?: string;
  totalResources: number;
  completedResources: number;
  failedResources: number;
}

/**
 * Opciones de ejecución
 */
export interface ExecutionOptions {
  continueOnError?: boolean;
  parallel?: boolean;
  maxParallel?: number;
  timeout?: number;
  dryRun?: boolean;
}
