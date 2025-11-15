/**
 * Utilidades de validación
 */

/**
 * Valida si una cadena es un UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida si una cadena es un email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si una URL es válida
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida si una fecha es válida
 */
export function isValidDate(date: string): boolean {
  const parsed = Date.parse(date);
  return !isNaN(parsed);
}

/**
 * Valida si un path de archivo existe y es válido
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }
  // Validación básica, más validación se puede hacer en el main process
  return path.trim().length > 0;
}

/**
 * Valida configuración de espacio
 */
export function validateSpaceConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (config.name && config.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (config.resources && !Array.isArray(config.resources)) {
    errors.push('Resources must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
