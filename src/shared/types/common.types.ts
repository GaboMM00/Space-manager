/**
 * Tipos comunes compartidos en toda la aplicación
 */

/**
 * Respuesta estándar de API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorDetail;
}

/**
 * Detalle de error
 */
export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

/**
 * Estado de carga
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Filtros comunes
 */
export interface BaseFilters {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Timestamps base para entidades
 */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

/**
 * Entidad base con ID
 */
export interface BaseEntity extends Timestamps {
  id: string;
}
