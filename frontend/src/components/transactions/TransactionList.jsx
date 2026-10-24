import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { formatCurrency, formatDate, truncateId, copyToClipboard } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

export function TransactionList({ transactions = [], userAccountIds = [], onSelectTransaction, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { notifySuccess } = useNotification();

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      notifySuccess(`${label} copied to clipboard`);
    }
  };

  const filtered = transactions.filter((tx) => {
    // Status filter
    if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const txId = (tx._id || '').toLowerCase();
      const idemp = (tx.idempotencyKey || '').toLowerCase();
      const fromAccId = (tx.fromAccount?._id || tx.fromAccount || '').toLowerCase();
      const toAccId = (tx.toAccount?._id || tx.toAccount || '').toLowerCase();

      return txId.includes(q) || idemp.includes(q) || fromAccId.includes(q) || toAccId.includes(q);
    }

    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Transaction Ledger History
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Cryptographically sealed and idempotent state transitions
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div className="input-with-icon" style={{ minWidth: '240px' }}>
            <span className="input-icon-left">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="form-control"
              style={{ padding: '7px 12px 7px 36px', fontSize: '0.8125rem' }}
              placeholder="Search by ID, key, account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(13, 20, 36, 0.8)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)'
            }}
          >
            {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((st) => {
              const isSelected = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-subtle)' : 'none',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        {isLoading && transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.85rem' }}>Loading transaction records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>No transactions found</p>
            <p style={{ fontSize: '0.75rem' }}>
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or status filter.'
                : 'Execute your first transfer to see it reflected on the ledger.'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>TRANSACTION ID</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>SOURCE → DESTINATION</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>AMOUNT</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>IDEMPOTENCY KEY</th>
                <th style={{ padding: '12px 10px', fontWeight: 600, textAlign: 'right' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const fromId = tx.fromAccount?._id || tx.fromAccount;
                const toId = tx.toAccount?._id || tx.toAccount;
                const isDebit = userAccountIds.includes(fromId);
                const isCredit = userAccountIds.includes(toId);

                let badge = (
                  <span className="badge badge-emerald">
                    <CheckCircle2 size={11} /> COMPLETED
                  </span>
                );
                if (tx.status === 'PENDING') {
                  badge = (
                    <span className="badge badge-amber">
                      <Clock size={11} className="animate-spin" /> PENDING
                    </span>
                  );
                } else if (tx.status === 'FAILED') {
                  badge = (
                    <span className="badge badge-rose">
                      <XCircle size={11} /> FAILED
                    </span>
                  );
                } else if (tx.status === 'REVERSED') {
                  badge = (
                    <span className="badge badge-slate">
                      <RotateCcw size={11} /> REVERSED
                    </span>
                  );
                }

                return (
                  <tr
                    key={tx._id}
                    onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: onSelectTransaction ? 'pointer' : 'default',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 10px' }}>{badge}</td>

                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {truncateId(tx._id, 6, 6)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(tx._id, 'Transaction ID');
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                        <span className="mono" style={{ color: isDebit ? 'var(--rose-400)' : 'var(--text-secondary)' }}>
                          {truncateId(fromId, 4, 4)}
                        </span>
                        <span style={{ color: 'var(--text-dim)' }}>→</span>
                        <span className="mono" style={{ color: isCredit ? 'var(--emerald-400)' : 'var(--text-secondary)' }}>
                          {truncateId(toId, 4, 4)}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <span
                        className="mono"
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: isCredit && !isDebit ? 'var(--emerald-400)' : isDebit ? 'var(--rose-400)' : 'var(--text-primary)'
                        }}
                      >
                        {isCredit && !isDebit ? '+' : isDebit ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {truncateId(tx.idempotencyKey, 8, 4)}
                      </span>
                    </td>

                    <td style={{ padding: '14px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
