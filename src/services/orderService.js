import ordersData from '../mockData/orders.json';
import { auditService } from './auditService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Persist orders in memory for the duration of the session
let memOrders = [...ordersData];

export const orderService = {
  getOrders: async () => {
    await delay(600);
    return [...memOrders];
  },
  
  getOrderById: async (id) => {
    await delay(400);
    return memOrders.find(o => o.id === id);
  },

  updatePaymentStatus: async (id, status) => {
    await delay(300);
    memOrders = memOrders.map(o => o.id === id ? { ...o, paymentStatus: status } : o);
    auditService.logAction('Sales', 'Payment Update', `Order ${id} marked as ${status}`);
    return true;
  },

  addOrder: async (order) => {
    await delay(400);
    memOrders = [order, ...memOrders];
    auditService.logAction('Sales', 'Order Created', `New order ${order.id} for ${order.amount} recorded.`);
    return true;
  }
};
