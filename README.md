# STP Dashboard - Sewage Treatment Plant Management System

A modern, responsive web dashboard for monitoring and managing multiple sewage treatment plants with role-based access control and public transparency features.

## Features

### 🏛️ Government Officer Dashboard
- **Complete System Overview**: Monitor all treatment plants from a single dashboard
- **Advanced Filtering**: Filter plants by location, compliance status, and violation count
- **Real-time Monitoring**: Live status updates every second with color-coded indicators
- **Compliance Tracking**: View violations, fines, and historical compliance data
- **Interactive Charts**: Real-time data visualization for all key metrics

### 🏭 Plant Manager Dashboard
- **Single Plant Focus**: Access restricted to assigned treatment plant only
- **Operational Controls**: Full control over plant settings and parameters
- **Alert Management**: View, manage, and resolve plant alerts and violations
- **Report Generation**: Download detailed reports for plant performance
- **Real-time Charts**: Interactive monitoring of flow rate, pH, turbidity, and TDS/EC

### 🏠 Resident Public Access
- **QR Code Access**: Scan plant-specific QR codes for instant information
- **No Login Required**: Direct access to public plant information
- **Transparency Features**: View compliance status, uptime, and treated water volume
- **7-Day Summary**: Historical performance overview for accountability
- **Mobile Optimized**: Responsive design for smartphone access

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Chart.js with React integration
- **QR Codes**: QRCode library for generating plant-specific codes
- **Icons**: Lucide React for consistent iconography
- **Data**: Mock data service with realistic patterns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stp-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

**Government Officer:**
- Username: `gov.officer`
- Password: `government123`

**Plant Manager (Colony A):**
- Username: `manager.a`
- Password: `manager123`

**Plant Manager (Colony B):**
- Username: `manager.b`
- Password: `manager123`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # Reusable UI components
│       ├── Button.tsx    # Button component with variants
│       ├── Card.tsx      # Card container component
│       └── StatusBadge.tsx # Status indicator component
├── types/                # TypeScript type definitions
│   └── index.ts          # Core data models and interfaces
└── utils/                # Utility functions and constants
    ├── constants.ts      # Application constants
    └── helpers.ts        # Helper functions
```

## Key Features

### 🔒 Role-Based Security
- **Government Officers**: Full access to all plants and administrative features
- **Plant Managers**: Restricted access to assigned plants only
- **Residents**: Public access via QR codes without authentication

### 📊 Real-Time Monitoring
- **Live Data Updates**: Metrics refresh every second
- **Interactive Charts**: Zoom, hover, and real-time data visualization
- **Status Indicators**: Color-coded plant status (Green/Yellow/Red)
- **Alert System**: Immediate notification of violations and issues

### 🌐 Responsive Design
- **Mobile First**: Optimized for smartphones and tablets
- **Progressive Web App**: Installable on mobile devices
- **Touch Friendly**: Large buttons and touch-optimized interactions
- **Cross Browser**: Compatible with modern browsers

### 🔍 Transparency & Accountability
- **QR Code System**: Easy public access to plant information
- **Compliance Tracking**: Historical violation and fine records
- **Public Dashboards**: Sanitized data for resident viewing
- **Performance Metrics**: Clear indicators of treatment effectiveness

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run test suite

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (recommended)
- **Tailwind CSS**: Utility-first styling approach

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for transparent and accountable water treatment management**