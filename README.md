# Xandeum pNode Analytics Platform

A comprehensive real-time analytics dashboard for monitoring the Xandeum pNode network. Built for the [Superteam Bounty](https://earn.superteam.fun/listing/build-analytics-platform-for-xandeum-pnodes).

![Xandeum Analytics](https://img.shields.io/badge/Xandeum-Analytics-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Live Demo

**[https://xandeum-analytics-theta.vercel.app](https://xandeum-analytics-theta.vercel.app)**

## Features Overview

### Dashboard & Navigation
- **Modern Sidebar Navigation** - Collapsible sidebar with organized sections
- **Network Weather** - Visual health indicator (☀️ Sunny to ⛈️ Stormy)
- **Dark/Light Theme** - Toggle between themes
- **Mobile Responsive** - Works on all devices

### Real-Time Network Monitoring
- **Live pNode Data** - Direct connection to Xandeum pRPC endpoints
- **Pod Credits Integration** - Official reputation from `podcredits.xandeum.network`
- **Auto-Refresh** - Data updates every 30 seconds
- **All pNodes Tracked** - Complete network visibility

### Pages & Features

#### 🏠 Overview (Home)
- Hero stats (Total Nodes, Online, Avg X-Score, XAND Price)
- Network Weather indicator
- Interactive 3D Globe showing node distribution
- Quick access cards to all features

#### 📊 All Nodes (`/pnodes`)
- **Visual Summary** - X-Score distribution bars, Node Status breakdown
- **Clickable Rows** - Click any node for detailed view
- **Advanced Filtering** - By status, version, search by pubkey
- **Sortable Columns** - Sort by X-Score, credits, uptime, storage
- **Export** - CSV and JSON download options

#### 🌍 Global Map (`/map`)
- **3D Globe** - Interactive globe with node markers
- **2D Leaflet Map** - Detailed map view with clustering
- **Country Rankings** - Top countries by node count
- **IP Geolocation** - Automatic location detection

#### ⭐ My Nodes (`/my-nodes`) - NEW!
- **Personal Dashboard** - Save up to 20 favorite nodes
- **LocalStorage Persistence** - Data saved in browser
- **Health Risk Indicators** - Alerts for at-risk nodes
- **Quick Actions** - Remove, copy pubkey, view details

#### 📈 Network Stats (`/network`)
- **Network Health Score** - Overall health gauge
- **Status Distribution** - Donut chart visualization
- **Version Distribution** - Bar chart of software versions
- **Storage Analytics** - Network-wide storage metrics

#### 📜 Historical Data (`/history`)
- **Supabase Integration** - Historical snapshots stored
- **4 Tabs** - Status, Versions, Locations, Timeline
- **Trend Analysis** - View network changes over time

#### 💰 Token Analytics (`/token`)
- **XAND Price** - Live price from Jupiter/DexScreener
- **Embedded Chart** - DexScreener trading chart
- **Market Data** - Market cap, volume, liquidity, FDV

#### 💵 Earnings (`/earnings`) - NEW!
- **Earnings Estimator** - Calculate potential pNode earnings
- **ROI Calculator** - Profitability analysis
- **Version Tracker** - Shows outdated nodes needing updates

#### 🔄 Swap (`/swap`)
- **Jupiter Integration** - Swap SOL ↔ XAND directly
- **Embedded Widget** - Jupiter swap terminal

#### 🤖 AI Assistant (`/chat`)
- **XandBot** - AI-powered chat assistant
- **OpenAI Integration** - GPT-4o-mini for responses
- **Suggested Questions** - Quick prompts for common queries

#### 📱 Telegram Bot (`/telegram`)
- **@Xandeum_Atech_bot** - Telegram bot integration
- **Commands:**
  - `/network` - Network stats with weather indicator
  - `/price` - XAND price with full market data
  - `/top` - Leaderboard (top by X-Score & Credits)
  - `/search [pubkey]` - Find specific nodes
  - `/watch [pubkey]` - Monitor a node
  - `/status` - View watched nodes
  - `/alerts on/off` - Toggle notifications

### Individual Node Details (`/pnodes/[pubkey]`)
- **Identity Card** - Pubkey, address, version, status
- **Pod Credits** - Official credits with reputation tier
- **X-Score Breakdown** - Visual breakdown of score components
- **Status Distribution** - Donut chart of historical status
- **Storage Gauge** - Committed vs used visualization
- **7-Day Analytics** - Uptime %, credits growth, avg X-Score
- **Credits Explanation** - How credits and tiers work

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Data Fetching**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Maps**: Leaflet + React Globe.gl
- **Deployment**: Vercel

## Data Sources

### pRPC Endpoints (Port 6000)
Multiple public pNodes for redundancy - see `src/lib/prpc-client.ts`

### Pod Credits API
`https://podcredits.xandeum.network/api/pods-credits`

### Price Data
- Jupiter API for SOL price
- DexScreener API for XAND price and market data

## Local Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# Supabase (for historical data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# OpenAI (for AI chat)
OPENAI_API_KEY=your_openai_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

### Installation

```bash
# Clone the repository
git clone https://github.com/atechwebsol01/xandeum-analytics.git
cd xandeum-analytics

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run test       # Run tests with Vitest
```

## X-Score Calculation

| Factor | Max Points | Description |
|--------|------------|-------------|
| Pod Credits | 35 | Official reputation (scaled by credit amount) |
| Uptime | 25 | Days of continuous operation |
| Status | 25 | Online=25, Warning=15, Offline=0 |
| Storage | 10 | Storage commitment level |
| Public Access | 5 | Bonus for public pRPC exposure |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── pnodes/       # pNode data endpoint
│   │   ├── telegram/     # Telegram bot webhook
│   │   ├── chat/         # AI chat endpoint
│   │   └── token-price/  # Price data endpoint
│   ├── pnodes/           # All nodes & detail pages
│   ├── network/          # Network stats page
│   ├── map/              # Global map page
│   ├── history/          # Historical data page
│   ├── token/            # Token analytics page
│   ├── earnings/         # Earnings calculator page
│   ├── my-nodes/         # Personal node tracker
│   ├── chat/             # AI assistant page
│   ├── telegram/         # Telegram bot info page
│   └── page.tsx          # Home dashboard
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── sidebar.tsx       # Main navigation
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API clients
└── types/                # TypeScript definitions
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

## Contributing

Contributions welcome! Please submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- [Xandeum](https://xandeum.network) - Scalable storage layer for Solana
- [Superteam](https://superteam.fun) - Bounty organizers
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Vercel](https://vercel.com) - Hosting

---

Built with ❤️ for the Xandeum ecosystem
