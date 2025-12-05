/**
 * Space Editor View
 * Create and edit spaces
 * Phase 2 Sprint 2.2 - Main Views
 */

import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSpaceEditor } from '../../hooks/useSpaceEditor'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal, ModalHeader, ModalTitle, ModalBody } from '../../components/ui/Modal'
import type { Resource } from '../../../../modules/workspace/types/workspace.types'

/**
 * Resource Form Component
 */
const ResourceForm: React.FC<{
  onAdd: (resource: Omit<Resource, 'id' | 'order'>) => void
  onCancel: () => void
}> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('')
  const [type, setType] = useState<'application' | 'url' | 'script' | 'file'>('application')
  const [path, setPath] = useState('')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (name && path) {
      onAdd({
        name,
        type,
        path,
        enabled: true,
        args: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      setName('')
      setPath('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Resource Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., VS Code"
        required
        fullWidth
      />

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="application">Application</option>
          <option value="url">URL</option>
          <option value="script">Script</option>
          <option value="file">File</option>
        </select>
      </div>

      <Input
        label="Path/URL"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder={
          type === 'url' ? 'https://example.com' : 'C:\\Program Files\\App\\app.exe'
        }
        required
        fullWidth
      />

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Add Resource
        </Button>
      </div>
    </form>
  )
}

/**
 * Space Editor View Component
 */
export const SpaceEditorView: React.FC = () => {
  const navigate = useNavigate()
  const { spaceId } = useParams<{ spaceId: string }>()
  const {
    formData,
    errors,
    loading,
    saving,
    isEditing,
    updateField,
    addResource,
    removeResource,
    save
  } = useSpaceEditor(spaceId)

  const [showResourceModal, setShowResourceModal] = useState(false)

  const handleSave = async (): Promise<void> => {
    const result = await save()
    if (result.success) {
      navigate('/dashboard')
    }
  }

  const handleAddResource = (resource: Omit<Resource, 'id' | 'order'>): void => {
    addResource(resource)
    setShowResourceModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading space...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Space' : 'Create New Space'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditing
            ? 'Update your workspace configuration'
            : 'Configure a new workspace with your favorite tools'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardBody padding>
            <div className="space-y-4">
              <Input
                label="Space Name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., Development"
                required
                fullWidth
              />

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Optional description"
                fullWidth
              />

              <Input
                label="Tags"
                value={formData.tags.join(', ')}
                onChange={(e) => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="e.g., Work, Personal, Study"
                helperText="Separate tags with commas"
                fullWidth
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Icon"
                  value={formData.icon}
                  onChange={(e) => updateField('icon', e.target.value)}
                  placeholder="📦"
                />

                <Input
                  label="Color"
                  type="text"
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  placeholder="#667eea"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Execution Order
                </label>
                <select
                  value={formData.executionOrder}
                  onChange={(e) =>
                    updateField('executionOrder', e.target.value as 'sequential' | 'parallel')
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="sequential">Sequential (one by one)</option>
                  <option value="parallel">Parallel (all at once)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoExecute"
                  checked={formData.autoExecute}
                  onChange={(e) => updateField('autoExecute', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="autoExecute" className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-execute on startup
                </label>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resources</CardTitle>
                {errors.resources && (
                  <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                    {errors.resources}
                  </p>
                )}
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowResourceModal(true)}>
                + Add Resource
              </Button>
            </div>
          </CardHeader>
          <CardBody padding>
            {formData.resources.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No resources added yet. Click "Add Resource" to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.resources.map((resource, index) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-gray-400 dark:text-gray-500">#{index + 1}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {resource.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {resource.path}
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {resource.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(resource.id)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {isEditing ? 'Update Space' : 'Create Space'}
          </Button>
        </div>
      </div>

      {/* Add Resource Modal */}
      <Modal open={showResourceModal} onClose={() => setShowResourceModal(false)} size="md">
        <ModalHeader>
          <ModalTitle>Add Resource</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ResourceForm
            onAdd={handleAddResource}
            onCancel={() => setShowResourceModal(false)}
          />
        </ModalBody>
      </Modal>
    </div>
  )
}
