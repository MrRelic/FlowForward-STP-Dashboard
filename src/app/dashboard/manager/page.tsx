'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/services/AuthService'
import { usePlantData, useChartData } from '@/hooks/usePlantData'
import { formatNumber, formatRelativeTime } from '@/utils/helpers'

export default function ManagerDashboard() {
  const { getCurrentUser, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const user = getCurrentUser()
  const { plants, isLoading, triggerDemoViolation, resolveViolation } = usePlantData()
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  // Get the manager's assigned plant
  const assignedPlant = user?.assignedPlants?.[0] ? plants.find(p => p.id === user.assignedPlants[0]) : null
  const { chartData } = useChartData(assignedPlant?.id || '')

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'plant_manager') {
      router.push('/login?role=manager')
    }
  }, [isAuthenticated, user, router])

  if (!user || user.role !== 'plant_manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (isLoading || !assignedPlant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plant data...</p>
        </div>
      </div>
    )
  }

  const unresolvedViolations = assignedPlant.compliance.violations.filter(v => !v.resolved)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-primary-600">Flow</span><span className="text-emerald-600">Forward</span>
              </h1>
              <div className="text-sm text-gray-500">{assignedPlant.name}</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Welcome, </span>
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Plant Status Header */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{assignedPlant.name}</h2>
              <p className="text-gray-600">{assignedPlant.location.address}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={assignedPlant.status.toLowerCase() as any} size="lg" />
              <div className="text-sm text-gray-500 mt-2">
                Updated {formatRelativeTime(assignedPlant.metrics.lastUpdated)}
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts Section */}
        {unresolvedViolations.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Active Alerts ({unresolvedViolations.length})
                </h3>
                <div className="space-y-2">
                  {unresolvedViolations.map(violation => (
                    <div key={violation.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            violation.severity === 'high' ? 'bg-red-100 text-red-800' :
                            violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {violation.severity.toUpperCase()} - {violation.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatRelativeTime(violation.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{violation.description}</p>
                      </div>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => resolveViolation(violation.id, user.name)}
                      >
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Real-time Sensor Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatNumber(assignedPlant.metrics.flowRate, 1)}
            </div>
            <div className="text-sm text-gray-600 mb-1">Flow Rate</div>
            <div className="text-xs text-gray-500">L/min</div>
            <div className="mt-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatNumber(assignedPlant.metrics.ph, 1)}
            </div>
            <div className="text-sm text-gray-600 mb-1">pH Level</div>
            <div className="text-xs text-gray-500">pH units</div>
            <div className="mt-2">
              <div className={`text-xs px-2 py-1 rounded ${
                assignedPlant.metrics.ph >= 6.5 && assignedPlant.metrics.ph <= 8.5 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {assignedPlant.metrics.ph >= 6.5 && assignedPlant.metrics.ph <= 8.5 ? 'Normal' : 'Alert'}
              </div>
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatNumber(assignedPlant.metrics.turbidity, 1)}
            </div>
            <div className="text-sm text-gray-600 mb-1">Turbidity</div>
            <div className="text-xs text-gray-500">NTU</div>
            <div className="mt-2">
              <div className={`text-xs px-2 py-1 rounded ${
                assignedPlant.metrics.turbidity <= 5 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {assignedPlant.metrics.turbidity <= 5 ? 'Good' : 'High'}
              </div>
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatNumber(assignedPlant.metrics.tdsEc, 0)}
            </div>
            <div className="text-sm text-gray-600 mb-1">TDS/EC</div>
            <div className="text-xs text-gray-500">ppm</div>
            <div className="mt-2">
              <div className={`text-xs px-2 py-1 rounded ${
                assignedPlant.metrics.tdsEc <= 500 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {assignedPlant.metrics.tdsEc <= 500 ? 'Normal' : 'Elevated'}
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatNumber(assignedPlant.metrics.uptime, 1)}h
                </div>
                <div className="text-sm text-gray-600">Current Uptime</div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(assignedPlant.metrics.treatedVolume / 1000, 1)}K
                </div>
                <div className="text-sm text-gray-600">Treated Volume (L)</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  85%
                </div>
                <div className="text-sm text-gray-600">Tank Level</div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Historical Data & Charts */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Historical Data & Trends</h3>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Flow Rate Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Flow Rate Trend</h4>
                <div className="h-48 flex items-end space-x-1">
                  {chartData.flowRate.slice(-20).map((point, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t flex-1 min-w-0"
                      style={{
                        height: `${(point.value / 200) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`${formatNumber(point.value, 1)} L/min at ${point.timestamp.toLocaleTimeString()}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Current: {formatNumber(assignedPlant.metrics.flowRate, 1)} L/min
                </div>
              </div>

              {/* pH Level Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">pH Level Trend</h4>
                <div className="h-48 flex items-end space-x-1">
                  {chartData.ph.slice(-20).map((point, index) => (
                    <div
                      key={index}
                      className={`rounded-t flex-1 min-w-0 ${
                        point.value >= 6.5 && point.value <= 8.5 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        height: `${((point.value - 6) / 3) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`pH ${formatNumber(point.value, 1)} at ${point.timestamp.toLocaleTimeString()}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Current: pH {formatNumber(assignedPlant.metrics.ph, 1)}
                </div>
              </div>

              {/* Turbidity Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Turbidity Trend</h4>
                <div className="h-48 flex items-end space-x-1">
                  {chartData.turbidity.slice(-20).map((point, index) => (
                    <div
                      key={index}
                      className="bg-purple-500 rounded-t flex-1 min-w-0"
                      style={{
                        height: `${(point.value / 10) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`${formatNumber(point.value, 1)} NTU at ${point.timestamp.toLocaleTimeString()}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Current: {formatNumber(assignedPlant.metrics.turbidity, 1)} NTU
                </div>
              </div>

              {/* TDS/EC Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">TDS/EC Trend</h4>
                <div className="h-48 flex items-end space-x-1">
                  {chartData.tdsEc.slice(-20).map((point, index) => (
                    <div
                      key={index}
                      className="bg-orange-500 rounded-t flex-1 min-w-0"
                      style={{
                        height: `${(point.value / 800) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`${formatNumber(point.value, 0)} ppm at ${point.timestamp.toLocaleTimeString()}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Current: {formatNumber(assignedPlant.metrics.tdsEc, 0)} ppm
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Control Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plant Controls & Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="warning"
              onClick={() => triggerDemoViolation(assignedPlant.id, 'pH')}
              className="w-full"
            >
              Trigger pH Alert
            </Button>
            <Button
              variant="warning"
              onClick={() => triggerDemoViolation(assignedPlant.id, 'turbidity')}
              className="w-full"
            >
              Trigger Turbidity Alert
            </Button>
            <Button
              variant="danger"
              onClick={() => triggerDemoViolation(assignedPlant.id, 'maintenance')}
              className="w-full"
            >
              Maintenance Required
            </Button>
            <Button
              variant="secondary"
              className="w-full"
            >
              Download Report
            </Button>
          </div>
        </Card>

        {/* Live Update Indicator */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Data</span>
          </div>
        </div>
      </div>
    </div>
  )
}