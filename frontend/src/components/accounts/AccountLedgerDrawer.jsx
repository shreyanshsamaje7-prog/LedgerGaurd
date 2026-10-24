import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { accountApi } from '../../api/account.api';
import { formatCurrency, formatDate, truncateId, copyToClipboard } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, Copy, RefreshCw } from 'lucide-react';

export function AccountLedgerDrawer({ isOpen, onClose, account }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const loadLedger = async () => {
    if (!account?._id) return;
    setIsLoading(true);
    try {
      const data = await accountApi.getAccountLedger(account._id);
      setEntries(data?.ledgerEntries || []);
    } catch (err) {
      notifyError(err.message || 'Failed to load ledger history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && account?._id) {
      loadLedger();
    }
  }, [isOpen, account?._id]);

  if (!account) return null;

  const totalCredits = entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalDebits = entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Immutable Audit Ledger"
      subtitle={`Account #${account._id}`}
      maxWidth="720px"
    >
      <div>
        {/* Account Summary Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{ padding: '14px 16px', background: 'rgba(16, 25, 44, 0.6)' }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Derived Balance
            </div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {formatCurrency(totalCredits - totalDebits, account.currency)}
            </div>
          </div>

          <div
            className="glass-panel"
            style={{ padding: '14px 16px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--emerald-400)', textTransform: 'uppercase' }}>
              Total Credits (+)
            </div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--emerald-400)', marginTop: '4px' }}>
              +{formatCurrency(totalCredits, account.currency)}
            </div>
          </div>

          <div
            className="glass-panel"
            style={{ padding: '14px 16px', background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)' }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--rose-400)', textTransform: 'uppercase' }}>
              Total Debits (-)
            </div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--rose-400)', marginTop: '4px' }}>
              -{formatCurrency(totalDebits, account.currency)}
            </div>
          </div>
        </div>

        {/* Verification Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--emerald-400)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Audit Seal: Append-only ledger entries cannot be mutated or deleted.
            </span>
          </div>
          <button
            onClick={loadLedger}
            className="btn btn-outline btn-sm"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* Entries Table */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {isLoading && entries.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '0.85rem' }}>Verifying cryptographic ledger blocks...</p>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>No ledger entries recorded yet.</p>
              <p style={{ fontSize: '0.75rem' }}>Receive funds or make a transfer to generate your first audit block.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>TYPE</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>AMOUNT</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>TRANSACTION REF</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'right' }}>ENTRY ID</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isCredit = entry.type === 'CREDIT';
                  return (
                    <tr
                      key={entry._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`badge ${isCredit ? 'badge-emerald' : 'badge-rose'}`}>
                          {isCredit ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                          {entry.type}
                        </span>
                      </td>

                      <td style={{ padding: '12px 8px' }}>
                        <span className="mono" style={{ fontWeight: 700, color: isCredit ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
                          {isCredit ? '+' : '-'}{formatCurrency(entry.amount, account.currency)}
                        </span>
                      </td>

                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                            {truncateId(entry.transaction?._id || entry.transaction, 6, 6)}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                          {truncateId(entry._id, 4, 4)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}
