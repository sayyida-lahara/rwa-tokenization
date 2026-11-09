# AssetX — Real World Asset (RWA) Tokenization Marketplace

A complete, production-quality frontend for an institutional Real World Asset (RWA) Tokenization Marketplace inspired by **Getgems.io**'s sleek Web3 browsing experience, NFT-style asset cards, collection discovery, asset details, and wallet interactions, adapted specifically for fractional Real World Asset tokenization.

Built with **React**, **TypeScript**, **Vite**, **Bun**, **Tailwind CSS**, **React Router v7**, **Lucide React**, **Framer Motion**, and **Recharts**.

---

## 💎 Design System & Aesthetic

- **Background:** `#0B1020`
- **Card Background:** `#151D30`
- **Primary Accent:** Electric Blue (`#00E5FF` / `#3B82F6`)
- **Secondary Accent:** Emerald Green (`#10B981`)
- **Typography:** Space Grotesk (Headings), Inter (Body)
- **Visuals:** High-resolution architectural photography, subtle rounded borders, glowing badges, smooth transitions, and responsive charts.

---

## 🚀 Key Features

### 1. Public Marketplace & Browsing
- **Homepage (`/`)**:
  - Hero headline: *"Own a Piece of the Real World."*
  - Key platform statistics: Total Assets ($358.5M), Investors (14,800+), Tokens Issued (4.62M).
  - Featured institutional property cards with live yield indicators.
  - Category cards (Commercial, Residential, Gold, Logistics, Clean Energy).
  - 5-step *"How It Works"* flow and interactive FAQ accordions.
- **Explore Marketplace (`/explore`)**:
  - Full-featured search by name, city, country, or category.
  - Interactive Filter Sidebar: Category, min/max investment sliders, max valuation, location dropdown, investment status, and verification status.
  - Sorting: Recently Listed, Lowest/Highest Token Price, Highest Valuation, Highest Yield (APY), and Most Popular.
  - Grid View & List View toggles with live counter and clear filters action.
- **Asset Details (`/asset/:id`)**:
  - Multi-image gallery with active thumbnail selector.
  - Key metrics ribbon (Valuation, Supply, Token Price, Available Tokens, Min Investment, APY).
  - Interactive sticky **Invest Now Panel** with real-time token quantity calculations, 0.5% protocol fee calculation, and validation.
  - Tabs: Overview & Highlights, Financial & Rental Income Breakdown, Specifications, Legal Due Diligence PDFs, Blockchain Contract info, and On-Chain Transaction history.
  - Interactive Recharts charts: **Valuation History Line Chart** and **Token Distribution Pie Chart**.
  - Share modal (Direct copy, X/Twitter, Telegram) & Watchlist toggle.

### 2. Complete Simulated Web3 Wallet & Investment Engine
- **Simulated Wallet (`WalletModal`)**:
  - Supports MetaMask, WalletConnect, and Instant Demo Wallet ($145k USDC pre-funded).
  - Switch networks: Polygon PoS, Ethereum Mainnet, Arbitrum.
  - Shortened address display, balance tracking, and disconnect functionality.
- **Simulated 8-Step Investment Flow (`InvestModal`)**:
  1. Click *"Invest Now"*.
  2. Modal opens with asset details.
  3. Select token quantity with quick presets (+1, -1, +5, -5, Min, 25, 50, 100).
  4. Real-time subtotal, 0.5% fee, and total calculation with minimum investment validation.
  5. Review investment order details.
  6. Confirm simulated order.
  7. Updates available token supply, investor token holdings, portfolio valuation, and transaction ledger.
  8. Triggers celebratory confetti and displays transaction receipt with verifiable tx hash `0x8f2a...`.
  9. Persists all changes directly into `localStorage`.

### 3. Investor Portal
- **Dashboard (`/investor/dashboard`)**:
  - Portfolio metrics: Total Portfolio Value, Total Invested, Assets Owned, Tokens Held, and Net Return.
  - Interactive Recharts: **Portfolio Valuation Performance Area Chart** and **Sector Asset Allocation Donut Chart**.
  - My Asset Holdings table with live gain/loss and *"Buy More"* action.
  - Recent simulated transactions list with copyable tx hashes.
- **My Investments (`/investor/investments`)**: Comprehensive card grid of all acquired assets, token holdings, and dividend distribution schedules.
- **Portfolio Analytics (`/investor/portfolio`)**: Sector breakdown, asset-wise comparison bar charts, and annual yield projections.
- **Transaction History (`/investor/transactions`)**: Full ledger with filters by type (Purchase, Distribution, Sale), status, and simulated CSV export.
- **Watchlist (`/investor/watchlist`)**: Saved assets list stored in `localStorage`.
- **Profile Settings (`/investor/settings`)**: Investor KYC tier (Institutional), connected address, notification preferences, and demo reset button.

### 4. Asset Issuer Console
- **Issuer Dashboard (`/issuer/dashboard`)**:
  - Statistics: Total Submitted, Approved, Pending Verification, and Rejected.
  - Asset management table with live status badges.
- **Tokenize an Asset Wizard (`/issuer/tokenize`)**:
  - 5-step wizard with validation:
    1. *Basic Information* (Name, Category, Location, Description).
    2. *Valuation & Token Structure* (Valuation, Token Price, Auto Supply calculation, Min Ticket, Target APY).
    3. *Document Due Diligence Upload* (Mock upload for Appraisal, SPV Registration, Title deeds).
    4. *Ownership & Legal Structure* (Issuer, SPV entity, custody details).
    5. *Review & Submission* (Generates submission ID `RWA-SUB-XXXX` and puts asset in Pending status).
- **My Listed Assets (`/issuer/assets`)**: Asset grid showing funding progress.
- **Submission Status Tracker (`/issuer/status`)**: Stage tracker with compliance review notes and feedback.

### 5. Admin Compliance Command
- **Admin Dashboard (`/admin/dashboard`)**:
  - Total Registered Users, Total Listed Assets, Pending Approvals, Total Tokens, and Marketplace Volume.
- **Asset Verification (`/admin/verification`)**:
  - Review submitted assets and uploaded due diligence documents.
  - **Approve Asset**: Immediately approves asset, updates status, and makes it visible across the public marketplace!
  - **Reject Asset**: Rejects with custom feedback reason.
  - Updates `localStorage` reactively.
- **User Management (`/admin/users`)**:
  - List of registered users, roles, wallet addresses, and KYC levels.
  - Admin modal to toggle account status (*Active*, *Pending KYC*, *Suspended*).
- **Marketplace Management (`/admin/marketplace`)**:
  - Protocol transaction fee settings (0.50%).
  - Minimum asset valuation threshold.
  - Settlement chain and KYC oracle configuration.
  - Emergency circuit breaker pause switch.

---

## 👥 Demo Personas & Instant Switcher

You can switch personas at any time using the **Switch Persona** button in the navbar, user profile dropdown, or sidebar:

| Persona | Demo Account Email | Role & Access |
|---|---|---|
| **Institutional Investor** | `investor@assetx.demo` | Full access to browse, invest USDC, view holdings, and monitor portfolio. |
| **Asset Issuer / Sponsor** | `issuer@assetx.demo` | Access to 5-stage tokenization wizard, listed asset tracker, and submission status. |
| **Compliance Admin** | `admin@assetx.demo` | Review submitted assets, approve/reject offerings, audit users, and manage marketplace. |

---

## 📁 Project Structure

```
├── app/
│   ├── app.css                   # Custom theme & Web3 scrollbars
│   ├── root.tsx                  # Root layout, Google Fonts, HydrateFallback, AppProviders
│   ├── routes.ts                 # React Router v7 RouteConfig mapping all 22 routes
│   └── routes/                   # Route module wrappers for Public, Investor, Issuer, and Admin
├── src/
│   ├── types/index.ts            # TypeScript interfaces (Asset, User, Transaction, Holding, etc.)
│   ├── data/
│   │   ├── mockAssets.ts         # 12 detailed realistic RWA offerings (Commercial, Gold, Solar, etc.)
│   │   ├── mockUsers.ts          # Seed demo users (Investor, Issuer, Admin)
│   │   └── mockTransactions.ts   # Seed transactions & portfolio holdings
│   ├── services/
│   │   ├── mockAssetService.ts   # LocalStorage CRUD, token updates, admin approvals
│   │   ├── mockAuthService.ts    # Demo authentication and user status management
│   │   ├── mockInvestmentService.ts # Order calculation, fee deductions, portfolio metrics
│   │   └── mockWalletService.ts  # Web3 wallet connection, balance deduction, network switch
│   ├── context/
│   │   ├── AuthContext.tsx       # Current user, demo role switching, status updates
│   │   ├── WalletContext.tsx     # Active wallet, balances, modal state
│   │   ├── InvestmentContext.tsx # Reactive portfolio, transactions, invest action, confetti
│   │   ├── WatchlistContext.tsx  # Saved asset IDs persisted in localStorage
│   │   └── ToastContext.tsx      # Web3 toast notification alert system
│   ├── components/
│   │   ├── common/               # Navbar, Footer, Badge, Button, Modal, ProgressBar, StatCard
│   │   ├── marketplace/          # AssetCard, AssetCardList, FilterSidebar, SearchBar, SortDropdown
│   │   ├── assets/               # ImageGallery, InvestNowCard, FinancialBreakdown, PropertySpecs
│   │   ├── wallet/               # WalletModal, WalletStatusPill
│   │   ├── dashboard/            # Sidebar, HoldingsTable, RecentTransactionsTable
│   │   ├── charts/               # Recharts performance, allocation, valuation, and distribution
│   │   ├── forms/                # TokenizeAssetWizard (5-step asset creation)
│   │   └── modals/               # InvestModal, ShareModal, QuickUserSwitchModal
│   ├── layouts/
│   │   ├── PublicLayout.tsx      # Public layout with Navbar & Footer
│   │   ├── InvestorLayout.tsx    # Investor layout with responsive sidebar
│   │   ├── IssuerLayout.tsx      # Issuer layout with console sidebar
│   │   └── AdminLayout.tsx       # Admin layout with command sidebar
│   ├── pages/
│   │   ├── public/               # HomePage, ExplorePage, AssetDetailsPage, Categories, etc.
│   │   ├── investor/             # InvestorDashboard, MyInvestments, Portfolio, Transactions, etc.
│   │   ├── issuer/               # IssuerDashboard, TokenizeAsset, MyListedAssets, Status
│   │   └── admin/                # AdminDashboard, AssetVerification, UserManagement, Marketplace
│   ├── utils/
│   │   ├── formatters.ts         # Currency, numbers, percentages, address shortener, dates
│   │   └── storage.ts            # Safe LocalStorage read/write helpers
│   ├── App.tsx                   # AppProviders wrapper
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
bun install
```

### 2. Start Development Server
```bash
bun run dev
```
The application will be running at `http://localhost:5173`.

### 3. Build & Typecheck
```bash
bun run typecheck
bun run build
```

---

## 🔒 Simulated Disclaimers

AssetX is an institutional frontend simulation. All asset data, cash flow calculations, smart contracts, wallet transactions, and token mints are simulated for demonstration purposes. No real monetary transactions or securities offerings occur on this platform.
