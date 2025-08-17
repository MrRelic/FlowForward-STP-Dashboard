// Application constants and configuration

export const APP_CONFIG = {
  name: 'STP Dashboard',
  version: '1.0.0',
  description: 'Sewage Treatment Plant Management System',
  updateInterval: 1000, // 1 second for real-time updates
} as const

export const USER_ROLES = {
  GOVERNMENT: 'government',
  PLANT_MANAGER: 'plant_manager',
} as const

export const PLANT_STATUS = {
  RUNNING: 'Running',
  IDLE: 'Idle',
  FAULT: 'Fault',
} as const

export const COMPLIANCE_STATUS = {
  COMPLIANT: 'Compliant',
  WARNING: 'Warning',
  VIOLATION: 'Violation',
} as const

export const VIOLATION_TYPES = {
  PH: 'pH',
  TURBIDITY: 'turbidity',
  FLOW: 'flow',
  MAINTENANCE: 'maintenance',
} as const

export const VIOLATION_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

// Data ranges for mock data generation
export const DATA_RANGES = {
  flowRate: { min: 50, max: 200 }, // L/min
  turbidity: { min: 0, max: 10 }, // NTU
  tdsEc: { min: 200, max: 800 }, // ppm
  ph: { min: 6.5, max: 8.5 },
  uptime: { min: 0, max: 24 }, // hours
  treatedVolume: { min: 1000, max: 50000 }, // L
} as const

// Color scheme for status indicators
export const STATUS_COLORS = {
  success: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-200',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  danger: {
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    border: 'border-danger-200',
  },
} as const

// Chart configuration
export const CHART_CONFIG = {
  maxDataPoints: 50, // Maximum number of data points to keep in memory
  updateInterval: 1000, // Chart update interval in milliseconds
  colors: {
    flowRate: '#3b82f6',
    turbidity: '#10b981',
    ph: '#f59e0b',
    tdsEc: '#ef4444',
  },
} as const

// QR Code configuration
export const QR_CONFIG = {
  size: 200,
  margin: 2,
  errorCorrectionLevel: 'M' as const,
  type: 'image/png' as const,
} as const

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const