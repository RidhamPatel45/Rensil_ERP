import { apiFetch } from './apiHelper';

export const userService = {
  login: async (email, password) => {
    return apiFetch('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getUsers: async () => {
    return apiFetch('/api/users');
  },
  
  addUser: async (userData) => {
    return apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id, updates) => {
    return apiFetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  getUserById: async (id) => {
    return apiFetch(`/api/users/${id}`);
  }
};
