# Xandeum pNode Analytics Platform

A comprehensive real-time analytics dashboard for monitoring the Xandeum pNode network. Built for the [Superteam Bounty](https://earn.superteam.fun/listing/build-analytics-platform-for-xandeum-pnodes).

![Xandeum Analytics](https://img.shields.io/badge/Xandeum-Analytics-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Live Demo

**[https://xandeum-analytics.vercel.app](https://xandeum-analytics.vercel.app)**

## Key Features

### Real-Time Network Monitoring
- **Live pNode Data** - Connects directly to Xandeum pRPC endpoints (port 6000)
- **Pod Credits Integration** - Official reputation system from `podcredits.xandeum.network`
- **Auto-Refresh** - Data updates every 30 seconds automatically
- **200+ pNodes Tracked** - Complete network visibility

### Interactive Global Map
- **Geographic Distribution** - Real-time map showing node locations worldwide
- **IP Geolocation** - Automatic location detection for all nodes
- **Status Indicators** - Color-coded markers (green=online, yellow=warning, red=offline)
- **Country Statistics** - Top 10 countries by node count
- **Click for Details** - Popup with node info on each marker

### Dashboard Analytics
- **Network Statistics** - Total nodes, online/offline rates, storage metrics
- **Pod Credits Leaderboard** - Top performers ranked by official credits
- **Version Distribution** - Visual breakdown of pNode software versions
- **Status Monitoring** - Real-time online/warning/offline status tracking
- **Network Health Score** - Overall network status at a glance

### Node Comparison Tool (Unique Feature)
- **Side-by-Side Comparison** - Compare any two nodes across all metrics
- **Winner Highlighting** - Visual indicators showing which node performs better
- **Quick Compare** - One-click comparison of top performers
- **7 Key Metrics** - Credits, X-Score, Uptime, Storage, Version, Public Access

### Data Management
- **CSV Export** - Download filtered node data as CSV
- **JSON Export** - Full data export in JSON format
- **Advanced Filtering** - Filter by status, version, search by pubkey/address
- **Sortable Columns** - Sort by credits, uptime, storage, last seen

### Individual Node Details
- **Full Node Profile** - Detailed view with all metrics
- **Pod Credits Display** - Official credits with reputation level
- **X-Score Rating** - Composite performance score (0-100)
- **Storage Analytics** - Committed vs used storage visualization
- **Network Info** - IP address, RPC port, public/private status

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Deployment**: Vercel

## Data Sources

### pRPC Endpoints (Port 6000)
The platform connects to multiple public pNodes for redundancy:
- `http://192.190.136.28:6000`
- `http://173.212.207.32:6000`
- `http://152.53.236.91:6000`
- And more...

**API Method**: `get-pods-with-stats`

### Pod Credits API
Official reputation data from:
- `https://podcredits.xandeum.network/api/pods-credits`

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/xandeum-analytics.git
cd xandeum-analytics

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run test       # Run tests with Vitest
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy - no environment variables required!

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## API Reference

### GET /api/pnodes

Returns all pNodes with their credits and computed metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "pubkey": "...",
        "address": "IP:PORT",
        "ip": "...",
        "port": 9001,
        "rpc_port": 6000,
        "version": "0.8.0",
        "is_public": true,
        "status": "online",
        "credits": 45000,
        "xScore": 85,
        "storage_committed": 340000000000,
        "storage_used": 1590,
        "storage_usage_percent": 0.0000004,
        "uptime": 539724,
        "last_seen_timestamp": 1766309562
      }
    ],
    "stats": {
      "totalNodes": 232,
      "onlineNodes": 180,
      "warningNodes": 30,
      "offlineNodes": 22,
      "publicNodes": 65,
      "privateNodes": 167,
      "totalStorageCommitted": 5000000000000,
      "totalStorageUsed": 100000,
      "averageUptime": 400000,
      "averageXScore": 65,
      "totalCredits": 10000000,
      "averageCredits": 43000,
      "versionDistribution": { "0.8.0": 200, "0.7.3": 32 }
    },
    "timestamp": 1766310000000,
    "creditsCount": 215
  }
}
```

## X-Score Calculation

The X-Score (0-100) is a composite metric calculated from:

| Factor | Max Points | Description |
|--------|------------|-------------|
| Pod Credits | 35 | Official reputation (0-10K: 20pts, 10K-50K: +15pts) |
| Uptime | 25 | Days of continuous operation |
| Availability | 25 | Based on last seen timestamp |
| Storage | 10 | Storage commitment and usage |
| Public Access | 5 | Bonus for public pRPC exposure |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/pnodes/        # API route for fetching data
│   ├── pnodes/            # pNodes listing and detail pages
│   ├── analytics/         # Analytics charts page
│   └── page.tsx           # Main dashboard
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   ├── ui/               # shadcn/ui components
│   └── providers/        # React Query provider
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API clients
│   ├── prpc-client.ts    # pRPC API client
│   ├── export.ts         # CSV/JSON export utilities
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- [Xandeum](https://xandeum.network) - The scalable storage layer for Solana
- [Superteam](https://superteam.fun) - For organizing this bounty
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Vercel](https://vercel.com) - Hosting platform

---

Built with ❤️ for the Xandeum ecosystem
