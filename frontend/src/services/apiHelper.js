export const API_URL = import.meta.env.VITE_API_URL || '';

export const getAuthHeaders = () => {
  const savedUser = localStorage.getItem('rensil_erp_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      return {
        'Content-Type': 'application/json',
        'x-user-name': user.name,
        'x-user-role': user.role
      };
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  return { 'Content-Type': 'application/json' };
};

export const apiFetch = async (endpoint, options = {}) => {
  const headers = { ...getAuthHeaders(), ...options.headers };
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `API request to ${endpoint} failed`);
  }
  return response.json();
};
