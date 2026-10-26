import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAccounts } from '../../context/AccountContext';
import { useNotification } from '../../context/NotificationContext';
import { transactionApi } from '../../api/transaction.api';
import { generateIdempotencyKey, formatCurrency, truncateId } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { ArrowRight, RefreshCw, KeyRound, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export function TransferModal({ isOpen, onClose, initialFromAccount = null, onSuccess }) {
  const { accounts, refreshAccounts } = useAccounts();
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | completed | error
  const [processingStep, setProcessingStep] = useState(0);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      let initialId = null;
      if (typeof initialFromAccount === 'string') {
        initialId = initialFromAccount;
      } else if (initialFromAccount && typeof initialFromAccount._id === 'string') {
        initialId = initialFromAccount._id;
      }

      const matchingAcc = accounts.find((a) => String(a._id) === String(initialId));
      const defaultFrom = matchingAcc ? matchingAcc._id : (accounts[0]?._id || '');

      setFromAccount(defaultFrom);
      setToAccount('');
      setAmount('');
      setIdempotencyKey(generateIdempotencyKey('tx'));
      setStatus('idle');
      setProcessingStep(0);
    }
  }, [isOpen, initialFromAccount, accounts]);

  // Ensure an account is selected once accounts are loaded
  useEffect(() => {
    if (isOpen && (!fromAccount || !accounts.some((a) => String(a._id) === String(fromAccount))) && accounts.length > 0) {
      setFromAccount(accounts[0]._id);
    }
  }, [isOpen, accounts, fromAccount]);

  const selectedFromAcc = accounts.find((a) => String(a._id) === String(fromAccount));
  const currentBalance = selectedFromAcc ? Number(selectedFromAcc.balance) || 0 : 0;

  const handleMaxAmount = () => {
    if (currentBalance > 0) {
      setAmount(currentBalance.toString());
    }
  };

  const handleRegenerateKey = () => {
    setIdempotencyKey(generateIdempotencyKey('tx'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!fromAccount) {
      notifyError('Please select a sending account');
      return;
    }
    if (!toAccount.trim()) {
      notifyError('Please specify the recipient account ID');
      return;
    }
    if (fromAccount === toAccount.trim()) {
      notifyError('Source and destination accounts must be different');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      notifyError('Please enter a valid transfer amount greater than 0');
      return;
    }
    if (numericAmount > currentBalance) {
      notifyError(`Insufficient funds. Available balance: ${formatCurrency(currentBalance)}`);
      return;
    }

    setStatus('processing');
    setProcessingStep(1);

    // Simulate stepping through the 10-step ACID flow for user visibility
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 3000);

    try {
      const response = await transactionApi.createTransaction({
        fromAccount,
        toAccount: toAccount.trim(),
        amount: numericAmount,
        idempotencyKey
      });

      clearInterval(stepInterval);
      setProcessingStep(5);
      setStatus('completed');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }

      notifySuccess(`Successfully transferred ${formatCurrency(numericAmount)}!`);
      await refreshAccounts();

      if (onSuccess) {
        onSuccess(response.transaction);
      }

      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err) {
      clearInterval(stepInterval);
      setStatus('error');
      notifyError(err.message || 'Transaction could not be completed');
    }
  };

  const steps = [
    'Validating cryptographic idempotency key...',
    'Locking session & verifying double-entry constraints...',
    'Writing append-only DEBIT & CREDIT ledger blocks...',
    'Committing MongoDB ACID distributed transaction...',
    'Transaction confirmed & sealed!'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={status === 'processing' ? () => {} : onClose}
      title="Create Ledger Transfer"
      subtitle="ACID transactional transfer with guaranteed zero-loss idempotency"
      maxWidth="560px"
    >
      {status === 'processing' || status === 'completed' ? (
        <div style={{ padding: '24px 10px', textAlign: 'center' }}>
          {status === 'processing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '3px solid rgba(16, 185, 129, 0.2)',
                  borderTopColor: 'var(--emerald-400)',
                  animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                  Processing Atomic Transfer
                </h4>
                <p className="mono" style={{ fontSize: '0.8125rem', color: 'var(--cyan-400)', minHeight: '20px' }}>
                  {steps[processingStep]}
                </p>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  height: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginTop: '8px'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--emerald-400)',
                    width: `${((processingStep + 1) / 5) * 100}%`,
                    transition: 'width 0.5s ease',
                    boxShadow: 'var(--glow-emerald)'
                  }}
                />
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Double-entry ledger settlement in progress (safe to wait)
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid var(--emerald-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--glow-emerald)'
                }}
              >
                <CheckCircle2 size={32} color="var(--emerald-400)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--emerald-400)', marginBottom: '4px' }}>
                  Transfer Finalized!
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Ledger entries written. Balances committed to permanent audit history.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* From Account */}
          <div className="form-group">
            <label className="form-label">
              <span>Source Account</span>
              <span className="mono" style={{ color: 'var(--emerald-400)' }}>
                Bal: {formatCurrency(currentBalance)}
              </span>
            </label>
            <select
              className="form-control"
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              required
            >
              <option value="" disabled>Select source account...</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  #{truncateId(acc._id, 8, 6)} — {formatCurrency(acc.balance || 0, acc.currency)} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Account */}
          <div className="form-group">
            <label className="form-label">
              <span>Destination Account ID</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>24-char ObjectId</span>
            </label>
            <input
              type="text"
              className="form-control mono-input"
              placeholder="e.g. 67ba... (paste recipient account ID)"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              required
            />

            {/* Quick Helper: Select other account if user has > 1 */}
            {accounts.length > 1 && (
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Your other accounts:</span>
                {accounts
                  .filter((a) => a._id !== fromAccount)
                  .map((a) => (
                    <button
                      type="button"
                      key={a._id}
                      onClick={() => setToAccount(a._id)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                    >
                      #{truncateId(a._id, 4, 4)}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">
              <span>Transfer Amount (₹)</span>
              <button
                type="button"
                onClick={handleMaxAmount}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--cyan-400)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                USE MAX
              </button>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="form-control mono-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Idempotency Key */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <KeyRound size={13} color="var(--amber-400)" />
                Idempotency Key
              </span>
              <button
                type="button"
                onClick={handleRegenerateKey}
                title="Regenerate unique key"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={11} /> Refresh
              </button>
            </label>
            <input
              type="text"
              className="form-control mono-input"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Guarantees the transfer will execute exactly once, even in case of network timeouts.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!amount || Number(amount) <= 0 || Number(amount) > currentBalance}
            >
              <span>Execute Transfer</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
