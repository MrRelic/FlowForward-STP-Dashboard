'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/services/AuthService'
import { usePlantData, usePlantStats } from '@/hooks/usePlantData'
import { formatNumber, formatRelativeTime } from '@/utils/helpers'

export default function GovernmentDashboard() {
  const { getCurrentUser, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const user = getCurrentUser()
  const { plants, isLoading, triggerDemoViolation, resolveViolation } = usePlantData()
  const { stats } = usePlantStats()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [complianceFilter, setComplianceFilter] = useState('all')
  const [showOnlyNonCompliant, setShowOnlyNonCompliant] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  // Generate static maintenance dates and trend data for each plant
  const plantStaticData = useMemo(() => {
    const data: Record<string, { lastMaintenance: Date; trendData: number[] }> = {}
    
    plants.forEach(plant => {
      // Generate a static maintenance date (1-30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1
      const lastMaintenance = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      
      // Generate static trend data for 7 days
      const trendData = Array.from({ length: 7 }, () => Math.random() * 100)
      
      data[plant.id] = { lastMaintenance, trendData }
    })
    
    return data
  }, [plants.length]) // Only regenerate when number of plants changes

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'government') {
      router.push('/login?role=government')
    }
  }, [isAuthenticated, user, router])

  if (!user || user.role !== 'government') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system data...</p>
        </div>
      </div>
    )
  }

  // Filter plants based on search and filters
  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || plant.status.toLowerCase() === statusFilter.toLowerCase()
    
    const matchesCompliance = complianceFilter === 'all' || 
                             plant.compliance.status.toLowerCase() === complianceFilter.toLowerCase()
    
    const matchesNonCompliant = !showOnlyNonCompliant || 
                               (plant.status === 'Fault' || plant.compliance.status !== 'Compliant')
    
    return matchesSearch && matchesStatus && matchesCompliance && matchesNonCompliant
  })

  // Sort plants - non-compliant first
  const sortedPlants = [...filteredPlants].sort((a, b) => {
    const aScore = (a.status === 'Fault' ? 2 : 0) + (a.compliance.status === 'Violation' ? 2 : a.compliance.status === 'Warning' ? 1 : 0)
    const bScore = (b.status === 'Fault' ? 2 : 0) + (b.compliance.status === 'Violation' ? 2 : b.compliance.status === 'Warning' ? 1 : 0)
    return bScore - aScore
  })

  const unresolvedViolations = plants.flatMap(p => p.compliance.violations.filter(v => !v.resolved))
  const totalFines = plants.reduce((sum, p) => sum + p.compliance.fines.reduce((fineSum, f) => fineSum + f.amount, 0), 0)
  const totalTreatedVolume = plants.reduce((sum, p) => sum + p.metrics.treatedVolume, 0)

  const resolveAllViolations = () => {
    unresolvedViolations.forEach(violation => {
      resolveViolation(violation.id, user.name)
    })
  }

  const getPlantBorderClass = (plant: any) => {
    if (plant.status === 'Fault' || plant.compliance.status === 'Violation') {
      return 'border-red-500 shadow-red-500/20 shadow-lg animate-pulse'
    }
    if (plant.status === 'Idle' || plant.compliance.status === 'Warning') {
      return 'border-yellow-500 shadow-yellow-500/20 shadow-lg'
    }
    return 'border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h1 className="text-xl font-bold text-gray-900">
                  <span className="text-primary-600">Flow</span><span className="text-emerald-600">Forward</span>
                </h1>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Government View
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
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
        {/* Impact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700 mb-2">₹{formatNumber(totalFines / 100000, 1)}L</div>
              <div className="text-red-600 text-sm">Total Fines Levied</div>
              <div className="text-red-500 text-xs mt-1">This Month</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-2">{formatNumber(totalTreatedVolume / 1000000, 1)}M</div>
              <div className="text-blue-600 text-sm">Liters Water Saved</div>
              <div className="text-blue-500 text-xs mt-1">Eco Impact</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">{formatNumber(totalTreatedVolume / 2000, 0)}</div>
              <div className="text-green-600 text-sm">CO₂ Offset (kg)</div>
              <div className="text-green-500 text-xs mt-1">Solar Powered</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700 mb-2">{Math.round((stats.compliant / stats.total) * 100)}%</div>
              <div className="text-purple-600 text-sm">Compliance Rate</div>
              <div className="text-purple-500 text-xs mt-1">System Wide</div>
            </div>
          </Card>
        </div>

        {/* Controls & Filters */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="idle">Idle</option>
                <option value="fault">Fault</option>
              </select>

              {/* Compliance Filter */}
              <select
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Compliance</option>
                <option value="compliant">Compliant</option>
                <option value="warning">Warning</option>
                <option value="violation">Violation</option>
              </select>
            </div>

            <div className="flex space-x-4">
              {/* Non-Compliant Toggle */}
              <button
                onClick={() => setShowOnlyNonCompliant(!showOnlyNonCompliant)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showOnlyNonCompliant 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showOnlyNonCompliant ? 'Show All' : 'Non-Compliant Only'}
              </button>

              {/* Resolve All Button */}
              {unresolvedViolations.length > 0 && (
                <Button
                  variant="success"
                  onClick={resolveAllViolations}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Resolve All ({unresolvedViolations.length})</span>
                </Button>
              )}

              {/* View Mode Toggle */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-600">
            Showing {sortedPlants.length} of {plants.length} plants
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          {unresolvedViolations.length > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{unresolvedViolations.length} Active Violations</span>
            </div>
          )}
        </div>

        {/* Plants Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedPlants.map(plant => {
              const unresolvedPlantViolations = plant.compliance.violations.filter(v => !v.resolved)
              const staticData = plantStaticData[plant.id]
              
              return (
                <Card 
                  key={plant.id} 
                  hover 
                  className={`cursor-pointer transition-all duration-300 ${getPlantBorderClass(plant)}`}
                  onClick={() => setSelectedPlant(selectedPlant === plant.id ? null : plant.id)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{plant.name}</h3>
                        <p className="text-sm text-gray-600">{plant.location.address}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <StatusBadge status={plant.status.toLowerCase() as any} size="sm" />
                        <StatusBadge status={plant.compliance.status.toLowerCase() as any} size="sm" />
                      </div>
                    </div>

                    {/* Alerts */}
                    {unresolvedPlantViolations.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-red-700 font-medium text-sm">
                            {unresolvedPlantViolations.length} Active Alert{unresolvedPlantViolations.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        {unresolvedPlantViolations.slice(0, 2).map(violation => (
                          <div key={violation.id} className="text-xs text-red-600 mb-1">
                            {violation.type}: {violation.description}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(plant.metrics.flowRate, 1)}</div>
                        <div className="text-xs text-gray-600">L/min Flow</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{formatNumber(plant.metrics.ph, 1)}</div>
                        <div className="text-xs text-gray-600">pH Level</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{formatNumber(plant.metrics.uptime, 1)}h</div>
                        <div className="text-xs text-gray-600">Uptime</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{formatNumber(plant.metrics.treatedVolume / 1000, 1)}K</div>
                        <div className="text-xs text-gray-600">Treated (L)</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        Last Maintenance: {formatRelativeTime(staticData.lastMaintenance)}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            // Contact manager functionality
                          }}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                          Contact Manager
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedPlant === plant.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              triggerDemoViolation(plant.id, 'pH')
                            }}
                          >
                            Trigger Alert
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Download report functionality
                            }}
                          >
                            Download Report
                          </Button>
                        </div>
                        
                        {/* Mini trend chart */}
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="text-xs text-gray-600 mb-2">7-Day Trend</div>
                          <div className="h-16 flex items-end space-x-1">
                            {staticData.trendData.map((value, i) => (
                              <div
                                key={i}
                                className="bg-blue-500 rounded-t flex-1"
                                style={{
                                  height: `${value}%`,
                                  minHeight: '4px'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Map View */
          <Card className="h-96">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map View</h3>
                <p className="text-gray-600">Map integration coming soon with plant locations and status pins</p>
              </div>
            </div>
          </Card>
        )}

        {/* No Results */}
        {sortedPlants.length === 0 && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plants Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </Card>
        )}
      </div>
    </div>
  )
}