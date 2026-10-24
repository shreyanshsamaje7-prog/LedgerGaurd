import { apiRequest } from './client';

export const accountApi = {
  getAccounts: async () => {
    return apiRequest('/accounts', {
      method: 'GET'
    });
  },

  createAccount: async (data = {}) => {
    return apiRequest('/accounts', {
      method: 'POST',
      body: data
    });
  },

  getBalance: async (accountId) => {
    return apiRequest(`/accounts/balance/${accountId}`, {
      method: 'GET'
    });
  },

  getAccountLedger: async (accountId) => {
    return apiRequest(`/accounts/${accountId}/ledger`, {
      method: 'GET'
    });
  }
};
