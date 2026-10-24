import { apiRequest } from './client';

export const transactionApi = {
  getTransactions: async () => {
    return apiRequest('/transactions', {
      method: 'GET'
    });
  },

  createTransaction: async ({ fromAccount, toAccount, amount, idempotencyKey }) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: { fromAccount, toAccount, amount: Number(amount), idempotencyKey }
    });
  },

  depositInitialFunds: async ({ toAccount, amount, idempotencyKey }) => {
    return apiRequest('/transactions/system/initial-funds', {
      method: 'POST',
      body: { toAccount, amount: Number(amount), idempotencyKey }
    });
  }
};
