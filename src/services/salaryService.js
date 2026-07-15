import { apiFetch } from './apiHelper';

export const salaryService = {
  // Get salary for a specific user
  getMySalary: async (userId) => {
    return apiFetch(`/api/salaries/my/${userId}`);
  },

  // Get all salaries (Admin only)
  getAllSalaries: async () => {
    return apiFetch('/api/salaries');
  },

  // Update payment status
  updatePaymentStatus: async (userId, status) => {
    return apiFetch(`/api/salaries/payout/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};
