/**
 * Space Validator
 * Business logic validation for spaces and resources
 */

import {
  Resource,
  CreateSpaceDto,
  UpdateSpaceDto,
  CreateResourceDto,
  SpaceValidationResult,
  ResourceValidationResult,
  SpaceValidationError,
  ResourceValidationError
} from '../types/workspace.types'

/**
 * Validate space name
 */
export function validateSpaceName(name: string): SpaceValidationError | null {
  // Check if empty
  if (!name || name.trim().length === 0) {
    return {
      field: 'name',
      message: 'Space name is required',
      value: name
    }
  }

  // Check length
  if (name.length > 100) {
    return {
      field: 'name',
      message: 'Space name cannot exceed 100 characters',
      value: name
    }
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return {
      field: 'name',
      message: 'Space name cannot contain special characters: < > : " / \\ | ? *',
      value: name
    }
  }

  return null
}

/**
 * Validate space description
 */
export function validateSpaceDescription(description?: string): SpaceValidationError | null {
  if (!description) return null

  if (description.length > 500) {
    return {
      field: 'description',
      message: 'Description cannot exceed 500 characters',
      value: description
    }
  }

  return null
}

/**
 * Validate space color
 */
export function validateSpaceColor(color?: string): SpaceValidationError | null {
  if (!color) return null

  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (!hexColorRegex.test(color)) {
    return {
      field: 'color',
      message: 'Color must be a valid hex code (#RRGGBB or #RGB)',
      value: color
    }
  }

  return null
}

/**
 * Validate resource path
 */
export function validateResourcePath(path: string, type: string): ResourceValidationError | null {
  if (!path || path.trim().length === 0) {
    return {
      field: 'path',
      message: 'Resource path is required',
      value: path
    }
  }

  // URL validation
  if (type === 'url') {
    try {
      const url = new URL(path)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return {
          field: 'path',
          message: 'URL must use http or https protocol',
          value: path
        }
      }
    } catch {
      return {
        field: 'path',
        message: 'Invalid URL format',
        value: path
      }
    }
  }

  return null
}

/**
 * Validate resource name
 */
export function validateResourceName(name: string): ResourceValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: 'name',
      message: 'Resource name is required',
      value: name
    }
  }

  if (name.length > 100) {
    return {
      field: 'name',
      message: 'Resource name cannot exceed 100 characters',
      value: name
    }
  }

  return null
}

/**
 * Validate entire space for creation
 */
export function validateCreateSpace(data: CreateSpaceDto): SpaceValidationResult {
  const errors: SpaceValidationError[] = []

  // Validate name
  const nameError = validateSpaceName(data.name)
  if (nameError) errors.push(nameError)

  // Validate description
  const descriptionError = validateSpaceDescription(data.description)
  if (descriptionError) errors.push(descriptionError)

  // Validate color
  const colorError = validateSpaceColor(data.color)
  if (colorError) errors.push(colorError)

  // Validate execution order
  if (!['sequential', 'parallel'].includes(data.executionOrder)) {
    errors.push({
      field: 'executionOrder',
      message: 'Execution order must be "sequential" or "parallel"',
      value: data.executionOrder
    })
  }

  // Validate resources
  if (data.resources && data.resources.length > 0) {
    data.resources.forEach((resource, index) => {
      const resourceErrors = validateResource(resource as any)
      resourceErrors.errors.forEach((error) => {
        errors.push({
          field: `resources[${index}].${error.field}`,
          message: error.message,
          value: error.value
        })
      })
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate space for update
 */
export function validateUpdateSpace(data: UpdateSpaceDto): SpaceValidationResult {
  const errors: SpaceValidationError[] = []

  // Validate name if provided
  if (data.name !== undefined) {
    const nameError = validateSpaceName(data.name)
    if (nameError) errors.push(nameError)
  }

  // Validate description if provided
  if (data.description !== undefined) {
    const descriptionError = validateSpaceDescription(data.description)
    if (descriptionError) errors.push(descriptionError)
  }

  // Validate color if provided
  if (data.color !== undefined) {
    const colorError = validateSpaceColor(data.color)
    if (colorError) errors.push(colorError)
  }

  // Validate execution order if provided
  if (data.executionOrder !== undefined && !['sequential', 'parallel'].includes(data.executionOrder)) {
    errors.push({
      field: 'executionOrder',
      message: 'Execution order must be "sequential" or "parallel"',
      value: data.executionOrder
    })
  }

  // Validate resources if provided
  if (data.resources && data.resources.length > 0) {
    data.resources.forEach((resource, index) => {
      const resourceErrors = validateResource(resource)
      resourceErrors.errors.forEach((error) => {
        errors.push({
          field: `resources[${index}].${error.field}`,
          message: error.message,
          value: error.value
        })
      })
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate resource
 */
export function validateResource(data: CreateResourceDto | Resource): ResourceValidationResult {
  const errors: ResourceValidationError[] = []

  // Validate type
  if (!['application', 'url', 'file', 'script'].includes(data.type)) {
    errors.push({
      field: 'type',
      message: 'Resource type must be one of: application, url, file, script',
      value: data.type
    })
  }

  // Validate name
  const nameError = validateResourceName(data.name)
  if (nameError) errors.push(nameError)

  // Validate path
  const pathError = validateResourcePath(data.path, data.type)
  if (pathError) errors.push(pathError)

  // Validate order
  if (data.order !== undefined && (data.order < 0 || !Number.isInteger(data.order))) {
    errors.push({
      field: 'order',
      message: 'Order must be a non-negative integer',
      value: data.order
    })
  }

  // Validate retry count
  if (data.retryCount !== undefined) {
    if (data.retryCount < 0 || data.retryCount > 10 || !Number.isInteger(data.retryCount)) {
      errors.push({
        field: 'retryCount',
        message: 'Retry count must be an integer between 0 and 10',
        value: data.retryCount
      })
    }
  }

  // Validate timeout
  if (data.timeout !== undefined && (data.timeout < 0 || !Number.isInteger(data.timeout))) {
    errors.push({
      field: 'timeout',
      message: 'Timeout must be a non-negative integer (milliseconds)',
      value: data.timeout
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize space name
 */
export function sanitizeSpaceName(name: string): string {
  return name.trim().replace(/[<>:"/\\|?*]/g, '')
}

/**
 * Sanitize description
 */
export function sanitizeDescription(description: string): string {
  return description.trim().substring(0, 500)
}
