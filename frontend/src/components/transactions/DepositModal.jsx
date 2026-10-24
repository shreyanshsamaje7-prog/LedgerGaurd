import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAccounts } from '../../context/AccountContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { transactionApi } from '../../api/transaction.api';
import { generateIdempotencyKey, formatCurrency, truncateId } from '../../utils/formatters';
import { PlusCircle, ShieldCheck, KeyRound, Sparkles, AlertCircle } from 'lucide-react';

export function DepositModal({ isOpen, onClose }) {
  const { accounts, refreshAccounts } = useAccounts();
  const { user } = useAuth();
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('1000');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setToAccount(accounts[0]?._id || '');
      setAmount('1000');
      setIdempotencyKey(generateIdempotencyKey('sys'));
    }
  }, [isOpen, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toAccount) {
      notifyError('Please select a target account');
      return;
    }
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      notifyError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionApi.depositInitialFunds({
        toAccount,
        amount: numericAmount,
        idempotencyKey
      });
      notifySuccess(`Deposit of ${formatCurrency(numericAmount)} completed via System Treasury!`);
      await refreshAccounts();
      onClose();
    } catch (err) {
      if (err.status === 403) {
        notifyWarning(
          'Your account is not flagged as a System User (systemUser: true) in MongoDB. System Treasury issuance is restricted to authorized reserve operators in production.',
          'System User Restricted'
        );
      } else {
        notifyError(err.message || 'Deposit could not be processed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Treasury / Initial Funds Issuance"
      subtitle="Inject initial liquidity from the central system reserve into an account"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit}>
        {/* System User Status Notice */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: user?.systemUser ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${user?.systemUser ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          {user?.systemUser ? (
            <ShieldCheck size={18} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={18} color="var(--amber-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ fontSize: '0.78rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            <strong style={{ color: user?.systemUser ? 'var(--emerald-400)' : 'var(--amber-400)' }}>
              {user?.systemUser ? 'Authorized System Operator' : 'Standard User Role'}:
            </strong>{' '}
            {user?.systemUser
              ? 'You have permission to issue initial liquidity from the system treasury account.'
              : 'Initial funds issuance requires systemUser: true on your user document in MongoDB to prevent unauthorized balance inflation.'}
          </div>
        </div>

        {/* Target Account */}
        <div className="form-group">
          <label className="form-label">Recipient Account</label>
          <select
            className="form-control"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            required
          >
            <option value="" disabled>Select target account...</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                #{truncateId(acc._id, 8, 6)} — Current: {formatCurrency(acc.balance || 0, acc.currency)}
              </option>
            ))}
          </select>
        </div>

        {/* Preset Amounts */}
        <div className="form-group">
          <label className="form-label">Issuance Amount (₹)</label>
          <input
            type="number"
            min="1"
            className="form-control mono-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {['500', '1000', '5000', '25000'].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setAmount(val)}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, padding: '4px 0', fontSize: '0.75rem' }}
              >
                +₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Idempotency Key */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <KeyRound size={12} color="var(--amber-400)" /> Idempotency Key
            </span>
          </label>
          <input
            type="text"
            className="form-control mono-input"
            value={idempotencyKey}
            onChange={(e) => setIdempotencyKey(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-cyan" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>Minting...</span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Issue Liquidity</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
