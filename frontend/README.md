# LedgerGuard — Modern Production-Ready Financial Ledger Frontend

Enterprise-grade double-entry financial ledger frontend built with **React**, **Vite**, and high-trust financial dark mode design system.

---

## 🏛️ Architecture Overview

LedgerGuard operates on strict **Double-Entry Bookkeeping** principles:
- **No Direct Mutation**: User account balances are never updated in place. Balances are derived dynamically via `SUM(Credits) - SUM(Debits)`.
- **Strict Idempotency**: Every financial transfer requires a cryptographically secure idempotency key (`idempotencyKey`), preventing duplicate charges across network timeouts or concurrent retries.
- **ACID Consistency**: Transfers leverage MongoDB distributed transaction sessions where a `DEBIT` ledger entry and a `CREDIT` ledger entry are committed atomically.
- **Append-Only Immutability**: Ledger records cannot be updated or deleted.

---

## 📁 Clean File Structure

```
frontend/
├── public/                 # Static assets & favicon
├── src/
│   ├── api/                # API integration layer
│   │   ├── client.js       # Fetch client with auto JWT injection, credentials, error handling
│   │   ├── auth.api.js     # Login, register, logout, session verification (/me)
│   │   ├── account.api.js  # Account listing, creation, balance, and ledger retrieval
│   │   └── transaction.api.js # Transfer execution, list transactions, initial funds issuance
│   ├── context/            # React global state providers
│   │   ├── AuthContext.jsx # Authentication state, session check, token persistence
│   │   ├── AccountContext.jsx # Vault accounts, active selection, total liquidity calculation
│   │   └── NotificationContext.jsx # Toast notification queue (success, warning, error, info)
│   ├── components/         # Reusable presentation components
│   │   ├── common/         # Layout & atomic primitives
│   │   │   ├── Navbar.jsx  # Top status bar, live liquidity pill, quick actions, user menu
│   │   │   ├── Sidebar.jsx # Navigation drawer with consensus verification metrics
│   │   │   ├── Modal.jsx   # Accessible backdrop blur modal
│   │   │   └── StatCard.jsx # Financial metric card with trend glow
│   │   ├── accounts/       # Account domain components
│   │   │   ├── AccountCard.jsx # Sleek debit card aesthetic with live balance & copyable ID
│   │   │   ├── CreateAccountModal.jsx # Multi-currency account creation
│   │   │   └── AccountLedgerDrawer.jsx # Slide-out immutable audit journal
│   │   └── transactions/   # Transaction domain components
│   │       ├── TransferModal.jsx # 10-step ACID progress indicator, idempotency key generation
│   │       ├── DepositModal.jsx  # System treasury reserve faucet modal
│   │       ├── TransactionList.jsx # Searchable, filterable transactions table with status badges
│   │       └── TransactionDetailModal.jsx # Detailed cryptographic audit receipt
│   ├── pages/              # High-level route views
│   │   ├── AuthPage.jsx    # Split-screen modern authentication (Sign In & Sign Up)
│   │   ├── DashboardPage.jsx # Core financial dashboard with liquidity overview
│   │   ├── AccountsPage.jsx # Vaults & card inventory manager
│   │   ├── TransactionsPage.jsx # Full transactions journal & search
│   │   └── AuditLedgerPage.jsx # Double-entry mathematical balance derivation explorer
│   ├── utils/              # Pure utility functions
│   │   └── formatters.js   # Currency (INR, USD, etc.), timestamps, ID truncators, UUID idempotency
│   ├── App.jsx             # Master application root
│   ├── index.css           # Custom CSS design system (tokens, glassmorphism, animations)
│   └── main.jsx            # Application entry point
├── index.html              # HTML shell with Google Fonts (Plus Jakarta Sans, JetBrains Mono)
├── vite.config.js          # Vite config with /api reverse proxy to Express backend
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **Backend Running**: The Express backend running on `http://localhost:3000`

### 2. Development Server
From `LedgerGuard/frontend`:
```bash
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

The Vite dev server automatically proxies all `/api/*` calls directly to `http://localhost:3000/api/*`, ensuring zero CORS headaches and secure cookie transmission.

### 3. Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.
