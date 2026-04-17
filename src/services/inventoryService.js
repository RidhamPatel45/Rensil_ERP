import inventoryData from '../mockData/inventory.json';
import usageLogs from '../mockData/usageLogs.json';
import { auditService } from './auditService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Keep active memory proxy to persist state
let memInventory = [...inventoryData];
let memLogs = [...usageLogs];

export const inventoryService = {
  getInventory: async () => {
    await delay(500);
    return [...memInventory];
  },
  
  getLowStockItems: async () => {
    await delay(300);
    return memInventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical');
  },

  getUsageLogs: async () => {
    await delay(400);
    return [...memLogs];
  },

  updateInventoryItem: async (id, updates) => {
    await delay(200);
    memInventory = memInventory.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    auditService.logAction('Inventory', 'Stock Update', `Item ${id} updated with ${JSON.stringify(updates)}`);
  },

  addInventoryItem: async (newItem) => {
    await delay(200);
    memInventory = [newItem, ...memInventory];
    auditService.logAction('Inventory', 'New Material', `${newItem.name} added to catalog.`);
  },

  addUsageLog: async (newLog) => {
    await delay(200);
    memLogs = [newLog, ...memLogs];
  }
};
