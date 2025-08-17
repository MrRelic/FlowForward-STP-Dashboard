// Utility helper functions for the STP Dashboard

import { Plant, PlantFilter, PublicPlantData } from '@/types'

/**
 * Format a number to a specific decimal place
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals)
}

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Format a date to a relative time string (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

/**
 * Generate a random number within a range
 */
export const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

/**
 * Generate a random integer within a range
 */
export const randomIntInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Filter plants based on provided criteria
 */
export const filterPlants = (plants: Plant[], filter: PlantFilter): Plant[] => {
  return plants.filter(plant => {
    // Filter by location
    if (filter.location && !plant.location.address.toLowerCase().includes(filter.location.toLowerCase())) {
      return false
    }
    
    // Filter by status
    if (filter.status && plant.status !== filter.status) {
      return false
    }
    
    // Filter by compliance status
    if (filter.complianceStatus && plant.compliance.status !== filter.complianceStatus) {
      return false
    }
    
    // Filter by violation count
    if (filter.violationCount) {
      const violationCount = plant.compliance.violations.length
      if (filter.violationCount.min !== undefined && violationCount < filter.violationCount.min) {
        return false
      }
      if (filter.violationCount.max !== undefined && violationCount > filter.violationCount.max) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Convert plant data to public data (sanitized for residents)
 */
export const sanitizeForPublic = (plant: Plant): PublicPlantData => {
  // Calculate compliance badge based on violations and status
  let complianceBadge: 'Good' | 'Fair' | 'Needs Attention' = 'Good'
  
  if (plant.compliance.status === 'Violation' || plant.status === 'Fault') {
    complianceBadge = 'Needs Attention'
  } else if (plant.compliance.status === 'Warning' || plant.status === 'Idle') {
    complianceBadge = 'Fair'
  }
  
  // Convert status to public-friendly version
  let publicStatus: 'Running' | 'Idle' | 'Maintenance' = 'Running'
  if (plant.status === 'Idle') {
    publicStatus = 'Idle'
  } else if (plant.status === 'Fault') {
    publicStatus = 'Maintenance'
  }
  
  return {
    id: plant.id,
    name: plant.name,
    location: {
      address: plant.location.address,
    },
    status: publicStatus,
    publicMetrics: {
      uptime: plant.metrics.uptime,
      treatedVolume: plant.metrics.treatedVolume,
      lastUpdated: plant.metrics.lastUpdated,
    },
    complianceBadge,
    weekSummary: {
      // Mock 7-day averages - in real app this would come from historical data
      averageUptime: Math.max(0, plant.metrics.uptime - randomInRange(0, 2)),
      totalTreatedVolume: plant.metrics.treatedVolume * 7,
      complianceRate: plant.compliance.status === 'Compliant' ? 100 : 
                     plant.compliance.status === 'Warning' ? 85 : 65,
    },
  }
}

/**
 * Get status color class based on plant status
 */
export const getStatusColorClass = (status: Plant['status']): string => {
  switch (status) {
    case 'Running':
      return 'text-success-600 bg-success-50'
    case 'Idle':
      return 'text-warning-600 bg-warning-50'
    case 'Fault':
      return 'text-danger-600 bg-danger-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Get compliance color class based on compliance status
 */
export const getComplianceColorClass = (status: string): string => {
  switch (status) {
    case 'Compliant':
      return 'text-success-600 bg-success-50'
    case 'Warning':
      return 'text-warning-600 bg-warning-50'
    case 'Violation':
      return 'text-danger-600 bg-danger-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttle function to limit function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}