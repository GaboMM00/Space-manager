/**
 * Dashboard View
 * Main dashboard showing all spaces
 * Phase 2 Sprint 2.2 - Main Views
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaces } from '../../hooks/useSpaces'
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/ui/Dropdown'

/**
 * Dashboard View Component
 */
export const DashboardView: React.FC = () => {
  const navigate = useNavigate()
  const { spaces, loading, error, deleteSpace, executeSpace } = useSpaces()

  const handleExecute = async (spaceId: string): Promise<void> => {
    const result = await executeSpace(spaceId)
    if (result.success) {
      // TODO: Show success notification
      console.log('Space executed successfully')
    } else {
      // TODO: Show error notification
      console.error('Failed to execute space:', result.error)
    }
  }

  const handleEdit = (spaceId: string): void => {
    navigate(`/spaces/${spaceId}/edit`)
  }

  const handleDelete = async (spaceId: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this space?')) {
      const result = await deleteSpace(spaceId)
      if (result.success) {
        // TODO: Show success notification
        console.log('Space deleted successfully')
      } else {
        // TODO: Show error notification
        console.error('Failed to delete space:', result.error)
      }
    }
  }

  // Menu icon
  const MenuIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  )

  // Play icon
  const PlayIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  if (loading && spaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading spaces...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardBody padding>
            <p className="text-error-600 dark:text-error-400">{error}</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (spaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-4 text-gray-400 dark:text-gray-600">
            <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No spaces yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first space to get started
          </p>
          <Button variant="primary" onClick={() => navigate('/spaces/new')}>
            + Create Space
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and execute your workspaces
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <Card key={space.id} hoverable>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{space.name}</CardTitle>
                  {space.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {space.description}
                    </p>
                  )}
                </div>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      {MenuIcon}
                    </Button>
                  }
                  align="end"
                >
                  <DropdownItem onClick={() => handleEdit(space.id)}>
                    Edit
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem destructive onClick={() => handleDelete(space.id)}>
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
            </CardHeader>

            <CardBody padding>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="primary" size="sm">
                  {space.resources.length} resources
                </Badge>
                {space.tags && space.tags.length > 0 && space.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-1">
                {space.resources.slice(0, 3).map((resource) => (
                  <div
                    key={resource.id}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {resource.name}
                  </div>
                ))}
                {space.resources.length > 3 && (
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    +{space.resources.length - 3} more
                  </div>
                )}
              </div>
            </CardBody>

            <CardFooter>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={PlayIcon}
                onClick={() => handleExecute(space.id)}
              >
                Execute
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
