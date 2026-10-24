import React, { useState } from 'react';
import { Copy, Check, Eye, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';
import { formatCurrency, truncateId, copyToClipboard } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

export function AccountCard({ account, isSelected, onSelect, onViewLedger, onTransferFrom }) {
  const [copied, setCopied] = useState(false);
  const { notifySuccess } = useNotification();

  const handleCopyId = async (e) => {
    e.stopPropagation();
    const ok = await copyToClipboard(account._id);
    if (ok) {
      setCopied(true);
      notifySuccess(`Account ID copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const balance = account.balance !== undefined ? account.balance : 0;

  return (
    <div
      onClick={() => onSelect && onSelect(account._id)}
      className="glass-card-interactive"
      style={{
        borderRadius: 'var(--radius-xl)',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(16, 25, 44, 0.95) 0%, rgba(20, 32, 56, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(13, 20, 36, 0.75) 0%, rgba(10, 16, 28, 0.85) 100%)',
        border: isSelected ? '1.5px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
        boxShadow: isSelected ? 'var(--shadow-xl), var(--glow-emerald)' : 'var(--shadow-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '210px',
        position: 'relative'
      }}
    >
      {/* Top Bar: Holographic Chip & Currency */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Card EMV Chip Simulation */}
          <div
            style={{
              width: '36px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #FDE68A 0%, #D97706 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ position: 'absolute', inset: '4px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '3px' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            LEDGER ACCOUNT
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
            {account.status || 'ACTIVE'}
          </span>
          <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {account.currency || 'INR'}
          </span>
        </div>
      </div>

      {/* Center: Live Derived Balance */}
      <div style={{ margin: '8px 0' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
          Current Balance
        </div>
        <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {formatCurrency(balance, account.currency)}
        </div>
      </div>

      {/* Bottom Bar: Account ID & Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          marginTop: '8px'
        }}
      >
        <div
          onClick={handleCopyId}
          title="Click to copy full Account ID"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>
            {truncateId(account._id, 8, 6)}
          </span>
          {copied ? <Check size={13} color="var(--emerald-400)" /> : <Copy size={13} color="var(--text-muted)" />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onTransferFrom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTransferFrom(account._id);
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              title="Send from this account"
            >
              <ArrowUpRight size={13} />
              <span>Send</span>
            </button>
          )}

          {onViewLedger && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewLedger(account);
              }}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              title="View immutable ledger audit trail"
            >
              <Eye size={13} />
              <span>Ledger</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
