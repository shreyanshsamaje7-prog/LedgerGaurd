import React from 'react';
import { ShieldCheck, ArrowRightLeft, PlusCircle, LogOut, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccounts } from '../../context/AccountContext';
import { formatCurrency } from '../../utils/formatters';

export function Navbar({ onOpenTransfer, onOpenDeposit }) {
  const { user, logout } = useAuth();
  const { totalBalance, refreshAccounts, isLoading } = useAccounts();

  return (
    <header
      style={{
        height: '70px',
        width: '100%',
        flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow-emerald)'
            }}
          >
            <ShieldCheck size={22} color="#080C14" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                Ledger<span style={{ color: 'var(--emerald-400)' }}>Guard</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                PROD
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="status-dot status-dot-pulse" style={{ backgroundColor: 'var(--emerald-400)' }}></span>
              Double-Entry Consensual Ledger
            </div>
          </div>
        </div>
      </div>

      {/* Center - Total Liquidity Pill */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(16, 25, 44, 0.6)'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Total Vault Assets:
        </span>
        <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
          {formatCurrency(totalBalance)}
        </span>
        <button
          onClick={refreshAccounts}
          title="Refresh balances"
          className="btn-icon"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex'
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Right Actions & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => onOpenTransfer && onOpenTransfer()} className="btn btn-primary btn-sm">
          <ArrowRightLeft size={16} />
          <span>New Transfer</span>
        </button>

        <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: user?.systemUser 
                ? 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)' 
                : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              border: user?.systemUser ? '1.5px solid var(--cyan-400)' : '1px solid var(--border-medium)',
              boxShadow: user?.systemUser ? 'var(--glow-cyan)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: user?.systemUser ? '#080C14' : 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </span>
              {user?.systemUser && (
                <span className="badge badge-cyan" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                  SYSTEM
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user?.email}
            </span>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="btn-icon btn-secondary"
            style={{
              padding: '8px',
              marginLeft: '4px',
              color: 'var(--rose-400)',
              borderRadius: '8px'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
