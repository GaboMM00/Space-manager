/**
 * Tipos relacionados con Espacios de Trabajo
 */

import { BaseEntity } from './common.types';

/**
 * Tipo de recurso
 */
export type ResourceType = 'application' | 'url' | 'script' | 'file';

/**
 * Recurso base
 */
export interface BaseResource {
  id: string;
  name: string;
  type: ResourceType;
  enabled: boolean;
  order: number;
  delay?: number; // Delay en ms antes de ejecutar
}

/**
 * Recurso de aplicación
 */
export interface ApplicationResource extends BaseResource {
  type: 'application';
  path: string;
  arguments?: string[];
  workingDirectory?: string;
  runAsAdmin?: boolean;
}

/**
 * Recurso de URL
 */
export interface URLResource extends BaseResource {
  type: 'url';
  url: string;
  browser?: string;
  incognito?: boolean;
}

/**
 * Recurso de script
 */
export interface ScriptResource extends BaseResource {
  type: 'script';
  path: string;
  interpreter: 'powershell' | 'bash' | 'python';
  arguments?: string[];
}

/**
 * Recurso de archivo
 */
export interface FileResource extends BaseResource {
  type: 'file';
  path: string;
  application?: string;
}

/**
 * Unión de todos los tipos de recursos
 */
export type Resource =
  | ApplicationResource
  | URLResource
  | ScriptResource
  | FileResource;

/**
 * Metadatos del espacio
 */
export interface SpaceMetadata {
  author?: string;
  version?: string;
  isTemplate?: boolean;
  isShared?: boolean;
}

/**
 * Espacio de trabajo
 */
export interface Space extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  tags?: string[];
  resources: Resource[];
  lastExecutedAt?: string;
  metadata?: SpaceMetadata;
}

/**
 * DTO para crear espacio
 */
export interface CreateSpaceDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  tags?: string[];
}

/**
 * DTO para actualizar espacio
 */
export interface UpdateSpaceDto {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  tags?: string[];
}

/**
 * Filtros de espacios
 */
export interface SpaceFilters {
  search?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}
