import { apiFetch } from './apiHelper';

export const supplierService = {
  getPurchaseOrders: async () => {
    return apiFetch('/api/suppliers/purchase-orders');
  },
  
  getShipments: async () => {
    return apiFetch('/api/suppliers/shipments');
  }
};
