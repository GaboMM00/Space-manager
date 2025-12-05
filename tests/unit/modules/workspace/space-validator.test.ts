/**
 * Space Validator Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  validateSpaceName,
  validateSpaceDescription,
  validateSpaceColor,
  validateResourceName,
  validateResourcePath,
  validateCreateSpace,
  validateUpdateSpace,
  validateResource,
  sanitizeSpaceName,
  sanitizeDescription
} from '../../../../src/modules/workspace/validators/space-validator'
import type { CreateSpaceDto, CreateResourceDto, UpdateSpaceDto } from '../../../../src/modules/workspace/types/workspace.types'

describe('Space Validators', () => {
  describe('validateSpaceName', () => {
    it('should accept valid space name', () => {
      const result = validateSpaceName('Valid Space Name')
      expect(result).toBeNull()
    })

    it('should reject empty name', () => {
      const result = validateSpaceName('')
      expect(result).not.toBeNull()
      expect(result?.message).toContain('required')
    })

    it('should reject name with only whitespace', () => {
      const result = validateSpaceName('   ')
      expect(result).not.toBeNull()
      expect(result?.message).toContain('required')
    })

    it('should reject name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101)
      const result = validateSpaceName(longName)
      expect(result).not.toBeNull()
      expect(result?.message).toContain('cannot exceed 100 characters')
    })

    it('should reject name with invalid characters', () => {
      const invalidNames = ['Name/with/slash', 'Name<with>brackets', 'Name:colon', 'Name|pipe', 'Name?question']

      invalidNames.forEach(name => {
        const result = validateSpaceName(name)
        expect(result).not.toBeNull()
        expect(result?.message).toContain('special characters')
      })
    })

    it('should accept name with valid special characters', () => {
      const result = validateSpaceName('Space - Name (v2) #1')
      expect(result).toBeNull()
    })
  })

  describe('validateSpaceDescription', () => {
    it('should accept valid description', () => {
      const result = validateSpaceDescription('A valid description')
      expect(result).toBeNull()
    })

    it('should accept undefined description', () => {
      const result = validateSpaceDescription(undefined)
      expect(result).toBeNull()
    })

    it('should accept empty description', () => {
      const result = validateSpaceDescription('')
      expect(result).toBeNull()
    })

    it('should reject description exceeding 500 characters', () => {
      const longDesc = 'a'.repeat(501)
      const result = validateSpaceDescription(longDesc)
      expect(result).not.toBeNull()
      expect(result?.message).toContain('cannot exceed 500 characters')
    })
  })

  describe('validateSpaceColor', () => {
    it('should accept valid hex color', () => {
      const validColors = ['#FF5733', '#00FF00', '#123456', '#ABCDEF']

      validColors.forEach(color => {
        const result = validateSpaceColor(color)
        expect(result).toBeNull()
      })
    })

    it('should accept undefined color', () => {
      const result = validateSpaceColor(undefined)
      expect(result).toBeNull()
    })

    it('should reject invalid hex color format', () => {
      const invalidColors = ['#GG5733', '#12345', '#1234567', 'FF5733', 'red']

      invalidColors.forEach(color => {
        const result = validateSpaceColor(color)
        expect(result).not.toBeNull()
        expect(result?.message).toContain('valid hex code')
      })
    })
  })

  describe('validateResourceName', () => {
    it('should accept valid resource name', () => {
      const result = validateResourceName('Valid Resource')
      expect(result).toBeNull()
    })

    it('should reject empty name', () => {
      const result = validateResourceName('')
      expect(result).not.toBeNull()
      expect(result?.message).toContain('required')
    })

    it('should reject name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101)
      const result = validateResourceName(longName)
      expect(result).not.toBeNull()
      expect(result?.message).toContain('cannot exceed 100 characters')
    })
  })

  describe('validateResourcePath', () => {
    it('should accept valid file paths for application type', () => {
      const validPaths = [
        '/usr/bin/code',
        'C:\\Program Files\\app.exe',
        './relative/path',
        'file.txt'
      ]

      validPaths.forEach(path => {
        const result = validateResourcePath(path, 'application')
        expect(result).toBeNull()
      })
    })

    it('should accept valid URLs for url type', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000'
      ]

      validUrls.forEach(url => {
        const result = validateResourcePath(url, 'url')
        expect(result).toBeNull()
      })
    })

    it('should reject empty path', () => {
      const result = validateResourcePath('', 'application')
      expect(result).not.toBeNull()
      expect(result?.message).toContain('required')
    })

    it('should reject invalid URL protocol', () => {
      const result = validateResourcePath('ftp://example.com', 'url')
      expect(result).not.toBeNull()
      expect(result?.message).toContain('http or https')
    })
  })

  describe('validateCreateSpace', () => {
    const validDto: CreateSpaceDto = {
      name: 'Test Space',
      description: 'Test description',
      icon: 'icon-test',
      color: '#FF5733',
      resources: [],
      executionOrder: 'sequential',
      autoExecute: false,
      tags: ['test']
    }

    it('should accept valid create space DTO', () => {
      const result = validateCreateSpace(validDto)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid space name', () => {
      const invalidDto: CreateSpaceDto = {
        ...validDto,
        name: 'Invalid/Name'
      }

      const result = validateCreateSpace(invalidDto)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].field).toBe('name')
    })

    it('should reject invalid description', () => {
      const invalidDto: CreateSpaceDto = {
        ...validDto,
        description: 'a'.repeat(501)
      }

      const result = validateCreateSpace(invalidDto)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'description')).toBe(true)
    })

    it('should reject invalid color', () => {
      const invalidDto: CreateSpaceDto = {
        ...validDto,
        color: 'invalid-color'
      }

      const result = validateCreateSpace(invalidDto)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'color')).toBe(true)
    })

    it('should validate resources in the DTO', () => {
      const invalidDto: CreateSpaceDto = {
        ...validDto,
        resources: [
          {
            type: 'url',
            name: '',
            path: '',
            enabled: true,
            order: 0
          }
        ]
      }

      const result = validateCreateSpace(invalidDto)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field.includes('resources[0]'))).toBe(true)
    })

    it('should accumulate multiple validation errors', () => {
      const invalidDto: CreateSpaceDto = {
        ...validDto,
        name: '',
        description: 'a'.repeat(501),
        color: 'invalid'
      }

      const result = validateCreateSpace(invalidDto)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(2)
    })
  })

  describe('validateUpdateSpace', () => {
    it('should accept valid update DTO with partial fields', () => {
      const updateDto: UpdateSpaceDto = {
        name: 'Updated Name'
      }

      const result = validateUpdateSpace(updateDto)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept empty update DTO', () => {
      const updateDto: UpdateSpaceDto = {}

      const result = validateUpdateSpace(updateDto)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid name when provided', () => {
      const updateDto: UpdateSpaceDto = {
        name: 'Invalid/Name'
      }

      const result = validateUpdateSpace(updateDto)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'name')).toBe(true)
    })

    it('should reject invalid description when provided', () => {
      const updateDto: UpdateSpaceDto = {
        description: 'a'.repeat(501)
      }

      const result = validateUpdateSpace(updateDto)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'description')).toBe(true)
    })

    it('should reject invalid color when provided', () => {
      const updateDto: UpdateSpaceDto = {
        color: 'not-a-color'
      }

      const result = validateUpdateSpace(updateDto)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'color')).toBe(true)
    })
  })

  describe('validateResource', () => {
    const validResource: CreateResourceDto = {
      type: 'application',
      name: 'VS Code',
      path: '/usr/bin/code',
      enabled: true,
      order: 0
    }

    it('should accept valid resource', () => {
      const result = validateResource(validResource)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid resource name', () => {
      const invalidResource: CreateResourceDto = {
        ...validResource,
        name: ''
      }

      const result = validateResource(invalidResource)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'name')).toBe(true)
    })

    it('should reject invalid resource path', () => {
      const invalidResource: CreateResourceDto = {
        ...validResource,
        path: ''
      }

      const result = validateResource(invalidResource)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'path')).toBe(true)
    })

    it('should reject invalid order value', () => {
      const invalidResource: CreateResourceDto = {
        ...validResource,
        order: -1
      }

      const result = validateResource(invalidResource)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'order')).toBe(true)
    })

    it('should reject invalid retryCount', () => {
      const invalidResource: CreateResourceDto = {
        ...validResource,
        retryCount: -1
      }

      const result = validateResource(invalidResource)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'retryCount')).toBe(true)
    })

    it('should reject retryCount exceeding limit', () => {
      const invalidResource: CreateResourceDto = {
        ...validResource,
        retryCount: 11
      }

      const result = validateResource(invalidResource)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'retryCount')).toBe(true)
    })

    it('should reject invalid timeout', () => {
      const invalidResource: CreateResourceDto = {
        ...validResource,
        timeout: -1
      }

      const result = validateResource(invalidResource)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'timeout')).toBe(true)
    })

    it('should accept timeout within reasonable range', () => {
      const validResource: CreateResourceDto = {
        type: 'application',
        name: 'VS Code',
        path: '/usr/bin/code',
        enabled: true,
        order: 0,
        timeout: 60000
      }

      const result = validateResource(validResource)
      expect(result.valid).toBe(true)
    })

    it('should accept optional fields within valid ranges', () => {
      const resourceWithOptionals: CreateResourceDto = {
        ...validResource,
        retryCount: 3,
        timeout: 30000,
        args: ['--flag', 'value']
      }

      const result = validateResource(resourceWithOptionals)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('sanitizeSpaceName', () => {
    it('should trim whitespace', () => {
      const result = sanitizeSpaceName('  Space Name  ')
      expect(result).toBe('Space Name')
    })

    it('should preserve valid characters', () => {
      const result = sanitizeSpaceName('Valid-Name (v2) #1')
      expect(result).toBe('Valid-Name (v2) #1')
    })

    it('should remove invalid characters', () => {
      const result = sanitizeSpaceName('Space<Name>')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toBe('SpaceName')
    })
  })

  describe('sanitizeDescription', () => {
    it('should trim whitespace', () => {
      const result = sanitizeDescription('  Description  ')
      expect(result).toBe('Description')
    })

    it('should handle empty string', () => {
      const result = sanitizeDescription('')
      expect(result).toBe('')
    })

    it('should limit to 500 characters', () => {
      const longDesc = 'a'.repeat(600)
      const result = sanitizeDescription(longDesc)
      expect(result.length).toBe(500)
    })

    it('should preserve content within limit', () => {
      const desc = 'Test description with <html> and special chars & symbols'
      const result = sanitizeDescription(desc)
      expect(result).toBe(desc)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined values gracefully', () => {
      const result = validateCreateSpace({
        name: 'Test',
        resources: [],
        executionOrder: 'sequential'
      })
      expect(result.valid).toBe(true)
    })

    it('should handle null-like values', () => {
      const result = validateSpaceName(null as any)
      expect(result).not.toBeNull()
      expect(result?.message).toContain('required')
    })

    it('should handle resource with all optional fields', () => {
      const minimalResource: CreateResourceDto = {
        type: 'url',
        name: 'GitHub',
        path: 'https://github.com',
        enabled: true,
        order: 0
      }

      const result = validateResource(minimalResource)
      expect(result.valid).toBe(true)
    })

    it('should validate tags array', () => {
      const dtoWithTags: CreateSpaceDto = {
        name: 'Test',
        resources: [],
        executionOrder: 'sequential',
        tags: ['tag1', 'tag2', 'tag3']
      }

      const result = validateCreateSpace(dtoWithTags)
      expect(result.valid).toBe(true)
    })

    it('should handle very long resource name', () => {
      const resource: CreateResourceDto = {
        type: 'file',
        name: 'a'.repeat(101),
        path: '/path/to/file',
        enabled: true,
        order: 0
      }

      const result = validateResource(resource)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.field === 'name')).toBe(true)
    })
  })
})
