import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  KeyRound, 
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

export function AuthPage() {
  const { login, register } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('user'); // 'user' | 'systemUser'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [systemUserKey, setSystemUserKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSystemUserKey, setShowSystemUserKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        notifySuccess('Welcome back to LedgerGuard!');
      } else {
        if (!name.trim()) {
          notifyError('Full Name is required for account creation');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          notifyError('Password must contain at least 6 characters');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          notifyError('Passwords do not match. Please ensure both passwords match.');
          setIsSubmitting(false);
          return;
        }

        const isSys = role === 'systemUser';
        if (isSys && !systemUserKey.trim()) {
          notifyError('System User Key is required to register as a System User');
          setIsSubmitting(false);
          return;
        }

        await register({
          email,
          password,
          name,
          isSystemUser: isSys,
          systemUserKey: isSys ? systemUserKey.trim() : undefined
        });

        notifySuccess(
          isSys 
            ? 'Authorized System Operator registered and logged in!' 
            : 'Account registered successfully! Welcome to LedgerGuard.'
        );
      }
    } catch (err) {
      notifyError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoCredentials = () => {
    setEmail('user@ledgerguard.io');
    setPassword('user1234');
    setConfirmPassword('user1234');
  };

  return (
    <div
      className="auth-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative'
      }}
    >
      {/* Left Hero Section (Visuals & Trust) */}
      <div
        className="auth-hero"
        style={{
          flex: '1.1 1 500px',
          background: 'linear-gradient(135deg, rgba(8, 12, 20, 0.98) 0%, rgba(13, 20, 36, 0.98) 100%)',
          borderRight: '1px solid var(--border-subtle)',
          padding: 'clamp(28px, 4vw, 48px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle background decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--glow-emerald)'
              }}
            >
              <ShieldCheck size={24} color="#080C14" strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                Ledger<span style={{ color: 'var(--emerald-400)' }}>Guard</span>
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Enterprise Double-Entry Consensus Platform
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="badge badge-emerald"
            style={{ marginBottom: '14px', padding: '5px 12px', fontSize: '0.72rem' }}
          >
            <Sparkles size={13} />
            Zero Balance Discrepancy Guaranteed
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', lineHeight: 1.2, marginBottom: '14px', fontWeight: 800 }}>
            Financial Truth Backed by{' '}
            <span className="gradient-text-emerald">Immutable Audit Logs</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55, maxWidth: '540px' }}>
            Built upon strict double-entry ledger bookkeeping. Every credit is balanced by an exact debit, protected by cryptographic idempotency keys and distributed MongoDB session locks.
          </p>
        </div>

        {/* Architecture Pillars */}
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div
            className="glass-panel"
            style={{ padding: '14px', background: 'rgba(16, 25, 44, 0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-400)', marginBottom: '4px' }}>
              <Layers size={15} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Double-Entry Pure</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Balances are never mutated directly; derived dynamically from append-only ledger entries.
            </p>
          </div>

          <div
            className="glass-panel"
            style={{ padding: '14px', background: 'rgba(16, 25, 44, 0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-400)', marginBottom: '4px' }}>
              <KeyRound size={15} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Strict Idempotency</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Automatic protection against double-spends and network retries with unique keys.
            </p>
          </div>
        </div>

        {/* Live Transaction Ledger Diagram Card */}
        <div
          className="glass-panel"
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '16px 18px',
            background: 'rgba(13, 20, 36, 0.75)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot status-dot-pulse" style={{ backgroundColor: 'var(--emerald-400)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                ATOMIC STATE TRANSITION VERIFICATION
              </span>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
              ACID GUARANTEED
            </span>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(6, 10, 18, 0.8)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.73rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--rose-400)' }}>
              <span>[1] DEBIT Vault_A (0x8f...4e)</span>
              <span>-₹5,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald-400)' }}>
              <span>[2] CREDIT Vault_B (0x3c...9a)</span>
              <span>+₹5,000.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--cyan-400)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px', marginTop: '2px' }}>
              <span>NET DELTA VERIFICATION</span>
              <span style={{ fontWeight: 700 }}>₹0.00 (ZERO DISCREPANCY)</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
          <span>ISO 20022 Aligned</span>
          <span>•</span>
          <span>ACID Transaction Engine</span>
          <span>•</span>
          <span>SHA-256 Ledger Audit</span>
        </div>
      </div>

      {/* Right Form Section */}
      <div
        className="auth-form-wrapper"
        style={{
          flex: '1 1 380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 4vw, 40px)',
          background: 'var(--bg-primary)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(13, 20, 36, 0.9)',
              padding: '4px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-medium)',
              marginBottom: '32px'
            }}
          >
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: mode === 'login' ? 'var(--bg-tertiary)' : 'transparent',
                color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: mode === 'register' ? 'var(--bg-tertiary)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome Back' : 'Get Started with LedgerGuard'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {mode === 'login'
                ? 'Authenticate to access your secure vaults and transaction ledger.'
                : 'Instantiate your user identity with cryptographic audit logging.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                {/* Account Role Selector */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Account Authority Tier</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Choose privileges</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                    <div
                      onClick={() => setRole('user')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: role === 'user' ? '1.5px solid var(--emerald-400)' : '1px solid var(--border-medium)',
                        background: role === 'user' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(13, 20, 36, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'user' ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
                          Standard User
                        </span>
                        {role === 'user' && <CheckCircle2 size={15} color="var(--emerald-400)" />}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Vaults & peer transfers
                      </span>
                    </div>

                    <div
                      onClick={() => setRole('systemUser')}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: role === 'systemUser' ? '1.5px solid var(--cyan-400)' : '1px solid var(--border-medium)',
                        background: role === 'systemUser' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(13, 20, 36, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'systemUser' ? 'var(--cyan-400)' : 'var(--text-primary)' }}>
                          System Operator
                        </span>
                        {role === 'systemUser' && <CheckCircle2 size={15} color="var(--cyan-400)" />}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Treasury & liquidity minting
                      </span>
                    </div>
                  </div>
                </div>

                {/* System User Key Prompt */}
                {role === 'systemUser' && (
                  <div className="form-group animate-fade-in">
                    <label className="form-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--cyan-400)' }}>
                        <KeyRound size={14} />
                        System User Authorization Key
                      </span>
                    </label>
                    <div className="input-with-icon" style={{ position: 'relative' }}>
                      <span className="input-icon-left">
                        <KeyRound size={16} color="var(--cyan-400)" />
                      </span>
                      <input
                        type={showSystemUserKey ? 'text' : 'password'}
                        className="form-control mono-input"
                        style={{ paddingRight: '42px' }}
                        placeholder="Enter master authorization key..."
                        value={systemUserKey}
                        onChange={(e) => setSystemUserKey(e.target.value)}
                        required={role === 'systemUser'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSystemUserKey(!showSystemUserKey)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title={showSystemUserKey ? "Hide key" : "Show key"}
                      >
                        {showSystemUserKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-with-icon">
                    <span className="input-icon-left">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Satoshi Nakamoto"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={mode === 'register'}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@ledgerguard.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon-left">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: '42px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Minimum 6 characters with secure bcrypt salt hash
                </span>
              )}
            </div>

            {/* Confirm Password Field (Register mode only) */}
            {mode === 'register' && (
              <div className="form-group animate-fade-in">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <span className="input-icon-left">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingRight: '42px' }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required={mode === 'register'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '16px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Ledger' : 'Create Identity'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Want to try right away?
            </p>
            <button
              type="button"
              onClick={handleDemoCredentials}
              className="btn btn-outline btn-sm"
              style={{ margin: '0 auto', fontSize: '0.75rem' }}
            >
              Fill Sample Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
