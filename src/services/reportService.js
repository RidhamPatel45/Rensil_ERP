import { apiFetch } from './apiHelper';

export const reportService = {
  getFinancialData: async () => {
    return apiFetch('/api/reports/financials');
  },

  getEfficiencyData: async () => {
    return apiFetch('/api/reports/efficiency');
  }
};
