import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const notifySuccess = useCallback((message, title = 'Success') => {
    return addToast({ title, message, type: 'success' });
  }, [addToast]);

  const notifyError = useCallback((message, title = 'Error') => {
    return addToast({ title, message, type: 'error', duration: 6000 });
  }, [addToast]);

  const notifyInfo = useCallback((message, title = 'Notice') => {
    return addToast({ title, message, type: 'info' });
  }, [addToast]);

  const notifyWarning = useCallback((message, title = 'Warning') => {
    return addToast({ title, message, type: 'warning', duration: 5500 });
  }, [addToast]);

  return (
    <NotificationContext.Provider
      value={{
        addToast,
        removeToast,
        notifySuccess,
        notifyError,
        notifyInfo,
        notifyWarning
      }}
    >
      {children}
      <div className="toast-viewport" style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          let icon = <Info size={18} color="var(--cyan-400)" />;
          let borderCol = 'var(--cyan-500)';
          let bgCol = 'rgba(6, 182, 212, 0.1)';

          if (toast.type === 'success') {
            icon = <CheckCircle2 size={18} color="var(--emerald-400)" />;
            borderCol = 'var(--emerald-500)';
            bgCol = 'rgba(16, 185, 129, 0.1)';
          } else if (toast.type === 'error') {
            icon = <AlertCircle size={18} color="var(--rose-400)" />;
            borderCol = 'var(--rose-500)';
            bgCol = 'rgba(244, 63, 94, 0.1)';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle size={18} color="var(--amber-400)" />;
            borderCol = 'var(--amber-500)';
            bgCol = 'rgba(245, 158, 11, 0.1)';
          }

          return (
            <div
              key={toast.id}
              className="glass-panel animate-fade-in"
              style={{
                pointerEvents: 'auto',
                padding: '14px 16px',
                borderLeft: `4px solid ${borderCol}`,
                background: 'rgba(15, 23, 42, 0.95)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', wordBreak: 'break-word', lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
