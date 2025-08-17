import { User, AuthState } from '@/types'
import { plantDataGenerator } from './PlantDataGenerator'

/**
 * AuthService - Handles user authentication and session management
 * Uses mock data for demonstration purposes
 */
export class AuthService {
  private static readonly STORAGE_KEY = 'stp_auth_user'
  private static readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

  /**
   * Mock credentials for demo purposes
   */
  private static readonly MOCK_CREDENTIALS = {
    'gov.officer': 'government123',
    'manager.a': 'manager123',
    'manager.b': 'manager123',
    'manager.c': 'manager123',
    'manager.d': 'manager123',
    'manager.e': 'manager123'
  }

  /**
   * Authenticate user with username and password
   */
  public static async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check credentials
      const expectedPassword = this.MOCK_CREDENTIALS[username as keyof typeof this.MOCK_CREDENTIALS]
      if (!expectedPassword || expectedPassword !== password) {
        return {
          success: false,
          error: 'Invalid username or password'
        }
      }

      // Get user data
      const user = plantDataGenerator.getUserByUsername(username)
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        }
      }

      // Store session
      const sessionData = {
        user,
        loginTime: Date.now(),
        expiresAt: Date.now() + this.SESSION_TIMEOUT
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData))

      return {
        success: true,
        user
      }
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      }
    }
  }

  /**
   * Logout user and clear session
   */
  public static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Get current authenticated user
   */
  public static getCurrentUser(): User | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.logout()
        return null
      }

      return session.user
    } catch (error) {
      // Clear invalid session data
      this.logout()
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  public static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  /**
   * Check if user has specific permission
   */
  public static hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    return user.permissions.some(permission => 
      permission.resource === resource && permission.actions.includes(action)
    )
  }

  /**
   * Check if user can access specific plant
   */
  public static canAccessPlant(plantId: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Government officers can access all plants
    if (user.role === 'government') return true

    // Plant managers can only access their assigned plants
    if (user.role === 'plant_manager') {
      return user.assignedPlants?.includes(plantId) || false
    }

    return false
  }

  /**
   * Get user's accessible plants
   */
  public static getAccessiblePlants(): string[] {
    const user = this.getCurrentUser()
    if (!user) return []

    // Government officers can access all plants
    if (user.role === 'government') {
      return plantDataGenerator.getPlants().map(plant => plant.id)
    }

    // Plant managers can only access their assigned plants
    if (user.role === 'plant_manager') {
      return user.assignedPlants || []
    }

    return []
  }

  /**
   * Refresh session expiry
   */
  public static refreshSession(): boolean {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return false

      const session = JSON.parse(sessionData)
      
      // Check if session is still valid
      if (Date.now() > session.expiresAt) {
        this.logout()
        return false
      }

      // Extend session
      session.expiresAt = Date.now() + this.SESSION_TIMEOUT
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
      
      return true
    } catch (error) {
      this.logout()
      return false
    }
  }

  /**
   * Get session time remaining in milliseconds
   */
  public static getSessionTimeRemaining(): number {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return 0

      const session = JSON.parse(sessionData)
      const remaining = session.expiresAt - Date.now()
      
      return Math.max(0, remaining)
    } catch (error) {
      return 0
    }
  }

  /**
   * Check if session will expire soon (within 30 minutes)
   */
  public static isSessionExpiringSoon(): boolean {
    const remaining = this.getSessionTimeRemaining()
    return remaining > 0 && remaining < 30 * 60 * 1000 // 30 minutes
  }

  /**
   * Validate password strength (for future use)
   */
  public static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Authentication hook for React components
 */
export const useAuth = () => {
  const getCurrentUser = () => AuthService.getCurrentUser()
  const isAuthenticated = () => AuthService.isAuthenticated()
  const hasPermission = (resource: string, action: string) => AuthService.hasPermission(resource, action)
  const canAccessPlant = (plantId: string) => AuthService.canAccessPlant(plantId)
  const getAccessiblePlants = () => AuthService.getAccessiblePlants()
  const logout = () => AuthService.logout()
  const refreshSession = () => AuthService.refreshSession()
  const getSessionTimeRemaining = () => AuthService.getSessionTimeRemaining()
  const isSessionExpiringSoon = () => AuthService.isSessionExpiringSoon()

  return {
    getCurrentUser,
    isAuthenticated,
    hasPermission,
    canAccessPlant,
    getAccessiblePlants,
    logout,
    refreshSession,
    getSessionTimeRemaining,
    isSessionExpiringSoon,
    login: AuthService.login
  }
}