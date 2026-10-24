import React, { useState, useEffect } from 'react';
import { depositRequestApi } from '../api/depositRequest.api';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatDate, truncateId, copyToClipboard } from '../utils/formatters';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Copy, 
  RefreshCw, 
  User, 
  CreditCard,
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';

export function SystemOperatorDashboard({ onSelectTransaction }) {
  const { notifySuccess, notifyError } = useNotification();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await depositRequestApi.getAllRequests();
      setRequests(data?.requests || []);
    } catch (err) {
      notifyError(err.message || 'Failed to load deposit requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId, userAccId, amount) => {
    setProcessingId(requestId);
    try {
      await depositRequestApi.approveRequest(requestId);
      notifySuccess(`Disbursed ${formatCurrency(amount)} to Account #${truncateId(userAccId, 6, 4)}!`);
      await loadRequests();
    } catch (err) {
      notifyError(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await depositRequestApi.rejectRequest(requestId);
      notifySuccess('Deposit request rejected.');
      await loadRequests();
    } catch (err) {
      notifyError(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      notifySuccess(`${label} copied to clipboard`);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const totalDisbursed = approvedRequests.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(13, 20, 36, 0.95) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-cyan">
              <ShieldCheck size={13} />
              SYSTEM OPERATOR CONSOLE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Master Treasury Authority
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Central Treasury & Liquidity Queue
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review user deposit grant notifications and approve double-entry funds disbursement.
          </p>
        </div>

        <button onClick={loadRequests} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Sync Requests</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Liquidity Disbursed
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <Sparkles size={18} color="var(--emerald-400)" />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px' }}>
            {formatCurrency(totalDisbursed)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {approvedRequests.length} Approved Grants
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Pending Deposit Requests
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <Bell size={18} color="var(--amber-400)" />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--amber-400)', marginTop: '12px' }}>
            {pendingRequests.length} Pending
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Requires operator authorization
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total System Requests
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
              <Inbox size={18} color="var(--cyan-400)" />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--cyan-400)', marginTop: '12px' }}>
            {requests.length} Total
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            One-time welcome grant queue
          </span>
        </div>
      </div>

      {/* PENDING NOTIFICATION QUEUE SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={16} color="var(--amber-400)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              User Deposit Notifications ({pendingRequests.length})
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Verify user account number and transfer requested welcome funds
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={36} color="var(--emerald-400)" />
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>No Pending Requests</h4>
            <p style={{ fontSize: '0.8125rem' }}>
              All user deposit grant requests have been reviewed and processed.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pendingRequests.map((req) => {
              const userAccId = req.account?._id || req.account;
              const isProcessing = processingId === req._id;

              return (
                <div
                  key={req._id}
                  className="glass-panel animate-fade-in"
                  style={{
                    padding: '20px 24px',
                    borderLeft: '4px solid var(--amber-400)',
                    background: 'rgba(16, 25, 44, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}
                >
                  {/* Left: User details & Account Number */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                        border: '1px solid var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {req.user?.name ? req.user.name[0].toUpperCase() : <User size={18} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {req.user?.name || 'User'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {req.user?.email}
                        </span>
                        <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>
                          <Clock size={10} className="animate-spin" /> PENDING DISBURSEMENT
                        </span>
                      </div>

                      {/* User Account Number Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.25)'
                          }}
                        >
                          <CreditCard size={13} color="var(--cyan-400)" />
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>User Acc No:</span>
                          <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cyan-400)' }}>
                            {userAccId}
                          </span>
                          <button
                            onClick={() => handleCopy(userAccId, 'Account Number')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                            title="Copy Account Number"
                          >
                            <Copy size={12} />
                          </button>
                        </div>

                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Requested: {formatDate(req.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Send Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Requested Amount
                      </div>
                      <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                        {formatCurrency(req.amount)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--rose-400)' }}
                        disabled={isProcessing}
                      >
                        <XCircle size={15} />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req._id, userAccId, req.amount)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '9px 18px' }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span>Disbursing Funds...</span>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Send Amount</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETED / APPROVED GRANTS HISTORY */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Disbursed Grants History ({approvedRequests.length})
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Settled atomic transfers from Central Treasury to user accounts
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {approvedRequests.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No completed grant disbursements yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>RECIPIENT USER</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>USER ACC NO</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>AMOUNT DISBURSED</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600 }}>SETTLED DATE</th>
                </tr>
              </thead>
              <tbody>
                {approvedRequests.map((req) => (
                  <tr
                    key={req._id}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td style={{ padding: '14px 10px' }}>
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={11} /> APPROVED & SENT
                      </span>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {req.user?.name || 'User'}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {req.user?.email}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <span className="mono" style={{ color: 'var(--cyan-400)' }}>
                        {truncateId(req.account?._id || req.account, 8, 6)}
                      </span>
                    </td>

                    <td style={{ padding: '14px 10px' }}>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--emerald-400)', fontSize: '0.9rem' }}>
                        +{formatCurrency(req.amount)}
                      </span>
                    </td>

                    <td style={{ padding: '14px 10px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {formatDate(req.approvedAt || req.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
