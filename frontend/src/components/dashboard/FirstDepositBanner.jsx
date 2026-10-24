import React, { useState, useEffect } from 'react';
import { depositRequestApi } from '../../api/depositRequest.api';
import { useAccounts } from '../../context/AccountContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency, truncateId } from '../../utils/formatters';
import { Sparkles, Clock, CheckCircle2, XCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export function FirstDepositBanner({ onDepositApproved }) {
  const { accounts, refreshAccounts } = useAccounts();
  const { notifySuccess, notifyError } = useNotification();

  const [depositData, setDepositData] = useState(null);
  const [selectedAccId, setSelectedAccId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequestStatus = async () => {
    setIsLoading(true);
    try {
      const res = await depositRequestApi.getMyRequest();
      setDepositData(res);
      if (res?.request?.status === 'APPROVED' && onDepositApproved) {
        onDepositApproved();
      }
    } catch (err) {
      console.warn('Could not fetch deposit request status:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestStatus();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccId) {
      setSelectedAccId(accounts[0]._id);
    }
  }, [accounts, selectedAccId]);

  const handleSendRequest = async () => {
    if (!selectedAccId) {
      notifyError('Please select an account to receive the initial deposit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await depositRequestApi.createRequest({
        accountId: selectedAccId,
        amount: 5000
      });
      notifySuccess('First deposit request sent to System Operator! Awaiting approval.');
      await fetchRequestStatus();
      await refreshAccounts();
    } catch (err) {
      notifyError(err.message || 'Failed to submit deposit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const req = depositData?.request;

  // If user has already claimed/approved, show a clean, small verification badge
  if (req && req.status === 'APPROVED') {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="var(--emerald-400)" />
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              One-Time Welcome Liquidity Grant Claimed
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', marginLeft: '8px' }}>
              +{formatCurrency(req.amount)} Credited to #{truncateId(req.account?._id || req.account, 6, 4)}
            </span>
          </div>
        </div>
        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
          VERIFIED & SETTLED
        </span>
      </div>
    );
  }

  // If request is pending approval by the system user
  if (req && req.status === 'PENDING') {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(13, 20, 36, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginTop: '2px'
            }}
          >
            <Clock size={20} color="var(--amber-400)" className="animate-spin" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Deposit Request Sent to System Operator
              </span>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                Awaiting Approval
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Your one-time request for <strong className="mono" style={{ color: 'var(--emerald-400)' }}>{formatCurrency(req.amount)}</strong> to account{' '}
              <span className="mono" style={{ color: 'var(--cyan-400)' }}>#{truncateId(req.account?._id || req.account, 8, 4)}</span> is queued for system treasury release.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequestStatus}
          className="btn btn-outline btn-sm"
          disabled={isLoading}
        >
          <span>Check Status</span>
        </button>
      </div>
    );
  }

  // If user has not requested yet and can request (strictly one time)
  return (
    <div
      className="glass-panel"
      style={{
        padding: '22px 28px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(13, 20, 36, 0.95) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', maxWidth: '640px' }}>
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: 'var(--glow-cyan)'
          }}
        >
          <Sparkles size={24} color="var(--cyan-400)" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Claim Initial Welcome Deposit
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
              ONE-TIME ONLY
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Send an official request to the System Operator to disburse an initial welcome balance of{' '}
            <strong className="mono" style={{ color: 'var(--emerald-400)' }}>₹5,000.00</strong> into your account.
            This grant can only be performed once per user.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {accounts.length > 1 && (
          <select
            className="form-control mono-input"
            style={{ width: '180px', padding: '8px 12px', fontSize: '0.8rem' }}
            value={selectedAccId}
            onChange={(e) => setSelectedAccId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                #{truncateId(a._id, 6, 4)} ({a.currency})
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleSendRequest}
          className="btn btn-cyan btn-sm"
          disabled={isSubmitting || accounts.length === 0}
          style={{ padding: '10px 18px' }}
        >
          {isSubmitting ? (
            <span>Sending Request...</span>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Request ₹5,000 Deposit</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
