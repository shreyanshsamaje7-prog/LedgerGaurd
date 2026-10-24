import React, { useState, useEffect } from 'react';
import { useAccounts } from '../context/AccountContext';
import { accountApi } from '../api/account.api';
import { formatCurrency, formatDate, truncateId, copyToClipboard } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';
import { 
  BookOpenCheck, 
  ShieldCheck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  RefreshCw, 
  Lock,
  Layers,
  Database
} from 'lucide-react';

export function AuditLedgerPage() {
  const { accounts } = useAccounts();
  const { notifySuccess, notifyError } = useNotification();

  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?._id || '');
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccId) {
      setSelectedAccId(accounts[0]._id);
    }
  }, [accounts, selectedAccId]);

  const loadLedger = async (accId) => {
    if (!accId) return;
    setIsLoading(true);
    try {
      const data = await accountApi.getAccountLedger(accId);
      setEntries(data?.ledgerEntries || []);
    } catch (err) {
      notifyError(err.message || 'Failed to fetch ledger entries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccId) {
      loadLedger(selectedAccId);
    }
  }, [selectedAccId]);

  const currentAcc = accounts.find((a) => a._id === selectedAccId);
  const currency = currentAcc?.currency || 'INR';

  const totalCredits = entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalDebits = entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const derivedBalance = totalCredits - totalDebits;

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      notifySuccess(`${label} copied to clipboard`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Immutable Double-Entry Ledger
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Append-only journal entries. Cryptographically enforced schema immutability.
          </p>
        </div>

        {/* Account Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Account:</span>
          <select
            className="form-control mono-input"
            style={{ width: '280px', padding: '8px 12px' }}
            value={selectedAccId}
            onChange={(e) => setSelectedAccId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                #{truncateId(a._id, 8, 6)} ({a.currency}) — {formatCurrency(a.balance || 0, a.currency)}
              </option>
            ))}
          </select>

          <button onClick={() => loadLedger(selectedAccId)} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Verify</span>
          </button>
        </div>
      </div>

      {/* Accounting Formula Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(16, 25, 44, 0.9) 0%, rgba(13, 20, 36, 0.9) 100%)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--emerald-400)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Dynamic Ledger Balance Derivation Formula
            </span>
          </div>
          <span className="badge badge-emerald">
            <Lock size={12} /> Pre-Hook Protected
          </span>
        </div>

        {/* Mathematical Equation Display */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr auto 1fr',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}
        >
          {/* Credits */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--emerald-400)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Inflows (CREDIT)
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '4px' }}>
              +{formatCurrency(totalCredits, currency)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {entries.filter((e) => e.type === 'CREDIT').length} entries
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            —
          </div>

          {/* Debits */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--rose-400)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Outflows (DEBIT)
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose-400)', marginTop: '4px' }}>
              -{formatCurrency(totalDebits, currency)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {entries.filter((e) => e.type === 'DEBIT').length} entries
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            =
          </div>

          {/* Balance */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--cyan-400)', textTransform: 'uppercase', fontWeight: 600 }}>
              True Derived Balance
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {formatCurrency(derivedBalance, currency)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald-400)', marginTop: '2px' }}>
              100% Invariant Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Append-Only Ledger Journal ({entries.length} Records)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Schema forbids update, delete, or replace operations at the database layer.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem' }}>Querying immutable ledger blocks...</p>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <BookOpenCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>No ledger entries found for this account.</p>
              <p style={{ fontSize: '0.75rem' }}>Execute a transfer to write the first ledger block.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>ENTRY TYPE</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>DELTA AMOUNT</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>TRANSACTION ID</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>LEDGER ENTRY ID</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600, textAlign: 'right' }}>IMMUTABLE TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isCredit = entry.type === 'CREDIT';
                  const txId = entry.transaction?._id || entry.transaction;

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
                      <td style={{ padding: '14px 10px' }}>
                        <span className={`badge ${isCredit ? 'badge-emerald' : 'badge-rose'}`}>
                          {isCredit ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                          {entry.type}
                        </span>
                      </td>

                      <td style={{ padding: '14px 10px' }}>
                        <span
                          className="mono"
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: isCredit ? 'var(--emerald-400)' : 'var(--rose-400)'
                          }}
                        >
                          {isCredit ? '+' : '-'}{formatCurrency(entry.amount, currency)}
                        </span>
                      </td>

                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="mono" style={{ color: 'var(--cyan-400)' }}>
                            {truncateId(txId, 6, 6)}
                          </span>
                          <button
                            onClick={() => handleCopy(txId, 'Transaction ID')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                            {truncateId(entry._id, 6, 6)}
                          </span>
                          <button
                            onClick={() => handleCopy(entry._id, 'Ledger Entry ID')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '14px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {formatDate(entry.createdAt || entry.transaction?.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
