import { Plant, User, Violation, Fine, PlantChartData, ChartDataPoint } from '@/types'
import { DATA_RANGES, PLANT_STATUS, COMPLIANCE_STATUS, VIOLATION_TYPES, VIOLATION_SEVERITY } from '@/utils/constants'
import { randomInRange, randomIntInRange, clamp } from '@/utils/helpers'

/**
 * PlantDataGenerator - Generates realistic mock data for sewage treatment plants
 * Includes real-time data updates, violations, and user authentication data
 */
export class PlantDataGenerator {
  private plants: Plant[] = []
  private users: User[] = []
  private chartData: Map<string, PlantChartData> = new Map()
  private updateInterval: NodeJS.Timeout | null = null
  private subscribers: Set<(plants: Plant[]) => void> = new Set()

  constructor() {
    this.initializePlants()
    this.initializeUsers()
    this.initializeChartData()
  }

  /**
   * Initialize mock plants with realistic data
   */
  private initializePlants(): void {
    const plantConfigs = [
      { id: 'plant-a', name: 'Colony A STP', location: 'Sector 15, Gurgaon', manager: 'manager.a' },
      { id: 'plant-b', name: 'Colony B STP', location: 'Sector 22, Noida', manager: 'manager.b' },
      { id: 'plant-c', name: 'Colony C STP', location: 'Sector 8, Faridabad', manager: 'manager.c' },
      { id: 'plant-d', name: 'Colony D STP', location: 'Sector 12, Ghaziabad', manager: 'manager.d' },
      { id: 'plant-e', name: 'Colony E STP', location: 'Sector 5, Greater Noida', manager: 'manager.e' },
    ]

    this.plants = plantConfigs.map(config => this.createPlant(config))
  }

  /**
   * Create a single plant with realistic initial data
   */
  private createPlant(config: { id: string; name: string; location: string; manager: string }): Plant {
    const now = new Date()
    
    // Generate realistic base values for this plant
    const baseFlowRate = randomInRange(DATA_RANGES.flowRate.min, DATA_RANGES.flowRate.max)
    const basePh = randomInRange(DATA_RANGES.ph.min, DATA_RANGES.ph.max)
    const baseTurbidity = randomInRange(DATA_RANGES.turbidity.min, DATA_RANGES.turbidity.max)
    const baseTdsEc = randomInRange(DATA_RANGES.tdsEc.min, DATA_RANGES.tdsEc.max)
    
    // Determine plant status with weighted probability
    const statusRandom = Math.random()
    let status: Plant['status']
    if (statusRandom < 0.7) status = 'Running'
    else if (statusRandom < 0.9) status = 'Idle'
    else status = 'Fault'

    // Generate violations based on plant status
    const violations = this.generateViolations(config.id, status)
    
    // Determine compliance status based on violations and plant status
    let complianceStatus: 'Compliant' | 'Warning' | 'Violation'
    if (status === 'Fault' || violations.some(v => v.severity === 'high')) {
      complianceStatus = 'Violation'
    } else if (status === 'Idle' || violations.some(v => v.severity === 'medium')) {
      complianceStatus = 'Warning'
    } else {
      complianceStatus = 'Compliant'
    }

    return {
      id: config.id,
      name: config.name,
      location: {
        address: config.location,
        coordinates: [
          28.4595 + randomInRange(-0.5, 0.5), // Delhi NCR latitude range
          77.0266 + randomInRange(-0.5, 0.5)  // Delhi NCR longitude range
        ]
      },
      status,
      metrics: {
        flowRate: baseFlowRate,
        turbidity: baseTurbidity,
        tdsEc: baseTdsEc,
        ph: basePh,
        uptime: randomInRange(18, 24),
        treatedVolume: randomInRange(DATA_RANGES.treatedVolume.min, DATA_RANGES.treatedVolume.max),
        lastUpdated: now
      },
      compliance: {
        status: complianceStatus,
        violations,
        fines: this.generateFines(config.id, violations)
      },
      assignedManager: config.manager,
      qrCode: `https://flowforward.app/public/${config.id}`
    }
  }

  /**
   * Generate realistic violations for a plant
   */
  private generateViolations(plantId: string, status: Plant['status']): Violation[] {
    const violations: Violation[] = []
    const violationCount = status === 'Fault' ? randomIntInRange(2, 4) : 
                          status === 'Idle' ? randomIntInRange(0, 2) : 
                          randomIntInRange(0, 1)

    const violationTypes = Object.values(VIOLATION_TYPES)
    const severityLevels = Object.values(VIOLATION_SEVERITY)

    for (let i = 0; i < violationCount; i++) {
      const type = violationTypes[randomIntInRange(0, violationTypes.length - 1)] as keyof typeof VIOLATION_TYPES
      const severity = status === 'Fault' ? 'high' : 
                      status === 'Idle' ? (Math.random() > 0.5 ? 'medium' : 'low') :
                      'low'

      violations.push({
        id: `violation-${plantId}-${i + 1}`,
        plantId,
        type,
        severity: severity as 'low' | 'medium' | 'high',
        description: this.getViolationDescription(type, severity as 'low' | 'medium' | 'high'),
        timestamp: new Date(Date.now() - randomIntInRange(1, 72) * 60 * 60 * 1000), // 1-72 hours ago
        resolved: Math.random() > 0.7, // 30% chance of being resolved
        resolvedBy: Math.random() > 0.5 ? 'system' : undefined
      })
    }

    return violations
  }

  /**
   * Generate violation descriptions based on type and severity
   */
  private getViolationDescription(type: string, severity: string): string {
    const descriptions = {
      pH: {
        low: 'pH levels slightly outside optimal range (6.5-8.5)',
        medium: 'pH levels significantly deviated from standards',
        high: 'Critical pH violation - immediate attention required'
      },
      turbidity: {
        low: 'Turbidity readings above normal levels',
        medium: 'High turbidity affecting treatment efficiency',
        high: 'Critical turbidity levels - treatment failure risk'
      },
      flow: {
        low: 'Flow rate below optimal capacity',
        medium: 'Significant flow rate deviation detected',
        high: 'Critical flow rate failure - system overload'
      },
      maintenance: {
        low: 'Routine maintenance overdue',
        medium: 'Equipment maintenance required',
        high: 'Critical equipment failure - immediate maintenance needed'
      }
    }

    return descriptions[type as keyof typeof descriptions]?.[severity as keyof typeof descriptions.pH] || 
           'Unknown violation detected'
  }

  /**
   * Generate fines based on violations
   */
  private generateFines(plantId: string, violations: Violation[]): Fine[] {
    const fines: Fine[] = []
    
    violations.forEach((violation, index) => {
      if (violation.severity === 'high' || (violation.severity === 'medium' && Math.random() > 0.5)) {
        const amount = violation.severity === 'high' ? randomIntInRange(50000, 200000) :
                      violation.severity === 'medium' ? randomIntInRange(10000, 50000) :
                      randomIntInRange(2000, 10000)

        fines.push({
          id: `fine-${plantId}-${index + 1}`,
          plantId,
          amount,
          reason: violation.description,
          dateIssued: new Date(violation.timestamp.getTime() + 24 * 60 * 60 * 1000), // 1 day after violation
          status: Math.random() > 0.7 ? 'paid' : Math.random() > 0.5 ? 'pending' : 'disputed'
        })
      }
    })

    return fines
  }

  /**
   * Initialize mock users with role assignments
   */
  private initializeUsers(): void {
    this.users = [
      {
        id: 'gov-officer-1',
        username: 'gov.officer',
        role: 'government',
        name: 'Dr. Rajesh Kumar',
        permissions: [
          { resource: 'plants', actions: ['read', 'write', 'delete'] },
          { resource: 'users', actions: ['read', 'write'] },
          { resource: 'reports', actions: ['read', 'write'] },
          { resource: 'violations', actions: ['read', 'write'] }
        ]
      },
      {
        id: 'manager-a',
        username: 'manager.a',
        role: 'plant_manager',
        name: 'Aaryansh Singh',
        assignedPlants: ['plant-a'],
        permissions: [
          { resource: 'plants', actions: ['read', 'write'] },
          { resource: 'reports', actions: ['read'] },
          { resource: 'violations', actions: ['read', 'write'] }
        ]
      },
      {
        id: 'manager-b',
        username: 'manager.b',
        role: 'plant_manager',
        name: 'Amit Singh',
        assignedPlants: ['plant-b'],
        permissions: [
          { resource: 'plants', actions: ['read', 'write'] },
          { resource: 'reports', actions: ['read'] },
          { resource: 'violations', actions: ['read', 'write'] }
        ]
      },
      {
        id: 'manager-c',
        username: 'manager.c',
        role: 'plant_manager',
        name: 'Sunita Patel',
        assignedPlants: ['plant-c'],
        permissions: [
          { resource: 'plants', actions: ['read', 'write'] },
          { resource: 'reports', actions: ['read'] },
          { resource: 'violations', actions: ['read', 'write'] }
        ]
      },
      {
        id: 'manager-d',
        username: 'manager.d',
        role: 'plant_manager',
        name: 'Vikram Gupta',
        assignedPlants: ['plant-d'],
        permissions: [
          { resource: 'plants', actions: ['read', 'write'] },
          { resource: 'reports', actions: ['read'] },
          { resource: 'violations', actions: ['read', 'write'] }
        ]
      },
      {
        id: 'manager-e',
        username: 'manager.e',
        role: 'plant_manager',
        name: 'Meera Joshi',
        assignedPlants: ['plant-e'],
        permissions: [
          { resource: 'plants', actions: ['read', 'write'] },
          { resource: 'reports', actions: ['read'] },
          { resource: 'violations', actions: ['read', 'write'] }
        ]
      }
    ]
  }

  /**
   * Initialize chart data for all plants
   */
  private initializeChartData(): void {
    this.plants.forEach(plant => {
      const chartData: PlantChartData = {
        flowRate: [],
        turbidity: [],
        ph: [],
        tdsEc: []
      }

      // Generate initial 50 data points for charts (last 50 seconds)
      const now = Date.now()
      for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now - i * 1000)
        
        chartData.flowRate.push({
          timestamp,
          value: plant.metrics.flowRate + randomInRange(-5, 5)
        })
        
        chartData.turbidity.push({
          timestamp,
          value: clamp(plant.metrics.turbidity + randomInRange(-1, 1), 0, 15)
        })
        
        chartData.ph.push({
          timestamp,
          value: clamp(plant.metrics.ph + randomInRange(-0.2, 0.2), 6.0, 9.0)
        })
        
        chartData.tdsEc.push({
          timestamp,
          value: clamp(plant.metrics.tdsEc + randomInRange(-20, 20), 100, 1000)
        })
      }

      this.chartData.set(plant.id, chartData)
    })
  }

  /**
   * Start real-time data updates
   */
  public startRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(() => {
      this.updatePlantData()
      this.notifySubscribers()
    }, 1000) // Update every second
  }

  /**
   * Stop real-time data updates
   */
  public stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Update plant data with realistic variations
   */
  private updatePlantData(): void {
    const now = new Date()

    this.plants.forEach(plant => {
      // Update metrics with realistic variations
      const flowVariation = randomInRange(-2, 2)
      const turbidityVariation = randomInRange(-0.5, 0.5)
      const phVariation = randomInRange(-0.1, 0.1)
      const tdsEcVariation = randomInRange(-10, 10)

      plant.metrics.flowRate = clamp(
        plant.metrics.flowRate + flowVariation,
        DATA_RANGES.flowRate.min,
        DATA_RANGES.flowRate.max
      )

      plant.metrics.turbidity = clamp(
        plant.metrics.turbidity + turbidityVariation,
        DATA_RANGES.turbidity.min,
        DATA_RANGES.turbidity.max
      )

      plant.metrics.ph = clamp(
        plant.metrics.ph + phVariation,
        DATA_RANGES.ph.min,
        DATA_RANGES.ph.max
      )

      plant.metrics.tdsEc = clamp(
        plant.metrics.tdsEc + tdsEcVariation,
        DATA_RANGES.tdsEc.min,
        DATA_RANGES.tdsEc.max
      )

      // Update treated volume (cumulative)
      plant.metrics.treatedVolume += plant.metrics.flowRate / 60 // Convert L/min to L/second

      // Update uptime
      if (plant.status === 'Running') {
        plant.metrics.uptime += 1/3600 // Add 1 second in hours
      }

      plant.metrics.lastUpdated = now

      // Update chart data
      const chartData = this.chartData.get(plant.id)
      if (chartData) {
        // Add new data points
        chartData.flowRate.push({ timestamp: now, value: plant.metrics.flowRate })
        chartData.turbidity.push({ timestamp: now, value: plant.metrics.turbidity })
        chartData.ph.push({ timestamp: now, value: plant.metrics.ph })
        chartData.tdsEc.push({ timestamp: now, value: plant.metrics.tdsEc })

        // Keep only last 50 data points
        if (chartData.flowRate.length > 50) {
          chartData.flowRate.shift()
          chartData.turbidity.shift()
          chartData.ph.shift()
          chartData.tdsEc.shift()
        }
      }

      // Occasionally change plant status (very rarely)
      if (Math.random() < 0.001) { // 0.1% chance per second
        const statuses: Plant['status'][] = ['Running', 'Idle', 'Fault']
        plant.status = statuses[randomIntInRange(0, statuses.length - 1)]
      }
    })
  }

  /**
   * Subscribe to plant data updates
   */
  public subscribe(callback: (plants: Plant[]) => void): () => void {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Notify all subscribers of data updates
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback([...this.plants]) // Send a copy to prevent mutations
    })
  }

  /**
   * Get all plants
   */
  public getPlants(): Plant[] {
    return [...this.plants]
  }

  /**
   * Get plant by ID
   */
  public getPlant(id: string): Plant | undefined {
    return this.plants.find(plant => plant.id === id)
  }

  /**
   * Get plants for a specific manager
   */
  public getPlantsForManager(managerId: string): Plant[] {
    return this.plants.filter(plant => plant.assignedManager === managerId)
  }

  /**
   * Get all users
   */
  public getUsers(): User[] {
    return [...this.users]
  }

  /**
   * Get user by username
   */
  public getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username)
  }

  /**
   * Get chart data for a plant
   */
  public getChartData(plantId: string): PlantChartData | undefined {
    return this.chartData.get(plantId)
  }

  /**
   * Manually trigger a violation for demo purposes
   */
  public triggerDemoViolation(plantId: string, type: keyof typeof VIOLATION_TYPES): boolean {
    const plant = this.plants.find(p => p.id === plantId)
    if (!plant) return false

    const violation: Violation = {
      id: `demo-violation-${Date.now()}`,
      plantId,
      type,
      severity: 'high',
      description: `Demo ${type} violation triggered manually`,
      timestamp: new Date(),
      resolved: false
    }

    plant.compliance.violations.push(violation)
    plant.compliance.status = 'Violation'
    plant.status = 'Fault'

    this.notifySubscribers()
    return true
  }

  /**
   * Resolve a violation
   */
  public resolveViolation(violationId: string, resolvedBy: string): boolean {
    for (const plant of this.plants) {
      const violation = plant.compliance.violations.find(v => v.id === violationId)
      if (violation) {
        violation.resolved = true
        violation.resolvedBy = resolvedBy
        
        // Update compliance status if no more unresolved high-severity violations
        const hasUnresolvedHighViolations = plant.compliance.violations.some(
          v => !v.resolved && v.severity === 'high'
        )
        
        if (!hasUnresolvedHighViolations) {
          plant.compliance.status = 'Compliant'
          plant.status = 'Running'
        }

        this.notifySubscribers()
        return true
      }
    }
    return false
  }
}

// Create singleton instance
export const plantDataGenerator = new PlantDataGenerator()