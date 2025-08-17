'use client'

import { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import { usePlantData } from '@/hooks/usePlantData'
import { sanitizeForPublic, formatNumber, formatRelativeTime } from '@/utils/helpers'

export default function PublicPage() {
  const { plants, isLoading } = usePlantData()
  const [selectedPlant, setSelectedPlant] = useState<string>('')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plant information...</p>
        </div>
      </div>
    )
  }

  const selectedPlantData = selectedPlant ? plants.find(p => p.id === selectedPlant) : null
  const publicData = selectedPlantData ? sanitizeForPublic(selectedPlantData) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-primary-600">Flow</span><span className="text-emerald-600">Forward</span>
              </h1>
              <p className="text-gray-600 mt-1">Public Plant Information</p>
            </div>
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plant Selection */}
        <Card className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="plant-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select a Treatment Plant
              </label>
              <select
                id="plant-select"
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a plant to view public information...</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name} - {plant.location.address}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Public Access</span>
            </div>
          </div>
        </Card>

        {/* QR Code Information */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code Access</h3>
              <p className="text-gray-600 mb-3">
                Scan the QR code at your colony's treatment plant to instantly access real-time public information 
                about water treatment operations, compliance status, and performance metrics.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No login required
                </div>
                <div className="flex items-center text-blue-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real-time data
                </div>
                <div className="flex items-center text-purple-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Transparent
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Plant Information */}
        {publicData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Plant Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{publicData.name}</h2>
                    <p className="text-gray-600">{publicData.location.address}</p>
                  </div>
                  <StatusBadge 
                    status={publicData.status.toLowerCase() as any}
                    size="lg"
                  />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatNumber(publicData.publicMetrics.uptime, 1)}h
                    </div>
                    <div className="text-sm text-gray-600">Current Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatNumber(publicData.publicMetrics.treatedVolume / 1000, 1)}K
                    </div>
                    <div className="text-sm text-gray-600">Liters Treated Today</div>
                  </div>
                </div>

                {/* Compliance Badge */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="mb-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                      publicData.complianceBadge === 'Good' ? 'bg-green-100 text-green-800' :
                      publicData.complianceBadge === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {publicData.complianceBadge === 'Good' && (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {publicData.complianceBadge === 'Fair' && (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      )}
                      {publicData.complianceBadge === 'Needs Attention' && (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      )}
                      Compliance: {publicData.complianceBadge}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    This plant is operating within environmental standards and regulations.
                  </p>
                </div>

                <div className="text-xs text-gray-500 text-center mt-4">
                  Last updated: {formatRelativeTime(publicData.publicMetrics.lastUpdated)}
                </div>
              </Card>
            </div>

            {/* 7-Day Summary */}
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Average Uptime</span>
                      <span className="font-semibold">{formatNumber(publicData.weekSummary.averageUptime, 1)}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(publicData.weekSummary.averageUptime / 24) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Total Water Treated</span>
                      <span className="font-semibold">{formatNumber(publicData.weekSummary.totalTreatedVolume / 1000, 0)}K L</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Compliance Rate</span>
                      <span className="font-semibold">{publicData.weekSummary.complianceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          publicData.weekSummary.complianceRate >= 95 ? 'bg-green-600' :
                          publicData.weekSummary.complianceRate >= 85 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${publicData.weekSummary.complianceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Transparency Notice */}
              <Card className="bg-blue-50 border-blue-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transparency & Accountability</h4>
                  <p className="text-sm text-gray-600">
                    This public dashboard promotes transparency in water treatment operations. 
                    All data is updated in real-time to ensure community awareness and environmental accountability.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M13 7a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Treatment Plant</h3>
            <p className="text-gray-600">
              Choose a sewage treatment plant from the dropdown above to view its public information and real-time status.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}