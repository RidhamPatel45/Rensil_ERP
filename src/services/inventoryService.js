import { apiFetch } from './apiHelper';

export const inventoryService = {
  getInventory: async () => {
    return apiFetch('/api/inventory');
  },
  
  getLowStockItems: async () => {
    return apiFetch('/api/inventory/low-stock');
  },

  getUsageLogs: async () => {
    return apiFetch('/api/inventory/usage-logs');
  },

  updateInventoryItem: async (id, updates) => {
    return apiFetch(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  addInventoryItem: async (newItem) => {
    return apiFetch('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(newItem)
    });
  },

  addUsageLog: async (newLog) => {
    return apiFetch('/api/inventory/usage-logs', {
      method: 'POST',
      body: JSON.stringify(newLog)
    });
  }
};
