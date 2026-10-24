import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { accountApi } from '../api/account.api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { notifyError } = useNotification();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated) {
      setAccounts([]);
      setSelectedAccountId(null);
      return;
    }

    setIsLoading(true);
    try {
      const data = await accountApi.getAccounts();
      const loaded = data?.accounts || [];
      setAccounts(loaded);

      setSelectedAccountId((prev) => {
        if (prev && loaded.some((a) => a._id === prev)) {
          return prev;
        }
        return loaded[0]?._id || null;
      });
    } catch (err) {
      notifyError(err.message || 'Failed to load ledger accounts');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, notifyError]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a._id === selectedAccountId) || accounts[0] || null;
  }, [accounts, selectedAccountId]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);
  }, [accounts]);

  const createAccount = useCallback(async (currency = 'INR') => {
    try {
      const data = await accountApi.createAccount({ currency });
      await fetchAccounts();
      return data;
    } catch (err) {
      throw err;
    }
  }, [fetchAccounts]);

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccount,
        selectedAccountId,
        setSelectedAccountId,
        totalBalance,
        isLoading,
        refreshAccounts: fetchAccounts,
        createAccount
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
