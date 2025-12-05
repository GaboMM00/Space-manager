/**
 * useSpaceEditor Hook (ViewModel)
 * Manages space editor state and validation
 * Phase 2 Sprint 2.2 - Main Views
 */

import { useState, useEffect, useCallback } from 'react'
import type { Space, Resource } from '../../../modules/workspace/types/workspace.types'
import { useSpaces } from './useSpaces'

interface SpaceFormData {
  name: string
  description: string
  tags: string[]
  icon: string
  color: string
  resources: Resource[]
  executionOrder: 'sequential' | 'parallel'
  autoExecute: boolean
}

const initialFormData: SpaceFormData = {
  name: '',
  description: '',
  tags: [],
  icon: '📦',
  color: '#667eea',
  resources: [],
  executionOrder: 'sequential',
  autoExecute: false
}

/**
 * Space Editor ViewModel Hook
 */
export const useSpaceEditor = (spaceId?: string) => {
  const { getSpace, createSpace, updateSpace } = useSpaces()
  const [formData, setFormData] = useState<SpaceFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof SpaceFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  /**
   * Load space data if editing
   */
  useEffect(() => {
    if (spaceId) {
      setLoading(true)
      getSpace(spaceId)
        .then((result) => {
          if (result.success && result.data) {
            const space = result.data
            setFormData({
              name: space.name,
              description: space.description || '',
              tags: space.tags || [],
              icon: space.icon || '📦',
              color: space.color || '#667eea',
              resources: space.resources,
              executionOrder: space.executionOrder || 'sequential',
              autoExecute: space.autoExecute || false
            })
          }
        })
        .finally(() => setLoading(false))
    }
  }, [spaceId, getSpace])

  /**
   * Update form field
   */
  const updateField = useCallback(<K extends keyof SpaceFormData>(
    field: K,
    value: SpaceFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  /**
   * Add resource to space
   */
  const addResource = useCallback((resource: Omit<Resource, 'id' | 'order'>) => {
    const newResource: Resource = {
      ...resource,
      id: crypto.randomUUID(),
      order: formData.resources.length,
      enabled: true
    }
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }))
  }, [formData.resources.length])

  /**
   * Update resource
   */
  const updateResource = useCallback((id: string, updates: Partial<Resource>) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? { ...r, ...updates } : r))
    }))
  }, [])

  /**
   * Remove resource
   */
  const removeResource = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id)
    }))
  }, [])

  /**
   * Reorder resources
   */
  const reorderResources = useCallback((fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const newResources = [...prev.resources]
      const [removed] = newResources.splice(fromIndex, 1)
      newResources.splice(toIndex, 0, removed)
      // Update order property
      return {
        ...prev,
        resources: newResources.map((r, index) => ({ ...r, order: index }))
      }
    })
  }, [])

  /**
   * Validate form
   */
  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof SpaceFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.resources.length === 0) {
      newErrors.resources = 'At least one resource is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  /**
   * Save space
   */
  const save = useCallback(async () => {
    if (!validate()) {
      return { success: false, error: 'Validation failed' }
    }

    setSaving(true)

    try {
      const spaceData: Omit<Space, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags,
        icon: formData.icon,
        color: formData.color,
        resources: formData.resources,
        executionOrder: formData.executionOrder,
        autoExecute: formData.autoExecute
      }

      let result
      if (spaceId) {
        result = await updateSpace(spaceId, spaceData)
      } else {
        result = await createSpace(spaceData)
      }

      return result
    } finally {
      setSaving(false)
    }
  }, [formData, spaceId, validate, createSpace, updateSpace])

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
  }, [])

  return {
    formData,
    errors,
    loading,
    saving,
    isEditing: !!spaceId,
    updateField,
    addResource,
    updateResource,
    removeResource,
    reorderResources,
    save,
    reset
  }
}
