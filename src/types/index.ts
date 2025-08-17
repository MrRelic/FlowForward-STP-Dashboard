// Core data models for the STP Dashboard System

export interface Plant {
  id: string;
  name: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  status: 'Running' | 'Idle' | 'Fault';
  metrics: {
    flowRate: number; // L/min
    turbidity: number; // NTU
    tdsEc: number; // ppm
    ph: number;
    uptime: number; // hours
    treatedVolume: number; // L
    lastUpdated: Date;
  };
  compliance: {
    status: 'Compliant' | 'Warning' | 'Violation';
    violations: Violation[];
    fines: Fine[];
  };
  assignedManager?: string;
  qrCode: string;
}

export interface User {
  id: string;
  username: string;
  role: 'government' | 'plant_manager';
  assignedPlants?: string[]; // For plant managers
  permissions: Permission[];
  name: string;
}

export interface Violation {
  id: string;
  plantId: string;
  type: 'pH' | 'turbidity' | 'flow' | 'maintenance';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
}

export interface Fine {
  id: string;
  plantId: string;
  amount: number;
  reason: string;
  dateIssued: Date;
  status: 'pending' | 'paid' | 'disputed';
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PlantMetrics {
  flowRate: number;
  turbidity: number;
  tdsEc: number;
  ph: number;
  uptime: number;
  treatedVolume: number;
  lastUpdated: Date;
}

export interface ComplianceStatus {
  status: 'Compliant' | 'Warning' | 'Violation';
  violations: Violation[];
  fines: Fine[];
}

// Chart data interfaces for real-time visualization
export interface ChartDataPoint {
  timestamp: Date;
  value: number;
}

export interface PlantChartData {
  flowRate: ChartDataPoint[];
  turbidity: ChartDataPoint[];
  ph: ChartDataPoint[];
  tdsEc: ChartDataPoint[];
}

// Filter interfaces for dashboard functionality
export interface PlantFilter {
  location?: string;
  status?: Plant['status'];
  complianceStatus?: ComplianceStatus['status'];
  violationCount?: {
    min?: number;
    max?: number;
  };
}

// Public data interface for resident view (sanitized)
export interface PublicPlantData {
  id: string;
  name: string;
  location: {
    address: string;
  };
  status: 'Running' | 'Idle' | 'Maintenance';
  publicMetrics: {
    uptime: number;
    treatedVolume: number;
    lastUpdated: Date;
  };
  complianceBadge: 'Good' | 'Fair' | 'Needs Attention';
  weekSummary: {
    averageUptime: number;
    totalTreatedVolume: number;
    complianceRate: number;
  };
}