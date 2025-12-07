/**
 * TrendsChart Component
 * Line chart for displaying trends over time using Recharts
 * Phase 5 Sprint 5.3.2 - Analytics Dashboard UI Integration
 */

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card'

export interface TrendsChartProps {
  title: string
  data: Array<{ date: string; value: number; [key: string]: any }>
  dataKey?: string
  loading?: boolean
}

/**
 * TrendsChart Component
 */
export const TrendsChart: React.FC<TrendsChartProps> = ({
  title,
  data,
  dataKey = 'value',
  loading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody padding>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-600">Loading chart...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                className="text-gray-600 dark:text-gray-400"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                className="text-gray-600 dark:text-gray-400"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  )
}
