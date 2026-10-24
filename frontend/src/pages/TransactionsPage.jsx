import React from 'react';
import { TransactionList } from '../components/transactions/TransactionList';
import { useAccounts } from '../context/AccountContext';
import { ArrowUpRight, ArrowLeftRight, RefreshCw } from 'lucide-react';

export function TransactionsPage({ 
  transactions = [], 
  isLoading, 
  onRefresh, 
  onOpenTransfer, 
  onSelectTransaction 
}) {
  const { accounts } = useAccounts();
  const userAccountIds = accounts.map((a) => a._id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Transactions Explorer
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Audit trail of all idempotent state transitions and double-entry settlements
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onRefresh} className="btn btn-outline btn-sm">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={onOpenTransfer} className="btn btn-primary btn-sm">
            <ArrowUpRight size={16} />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      <TransactionList
        transactions={transactions}
        userAccountIds={userAccountIds}
        onSelectTransaction={onSelectTransaction}
        isLoading={isLoading}
      />
    </div>
  );
}
