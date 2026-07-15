import { apiFetch } from './apiHelper';

export const approvalService = {
  getRequests: async () => {
    return apiFetch('/api/approvals');
  },
  addRequest: async (requestData) => {
    return apiFetch('/api/approvals', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  },
  updateRequestStatus: async (id, status) => {
    return apiFetch(`/api/approvals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};
