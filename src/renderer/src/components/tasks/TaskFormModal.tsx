/**
 * TaskFormModal Component
 * Modal form for creating/editing tasks
 * Phase 5 Sprint 5.3.1 - Task Management UI Integration
 */

import React, { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { Task, TaskPriority, TaskStatus, CreateTaskInput } from '../../../../modules/tasks/types/task.types'
import { TaskPriority as TaskPriorityEnum, TaskStatus as TaskStatusEnum } from '../../../../modules/tasks/types/task.types'
import { useSpaces } from '../../hooks/useSpaces'

export interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (taskData: CreateTaskInput) => Promise<{ success: boolean; error?: string }>
  task?: Task // If provided, edit mode
  defaultSpaceId?: string
}

/**
 * TaskFormModal Component
 */
export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  task,
  defaultSpaceId
}) => {
  const { spaces } = useSpaces()
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateTaskInput>({
    spaceId: defaultSpaceId || '',
    title: '',
    description: '',
    status: TaskStatusEnum.Pending,
    priority: TaskPriorityEnum.Medium,
    order: 0
  })

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setFormData({
        spaceId: task.spaceId,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        order: task.order
      })
    } else if (defaultSpaceId) {
      setFormData((prev) => ({ ...prev, spaceId: defaultSpaceId }))
    }
  }, [task, defaultSpaceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await onSubmit(formData)
      if (result.success) {
        onClose()
        // Reset form
        setFormData({
          spaceId: defaultSpaceId || '',
          title: '',
          description: '',
          status: TaskStatusEnum.Pending,
          priority: TaskPriorityEnum.Medium,
          order: 0
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dueDate: date.toISOString()
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        dueDate: undefined
      }))
    }
    setShowDatePicker(false)
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{task ? 'Edit Task' : 'Create New Task'}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-error-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              />
            </div>

            {/* Space Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Space <span className="text-error-600">*</span>
              </label>
              <select
                value={formData.spaceId}
                onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              >
                <option value="">Select a space</option>
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="flex gap-3">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((priority) => (
                  <label
                    key={priority}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {priority === 'high' && '🔴 '}
                      {priority === 'medium' && '🟡 '}
                      {priority === 'low' && '🔵 '}
                      {priority}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex-1"
                >
                  {formData.dueDate
                    ? format(new Date(formData.dueDate), 'MMM d, yyyy')
                    : 'Select date'}
                </Button>
                {formData.dueDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, dueDate: undefined })}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Date Picker */}
              {showDatePicker && (
                <div className="mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                  <DayPicker
                    mode="single"
                    selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onSelect={handleDateSelect}
                    className="text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!formData.title || !formData.spaceId}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
