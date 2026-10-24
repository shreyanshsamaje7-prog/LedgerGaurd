import { apiRequest } from './client';

export const depositRequestApi = {
  // Normal user methods
  getMyRequest: async () => {
    return apiRequest('/deposit-requests/my-request', {
      method: 'GET'
    });
  },

  createRequest: async ({ accountId, amount = 5000 }) => {
    return apiRequest('/deposit-requests', {
      method: 'POST',
      body: { accountId, amount: Number(amount) }
    });
  },

  // System operator methods
  getAllRequests: async () => {
    return apiRequest('/deposit-requests', {
      method: 'GET'
    });
  },

  approveRequest: async (requestId) => {
    return apiRequest(`/deposit-requests/${requestId}/approve`, {
      method: 'POST'
    });
  },

  rejectRequest: async (requestId) => {
    return apiRequest(`/deposit-requests/${requestId}/reject`, {
      method: 'POST'
    });
  }
};
