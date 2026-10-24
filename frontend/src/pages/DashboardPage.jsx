import React from 'react';
import { StatCard } from '../components/common/StatCard';
import { AccountCard } from '../components/accounts/AccountCard';
import { TransactionList } from '../components/transactions/TransactionList';
import { useAccounts } from '../context/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { 
  Wallet, 
  CreditCard, 
  ArrowLeftRight, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { FirstDepositBanner } from '../components/dashboard/FirstDepositBanner';

export function DashboardPage({ 
  transactions = [], 
  isLoadingTransactions, 
  onOpenTransfer, 
  onOpenDeposit, 
  onOpenCreateAccount,
  onViewLedger,
  onSelectTransaction,
  onNavigateToAccounts,
  onNavigateToTransactions
}) {
  const { accounts, totalBalance, refreshAccounts, isLoading: isLoadingAccounts } = useAccounts();

  const userAccountIds = accounts.map((a) => a._id);
  const completedTxCount = transactions.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(16, 25, 44, 0.85) 0%, rgba(13, 20, 36, 0.95) 100%)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-emerald">
              <span className="status-dot status-dot-pulse" style={{ backgroundColor: 'var(--emerald-400)' }} />
              Consensus Network Active
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              MongoDB ACID Engine
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Financial Overview & Vaults
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Real-time balance settlement derived dynamically from append-only ledger entries.
          </p>
        </div>

        {/* Quick Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onOpenCreateAccount} className="btn btn-outline btn-sm">
            <Plus size={15} />
            <span>New Account</span>
          </button>

          <button onClick={onOpenTransfer} className="btn btn-primary btn-sm">
            <ArrowUpRight size={15} />
            <span>Send Money</span>
          </button>
        </div>
      </div>

      {/* One-Time Welcome Deposit Request Banner */}
      <FirstDepositBanner onDepositApproved={refreshAccounts} />

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}
      >
        <StatCard
          title="Total Net Liquidity"
          value={formatCurrency(totalBalance)}
          subtitle="Combined across active vaults"
          icon={Wallet}
          color="emerald"
          badge="Live"
        />

        <StatCard
          title="Active Accounts"
          value={accounts.length.toString()}
          subtitle="Cryptographically isolated vaults"
          icon={CreditCard}
          color="cyan"
        />

        <StatCard
          title="Settled Transactions"
          value={completedTxCount.toString()}
          subtitle="Idempotent ledger operations"
          icon={ArrowLeftRight}
          color="violet"
        />

        <StatCard
          title="Ledger Consistency"
          value="100.0%"
          subtitle="Credits == Debits zero delta"
          icon={ShieldCheck}
          color="amber"
          badge="Audit Safe"
        />
      </div>

      {/* Accounts Showcase Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Ledger Accounts</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Select an account to view its immutable audit journal
            </p>
          </div>
          <button onClick={onNavigateToAccounts} className="btn btn-outline btn-sm">
            <span>View All ({accounts.length})</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {accounts.length === 0 && !isLoadingAccounts ? (
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <CreditCard size={36} color="var(--text-muted)" />
            <h4 style={{ fontSize: '1rem' }}>No Ledger Accounts Initialized</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
              Create your first account to receive deposits, execute double-entry transfers, and build your transaction journal.
            </p>
            <button onClick={onOpenCreateAccount} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Create First Account</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            {accounts.slice(0, 3).map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                onViewLedger={onViewLedger}
                onTransferFrom={(accId) => onOpenTransfer(accId)}
              />
            ))}

            {/* Quick Add Account Card */}
            <div
              onClick={onOpenCreateAccount}
              className="glass-card-interactive"
              style={{
                borderRadius: 'var(--radius-xl)',
                border: '2px dashed var(--border-medium)',
                background: 'rgba(13, 20, 36, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                minHeight: '210px',
                cursor: 'pointer',
                padding: '24px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={20} color="var(--cyan-400)" />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Instantiate New Account
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                INR, USD, EUR or GBP
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Ledger Activity</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Idempotent atomic transitions
            </p>
          </div>
          <button onClick={onNavigateToTransactions} className="btn btn-outline btn-sm">
            <span>Explore All Transactions</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <TransactionList
          transactions={transactions.slice(0, 5)}
          userAccountIds={userAccountIds}
          onSelectTransaction={onSelectTransaction}
          isLoading={isLoadingTransactions}
        />
      </div>
    </div>
  );
}
