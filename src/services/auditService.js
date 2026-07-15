import { apiFetch } from './apiHelper';

export const auditService = {
  getLogs: async () => {
    return apiFetch('/api/audit-logs');
  },

  logAction: (module, action, description) => {
    // Fire and forget to match sync signature of callers
    apiFetch('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify({ module, action, description })
    }).catch(err => console.error('Failed to log action:', err));
  }
};
