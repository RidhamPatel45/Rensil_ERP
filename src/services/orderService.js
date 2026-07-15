import { apiFetch } from './apiHelper';

export const orderService = {
  getOrders: async () => {
    return apiFetch('/api/orders');
  },
  
  getOrderById: async (id) => {
    return apiFetch(`/api/orders/${id}`);
  },

  updatePaymentStatus: async (id, status) => {
    return apiFetch(`/api/orders/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  addOrder: async (order) => {
    return apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  }
};
