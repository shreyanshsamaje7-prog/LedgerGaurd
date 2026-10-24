import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowLeftRight, 
  BookOpenCheck, 
  ShieldAlert, 
  Server,
  Lock,
  Layers
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export function Sidebar({ activeTab, onSelectTab }) {
  const { user } = useAuth();
  const isSystem = user?.systemUser;

  const navItems = isSystem ? [
    {
      id: 'dashboard',
      label: 'Treasury & Inbox',
      icon: LayoutDashboard,
      badge: 'Operator'
    },
    {
      id: 'transactions',
      label: 'System Transfers',
      icon: ArrowLeftRight,
      badge: null
    },
    {
      id: 'ledger',
      label: 'Central Audit',
      icon: BookOpenCheck,
      badge: 'Ledger'
    }
  ] : [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'accounts',
      label: 'Accounts & Cards',
      icon: CreditCard,
      badge: null
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ArrowLeftRight,
      badge: null
    },
    {
      id: 'ledger',
      label: 'Immutable Ledger',
      icon: BookOpenCheck,
      badge: 'Audit'
    }
  ];

  return (
    <aside
      style={{
        width: '260px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 20, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        flexShrink: 0,
        height: 'calc(100vh - 70px)',
        position: 'sticky',
        top: '70px'
      }}
    >
      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 8px' }}>
          Platform Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                color: isActive ? 'var(--emerald-400)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? 'var(--emerald-400)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Security & Consensus Widget */}
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          background: 'rgba(16, 25, 44, 0.5)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Lock size={16} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            System Integrity
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
          All balance state is computed dynamically from immutable double-entry ledger entries.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={12} color="var(--cyan-400)" /> ACID Engine
            </span>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>MongoDB Txn</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Server size={12} color="var(--violet-400)" /> Idempotency
            </span>
            <span style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>Zero Duplicate</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
