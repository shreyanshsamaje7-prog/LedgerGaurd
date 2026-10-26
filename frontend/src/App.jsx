import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccountProvider, useAccounts } from './context/AccountContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AuditLedgerPage } from './pages/AuditLedgerPage';
import { SystemOperatorDashboard } from './pages/SystemOperatorDashboard';
import { TransferModal } from './components/transactions/TransferModal';
import { DepositModal } from './components/transactions/DepositModal';
import { CreateAccountModal } from './components/accounts/CreateAccountModal';
import { AccountLedgerDrawer } from './components/accounts/AccountLedgerDrawer';
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal';
import { transactionApi } from './api/transaction.api';

function MainApp() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isSystem = user?.systemUser;
  const { accounts } = useAccounts();
  const { notifyError } = useNotification();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Modals state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferFromAcc, setTransferFromAcc] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingTransactions(true);
    try {
      const data = await transactionApi.getTransactions();
      setTransactions(data?.transactions || []);
    } catch (err) {
      console.warn('Could not load transactions:', err.message);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);

  const handleOpenTransfer = (fromAccountId = null) => {
    const validId = typeof fromAccountId === 'string'
      ? fromAccountId
      : (fromAccountId && typeof fromAccountId._id === 'string' ? fromAccountId._id : null);
    setTransferFromAcc(validId);
    setIsTransferOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: 'var(--emerald-400)',
            animation: 'spin 1s linear infinite'
          }}
        />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
          Verifying cryptographic session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-wrapper">
      {/* Full-Width Navigation Bar */}
      <Navbar
        onOpenTransfer={() => handleOpenTransfer()}
        onOpenDeposit={() => setIsDepositOpen(true)}
      />

      <div className="app-container">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Content Area */}
        <div className="app-main">
          <main className="main-content">
            {activeTab === 'dashboard' && (
              isSystem ? (
                <SystemOperatorDashboard
                  onSelectTransaction={(tx) => setSelectedTxDetail(tx)}
                />
              ) : (
                <DashboardPage
                  transactions={transactions}
                  isLoadingTransactions={isLoadingTransactions}
                  onOpenTransfer={handleOpenTransfer}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
                  onViewLedger={(acc) => setSelectedLedgerAccount(acc)}
                  onSelectTransaction={(tx) => setSelectedTxDetail(tx)}
                  onNavigateToAccounts={() => setActiveTab('accounts')}
                  onNavigateToTransactions={() => setActiveTab('transactions')}
                />
              )
            )}

            {activeTab === 'accounts' && !isSystem && (
              <AccountsPage
                onOpenCreateAccount={() => setIsCreateAccountOpen(true)}
                onOpenTransfer={handleOpenTransfer}
                onViewLedger={(acc) => setSelectedLedgerAccount(acc)}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsPage
                transactions={transactions}
                isLoading={isLoadingTransactions}
                onRefresh={fetchTransactions}
                onOpenTransfer={() => handleOpenTransfer()}
                onSelectTransaction={(tx) => setSelectedTxDetail(tx)}
              />
            )}

            {activeTab === 'ledger' && (
              <AuditLedgerPage />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        initialFromAccount={transferFromAcc}
        onSuccess={() => fetchTransactions()}
      />

      {!isSystem && (
        <CreateAccountModal
          isOpen={isCreateAccountOpen}
          onClose={() => setIsCreateAccountOpen(false)}
        />
      )}

      <AccountLedgerDrawer
        isOpen={!!selectedLedgerAccount}
        onClose={() => setSelectedLedgerAccount(null)}
        account={selectedLedgerAccount}
      />

      <TransactionDetailModal
        isOpen={!!selectedTxDetail}
        onClose={() => setSelectedTxDetail(null)}
        transaction={selectedTxDetail}
      />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AccountProvider>
          <MainApp />
        </AccountProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
