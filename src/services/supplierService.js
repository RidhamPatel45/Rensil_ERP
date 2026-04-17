import supplyOrdersData from '../mockData/supplyOrders.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const supplierService = {
  getPurchaseOrders: async () => {
    await delay(500);
    return supplyOrdersData;
  },
  
  getShipments: async () => {
    await delay(400);
    return supplyOrdersData.filter(o => o.status === 'Shipped');
  }
};
