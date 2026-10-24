import { apiRequest } from './client';

export const authApi = {
  login: async ({ email, password }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  register: async ({ email, password, name, isSystemUser, systemUserKey }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: { email, password, name, isSystemUser, systemUserKey }
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me', {
      method: 'GET'
    });
  }
};
