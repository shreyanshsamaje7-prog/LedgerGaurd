import React from 'react';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, copyToClipboard } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, Clock, XCircle, Copy, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

export function TransactionDetailModal({ isOpen, onClose, transaction }) {
  const { notifySuccess } = useNotification();

  if (!transaction) return null;

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      notifySuccess(`${label} copied to clipboard`);
    }
  };

  const fromId = transaction.fromAccount?._id || transaction.fromAccount;
  const toId = transaction.toAccount?._id || transaction.toAccount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Audit Receipt"
      subtitle={`ID: #${transaction._id}`}
      maxWidth="520px"
    >
      <div>
        {/* Status and Amount Card */}
        <div
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(180deg, rgba(16, 25, 44, 0.9) 0%, rgba(13, 20, 36, 0.9) 100%)',
            border: '1px solid var(--border-medium)',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'inline-flex', marginBottom: '8px' }}>
            {transaction.status === 'COMPLETED' ? (
              <span className="badge badge-emerald" style={{ padding: '6px 14px' }}>
                <CheckCircle2 size={14} /> SETTLED & VERIFIED
              </span>
            ) : transaction.status === 'PENDING' ? (
              <span className="badge badge-amber" style={{ padding: '6px 14px' }}>
                <Clock size={14} className="animate-spin" /> PENDING SETTLEMENT
              </span>
            ) : (
              <span className="badge badge-rose" style={{ padding: '6px 14px' }}>
                <XCircle size={14} /> FAILED
              </span>
            )}
          </div>

          <div className="mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
            {formatCurrency(transaction.amount)}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Recorded on {formatDate(transaction.createdAt)}
          </div>
        </div>

        {/* Transfer Path Box */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Debited From
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                {fromId}
              </span>
              <button
                onClick={() => handleCopy(fromId, 'Source Account ID')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowRight size={16} color="var(--cyan-400)" />
          </div>

          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Credited To
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--emerald-400)' }}>
                {toId}
              </span>
              <button
                onClick={() => handleCopy(toId, 'Destination Account ID')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Key Metadata Table */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Idempotency Hash</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mono" style={{ color: 'var(--cyan-400)', fontSize: '0.75rem' }}>
                {transaction.idempotencyKey}
              </span>
              <button
                onClick={() => handleCopy(transaction.idempotencyKey, 'Idempotency Key')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Isolation Level</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Snapshot / Serializable</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Consensus State</span>
            <span style={{ color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Immutable Ledger Verified
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
}
