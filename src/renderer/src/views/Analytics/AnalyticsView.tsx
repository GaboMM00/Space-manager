/**
 * AnalyticsView Component
 * Main analytics dashboard with stats, charts, and insights
 * Phase 5 Sprint 5.3.2 - Analytics Dashboard UI Integration
 */

import React, { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useToastContext } from '../../context/ToastContext'
import { Spinner } from '../../components/ui/Spinner'
import { StatCard } from '../../components/analytics/StatCard'
import { TrendsChart } from '../../components/analytics/TrendsChart'
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card'

/**
 * AnalyticsView Component
 */
export const AnalyticsView: React.FC = () => {
  const toast = useToastContext()
  const { loading, getStats, getRecentTrends, getExecutionLogs } = useAnalytics()

  // State
  const [stats, setStats] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('7days')

  // Load data
  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    // Calculate date range
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 }
    const days = daysMap[timeRange]
    const endDate = new Date()
    const startDate = subDays(endDate, days)

    // Load stats
    const statsResult = await getStats({
      start: startDate.getTime(),
      end: endDate.getTime()
    })

    if (statsResult.success) {
      setStats(statsResult.data)
    } else {
      toast.error(statsResult.error || 'Failed to load stats')
    }

    // Load trends
    const trendsResult = await getRecentTrends(days)
    console.log('Trends result:', trendsResult)
    if (trendsResult.success) {
      console.log('Trends data:', trendsResult.data)
      // Format data for chart - date is YYYYMMDD format
      const formattedTrends = (trendsResult.data || []).map((item: any) => {
        const dateStr = String(item.date)
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        return {
          date: format(new Date(`${year}-${month}-${day}`), 'MMM dd'),
          value: item.totalExecutions || 0
        }
      })
      console.log('Formatted trends:', formattedTrends)
      setTrends(formattedTrends)
    } else {
      console.error('Failed to load trends:', trendsResult.error)
    }

    // Load recent activity
    const logsResult = await getExecutionLogs({ limit: 10 })
    if (logsResult.success) {
      // Transform ExecutionLog to have status string and proper timestamp
      const formattedLogs = (logsResult.data || []).map((log: any) => ({
        ...log,
        status: log.success ? 'success' : 'error',
        timestamp: log.startedAt
      }))
      setRecentActivity(formattedLogs)
    }
  }

  // Icons
  const SpacesIcon = (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )

  const TasksIcon = (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )

  const ExecutionsIcon = (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )

  const UptimeIcon = (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your workspace usage and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Spaces"
          value={stats?.totalSpaces || 0}
          icon={SpacesIcon}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={TasksIcon}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Executions"
          value={stats?.totalExecutions || 0}
          icon={ExecutionsIcon}
          color="purple"
          trend={stats?.executionTrend}
          loading={loading}
        />
        <StatCard
          title="Success Rate"
          value={stats?.successRate ? `${stats.successRate}%` : '0%'}
          icon={UptimeIcon}
          color="green"
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trends Chart */}
        <TrendsChart
          title="Execution Trends"
          data={trends}
          dataKey="value"
          loading={loading}
        />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardBody padding>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-600">Loading activity...</div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success'
                        ? 'bg-green-500'
                        : activity.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.spaceName || 'Unknown Space'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.timestamp
                          ? format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')
                          : 'No timestamp'}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      activity.status === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : activity.status === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {activity.status || 'unknown'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Empty state message if no data */}
      {!loading && !stats?.totalExecutions && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-gray-400 dark:text-gray-600">
              <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No analytics data yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start using spaces to see analytics and insights
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
