import React, { useState } from 'react';
import { useAccounts } from '../context/AccountContext';
import { AccountCard } from '../components/accounts/AccountCard';
import { formatCurrency } from '../utils/formatters';
import { CreditCard, Plus, Search, Layers, RefreshCw } from 'lucide-react';

export function AccountsPage({ onOpenCreateAccount, onOpenTransfer, onViewLedger }) {
  const { accounts, totalBalance, refreshAccounts, isLoading } = useAccounts();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = accounts.filter((acc) => {
    if (!searchTerm.trim()) return true;
    return acc._id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Ledger Accounts & Vaults
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage your isolated double-entry accounts with immutable transaction ledgers
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={refreshAccounts} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Balances</span>
          </button>
          <button onClick={onOpenCreateAccount} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Ribbon */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <CreditCard size={24} color="var(--emerald-400)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Liquid Reserves
            </div>
            <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCurrency(totalBalance)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Vault Count
            </div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cyan-400)' }}>
              {accounts.length} Accounts
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Accounting Status
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={14} /> Aggregate Intact
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="input-with-icon" style={{ maxWidth: '360px' }}>
        <span className="input-icon-left">
          <Search size={16} />
        </span>
        <input
          type="text"
          className="form-control mono-input"
          placeholder="Filter by Account ObjectId..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Accounts Grid */}
      {filtered.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '50px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <CreditCard size={36} color="var(--text-muted)" />
          <h4 style={{ fontSize: '1.1rem' }}>No Accounts Found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {searchTerm ? 'No accounts matched your filter query.' : 'Initialize your first account to get started.'}
          </p>
          <button onClick={onOpenCreateAccount} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Create New Account</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {filtered.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onViewLedger={onViewLedger}
              onTransferFrom={(accId) => onOpenTransfer(accId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
