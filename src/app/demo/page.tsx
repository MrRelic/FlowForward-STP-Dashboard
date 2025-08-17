'use client'

import { useEffect, useState } from 'react'
import { usePlantData, usePlantStats } from '@/hooks/usePlantData'
import { formatNumber, formatRelativeTime } from '@/utils/helpers'
import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'

export default function DemoPage() {
  const { plants, isLoading, error, triggerDemoViolation, resolveViolation } = usePlantData()
  const { stats } = usePlantStats()
  const [selectedPlant, setSelectedPlant] = useState<string>('')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plant data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-primary-600">Flow</span><span className="text-emerald-600">Forward</span> Demo
          </h1>
          <p className="text-gray-600">Real-time sewage treatment plant monitoring system</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Plants</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">{stats.running}</div>
              <div className="text-sm text-gray-600">Running</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.idle} Idle • {stats.fault} Fault
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.compliant}</div>
              <div className="text-sm text-gray-600">Compliant</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.warning} Warning • {stats.violation} Violations
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatNumber(stats.totalTreatedVolume / 1000, 1)}K</div>
              <div className="text-sm text-gray-600">Liters Treated</div>
              <div className="text-xs text-gray-500 mt-1">
                Avg Uptime: {formatNumber(stats.averageUptime, 1)}h
              </div>
            </div>
          </Card>
        </div>

        {/* Demo Controls */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Controls</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a plant...</option>
              {plants.map(plant => (
                <option key={plant.id} value={plant.id}>{plant.name}</option>
              ))}
            </select>
            
            {selectedPlant && (
              <>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => triggerDemoViolation(selectedPlant, 'pH')}
                >
                  Trigger pH Violation
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => triggerDemoViolation(selectedPlant, 'turbidity')}
                >
                  Trigger Turbidity Violation
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => triggerDemoViolation(selectedPlant, 'maintenance')}
                >
                  Trigger Maintenance Alert
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {plants.map(plant => (
            <Card key={plant.id} hover className="cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plant.name}</h3>
                  <p className="text-sm text-gray-600">{plant.location.address}</p>
                </div>
                <StatusBadge status={plant.status.toLowerCase() as any} size="sm" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Flow Rate</div>
                  <div className="metric-value text-primary-600">{formatNumber(plant.metrics.flowRate)} L/min</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">pH Level</div>
                  <div className="metric-value text-emerald-600">{formatNumber(plant.metrics.ph, 1)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Turbidity</div>
                  <div className="metric-value text-blue-600">{formatNumber(plant.metrics.turbidity, 1)} NTU</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Uptime</div>
                  <div className="metric-value text-purple-600">{formatNumber(plant.metrics.uptime, 1)}h</div>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="flex items-center justify-between mb-4">
                <StatusBadge 
                  status={plant.compliance.status.toLowerCase() as any} 
                  size="sm"
                />
                <span className="text-xs text-gray-500">
                  Updated {formatRelativeTime(plant.metrics.lastUpdated)}
                </span>
              </div>

              {/* Violations */}
              {plant.compliance.violations.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Recent Violations ({plant.compliance.violations.length})
                  </div>
                  <div className="space-y-2">
                    {plant.compliance.violations.slice(0, 2).map(violation => (
                      <div key={violation.id} className="flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          violation.severity === 'high' ? 'bg-red-100 text-red-700' :
                          violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {violation.type}
                        </span>
                        {!violation.resolved && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => resolveViolation(violation.id, 'demo-user')}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Real-time Update Indicator */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  )
}