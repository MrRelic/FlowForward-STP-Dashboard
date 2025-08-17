import { useState, useEffect, useCallback } from 'react'
import { Plant, PlantChartData, PlantFilter } from '@/types'
import { plantDataGenerator } from '@/services/PlantDataGenerator'
import { filterPlants } from '@/utils/helpers'

/**
 * Custom hook for managing plant data with real-time updates
 */
export const usePlantData = () => {
  const [plants, setPlantsState] = useState<Plant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize data and start real-time updates
  useEffect(() => {
    try {
      // Get initial data
      const initialPlants = plantDataGenerator.getPlants()
      setPlantsState(initialPlants)
      setIsLoading(false)

      // Subscribe to real-time updates
      const unsubscribe = plantDataGenerator.subscribe((updatedPlants) => {
        setPlantsState(updatedPlants)
      })

      // Start real-time updates
      plantDataGenerator.startRealTimeUpdates()

      // Cleanup on unmount
      return () => {
        unsubscribe()
        plantDataGenerator.stopRealTimeUpdates()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plant data')
      setIsLoading(false)
    }
  }, [])

  // Get filtered plants
  const getFilteredPlants = useCallback((filter: PlantFilter) => {
    return filterPlants(plants, filter)
  }, [plants])

  // Get plant by ID
  const getPlant = useCallback((id: string) => {
    return plants.find(plant => plant.id === id)
  }, [plants])

  // Get plants for manager
  const getPlantsForManager = useCallback((managerId: string) => {
    return plants.filter(plant => plant.assignedManager === managerId)
  }, [plants])

  // Trigger demo violation
  const triggerDemoViolation = useCallback((plantId: string, type: 'pH' | 'turbidity' | 'flow' | 'maintenance') => {
    return plantDataGenerator.triggerDemoViolation(plantId, type)
  }, [])

  // Resolve violation
  const resolveViolation = useCallback((violationId: string, resolvedBy: string) => {
    return plantDataGenerator.resolveViolation(violationId, resolvedBy)
  }, [])

  return {
    plants,
    isLoading,
    error,
    getFilteredPlants,
    getPlant,
    getPlantsForManager,
    triggerDemoViolation,
    resolveViolation
  }
}

/**
 * Custom hook for managing chart data with real-time updates
 */
export const useChartData = (plantId: string) => {
  const [chartData, setChartData] = useState<PlantChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!plantId) return

    // Get initial chart data
    const initialData = plantDataGenerator.getChartData(plantId)
    if (initialData) {
      setChartData(initialData)
      setIsLoading(false)
    }

    // Subscribe to updates for chart data refresh
    const unsubscribe = plantDataGenerator.subscribe(() => {
      const updatedData = plantDataGenerator.getChartData(plantId)
      if (updatedData) {
        setChartData({ ...updatedData }) // Create new object to trigger re-render
      }
    })

    return unsubscribe
  }, [plantId])

  return {
    chartData,
    isLoading
  }
}

/**
 * Custom hook for plant statistics and aggregations
 */
export const usePlantStats = () => {
  const { plants, isLoading } = usePlantData()

  const stats = {
    total: plants.length,
    running: plants.filter(p => p.status === 'Running').length,
    idle: plants.filter(p => p.status === 'Idle').length,
    fault: plants.filter(p => p.status === 'Fault').length,
    compliant: plants.filter(p => p.compliance.status === 'Compliant').length,
    warning: plants.filter(p => p.compliance.status === 'Warning').length,
    violation: plants.filter(p => p.compliance.status === 'Violation').length,
    totalViolations: plants.reduce((sum, p) => sum + p.compliance.violations.length, 0),
    unresolvedViolations: plants.reduce((sum, p) => sum + p.compliance.violations.filter(v => !v.resolved).length, 0),
    totalFines: plants.reduce((sum, p) => sum + p.compliance.fines.reduce((fineSum, f) => fineSum + f.amount, 0), 0),
    averageUptime: plants.length > 0 ? plants.reduce((sum, p) => sum + p.metrics.uptime, 0) / plants.length : 0,
    totalTreatedVolume: plants.reduce((sum, p) => sum + p.metrics.treatedVolume, 0)
  }

  return {
    stats,
    isLoading
  }
}