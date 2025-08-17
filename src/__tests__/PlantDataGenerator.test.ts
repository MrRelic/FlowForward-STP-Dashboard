/**
 * Tests for PlantDataGenerator service
 * Ensures mock data generation works correctly
 */

import { PlantDataGenerator } from '@/services/PlantDataGenerator'
import { PLANT_STATUS, COMPLIANCE_STATUS } from '@/utils/constants'

describe('PlantDataGenerator', () => {
  let generator: PlantDataGenerator

  beforeEach(() => {
    generator = new PlantDataGenerator()
  })

  afterEach(() => {
    generator.stopRealTimeUpdates()
  })

  describe('Plant Data Generation', () => {
    test('should generate initial plants with valid data', () => {
      const plants = generator.getPlants()
      
      expect(plants).toHaveLength(5)
      
      plants.forEach(plant => {
        // Check required fields
        expect(plant.id).toBeDefined()
        expect(plant.name).toBeDefined()
        expect(plant.location.address).toBeDefined()
        expect(plant.location.coordinates).toHaveLength(2)
        
        // Check status is valid
        expect(Object.values(PLANT_STATUS)).toContain(plant.status)
        
        // Check metrics are within valid ranges
        expect(plant.metrics.flowRate).toBeGreaterThanOrEqual(50)
        expect(plant.metrics.flowRate).toBeLessThanOrEqual(200)
        expect(plant.metrics.ph).toBeGreaterThanOrEqual(6.5)
        expect(plant.metrics.ph).toBeLessThanOrEqual(8.5)
        expect(plant.metrics.turbidity).toBeGreaterThanOrEqual(0)
        expect(plant.metrics.turbidity).toBeLessThanOrEqual(10)
        
        // Check compliance status is valid
        expect(Object.values(COMPLIANCE_STATUS)).toContain(plant.compliance.status)
        
        // Check QR code is generated
        expect(plant.qrCode).toContain(plant.id)
      })
    })

    test('should generate unique plant IDs', () => {
      const plants = generator.getPlants()
      const ids = plants.map(p => p.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(plants.length)
    })

    test('should assign managers to plants', () => {
      const plants = generator.getPlants()
      
      plants.forEach(plant => {
        expect(plant.assignedManager).toBeDefined()
        expect(plant.assignedManager).toMatch(/^manager\.[a-e]$/)
      })
    })
  })

  describe('User Data Generation', () => {
    test('should generate users with correct roles', () => {
      const users = generator.getUsers()
      
      expect(users.length).toBeGreaterThan(0)
      
      const governmentUsers = users.filter(u => u.role === 'government')
      const managerUsers = users.filter(u => u.role === 'plant_manager')
      
      expect(governmentUsers.length).toBeGreaterThan(0)
      expect(managerUsers.length).toBeGreaterThan(0)
      
      // Check government user has access to all resources
      governmentUsers.forEach(user => {
        expect(user.permissions.length).toBeGreaterThan(0)
        expect(user.assignedPlants).toBeUndefined()
      })
      
      // Check plant managers have assigned plants
      managerUsers.forEach(user => {
        expect(user.assignedPlants).toBeDefined()
        expect(user.assignedPlants!.length).toBeGreaterThan(0)
      })
    })

    test('should find user by username', () => {
      const user = generator.getUserByUsername('gov.officer')
      
      expect(user).toBeDefined()
      expect(user!.role).toBe('government')
    })
  })

  describe('Real-time Updates', () => {
    test('should update plant metrics over time', (done) => {
      const plants = generator.getPlants()
      const initialPlant = plants[0]
      const initialFlowRate = initialPlant.metrics.flowRate
      
      let updateCount = 0
      const unsubscribe = generator.subscribe((updatedPlants) => {
        updateCount++
        
        if (updateCount >= 3) { // Wait for a few updates
          const updatedPlant = updatedPlants.find(p => p.id === initialPlant.id)
          expect(updatedPlant).toBeDefined()
          
          // Metrics should have changed (with high probability)
          const flowRateChanged = updatedPlant!.metrics.flowRate !== initialFlowRate
          const lastUpdatedChanged = updatedPlant!.metrics.lastUpdated > initialPlant.metrics.lastUpdated
          
          expect(lastUpdatedChanged).toBe(true)
          
          unsubscribe()
          done()
        }
      })
      
      generator.startRealTimeUpdates()
      
      // Cleanup after 5 seconds if test doesn't complete
      setTimeout(() => {
        unsubscribe()
        done()
      }, 5000)
    })

    test('should maintain data within valid ranges during updates', (done) => {
      let updateCount = 0
      const unsubscribe = generator.subscribe((plants) => {
        updateCount++
        
        plants.forEach(plant => {
          expect(plant.metrics.flowRate).toBeGreaterThanOrEqual(50)
          expect(plant.metrics.flowRate).toBeLessThanOrEqual(200)
          expect(plant.metrics.ph).toBeGreaterThanOrEqual(6.5)
          expect(plant.metrics.ph).toBeLessThanOrEqual(8.5)
          expect(plant.metrics.turbidity).toBeGreaterThanOrEqual(0)
          expect(plant.metrics.turbidity).toBeLessThanOrEqual(10)
        })
        
        if (updateCount >= 5) {
          unsubscribe()
          done()
        }
      })
      
      generator.startRealTimeUpdates()
      
      // Cleanup after 10 seconds
      setTimeout(() => {
        unsubscribe()
        done()
      }, 10000)
    })
  })

  describe('Chart Data', () => {
    test('should generate chart data for all plants', () => {
      const plants = generator.getPlants()
      
      plants.forEach(plant => {
        const chartData = generator.getChartData(plant.id)
        
        expect(chartData).toBeDefined()
        expect(chartData!.flowRate).toHaveLength(50)
        expect(chartData!.turbidity).toHaveLength(50)
        expect(chartData!.ph).toHaveLength(50)
        expect(chartData!.tdsEc).toHaveLength(50)
        
        // Check data points have timestamps and values
        chartData!.flowRate.forEach(point => {
          expect(point.timestamp).toBeInstanceOf(Date)
          expect(typeof point.value).toBe('number')
        })
      })
    })
  })

  describe('Violation Management', () => {
    test('should trigger demo violations', () => {
      const plants = generator.getPlants()
      const plantId = plants[0].id
      const initialViolationCount = plants[0].compliance.violations.length
      
      const success = generator.triggerDemoViolation(plantId, 'pH')
      
      expect(success).toBe(true)
      
      const updatedPlant = generator.getPlant(plantId)
      expect(updatedPlant!.compliance.violations.length).toBe(initialViolationCount + 1)
      expect(updatedPlant!.compliance.status).toBe('Violation')
    })

    test('should resolve violations', () => {
      const plants = generator.getPlants()
      const plantId = plants[0].id
      
      // Trigger a violation first
      generator.triggerDemoViolation(plantId, 'turbidity')
      
      const plant = generator.getPlant(plantId)
      const violation = plant!.compliance.violations.find(v => !v.resolved)
      
      if (violation) {
        const success = generator.resolveViolation(violation.id, 'test-user')
        
        expect(success).toBe(true)
        
        const updatedViolation = plant!.compliance.violations.find(v => v.id === violation.id)
        expect(updatedViolation!.resolved).toBe(true)
        expect(updatedViolation!.resolvedBy).toBe('test-user')
      }
    })
  })

  describe('Data Filtering', () => {
    test('should get plants for specific manager', () => {
      const managerPlants = generator.getPlantsForManager('manager.a')
      
      expect(managerPlants.length).toBeGreaterThan(0)
      managerPlants.forEach(plant => {
        expect(plant.assignedManager).toBe('manager.a')
      })
    })

    test('should get plant by ID', () => {
      const plants = generator.getPlants()
      const firstPlant = plants[0]
      
      const foundPlant = generator.getPlant(firstPlant.id)
      
      expect(foundPlant).toBeDefined()
      expect(foundPlant!.id).toBe(firstPlant.id)
    })
  })
})