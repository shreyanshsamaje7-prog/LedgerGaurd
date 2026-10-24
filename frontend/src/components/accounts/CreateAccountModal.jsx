import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAccounts } from '../../context/AccountContext';
import { useNotification } from '../../context/NotificationContext';
import { CreditCard, Check, Sparkles } from 'lucide-react';

export function CreateAccountModal({ isOpen, onClose }) {
  const { createAccount } = useAccounts();
  const { notifySuccess, notifyError } = useNotification();
  const [currency, setCurrency] = useState('INR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencies = [
    { code: 'INR', name: 'Indian Rupee (₹)', default: true },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createAccount(currency);
      notifySuccess(`New ${currency} ledger account created successfully!`);
      onClose();
    } catch (err) {
      notifyError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Ledger Account"
      subtitle="Instantiate a new cryptographically indexed account on the LedgerGuard network"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            Base Currency
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
            {currencies.map((curr) => {
              const isSelected = currency === curr.code;
              return (
                <div
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1.5px solid var(--emerald-400)' : '1px solid var(--border-medium)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(13, 20, 36, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
                      {curr.code}
                    </span>
                    {isSelected && <Check size={16} color="var(--emerald-400)" />}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {curr.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            lineHeight: 1.4
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--cyan-400)' }}>Immutable Ledger Guarantee: </span>
          The new account will start with an initial balance of ₹0.00. Balances are computed in real time via aggregate double-entry verification.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>Instantiating...</span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
