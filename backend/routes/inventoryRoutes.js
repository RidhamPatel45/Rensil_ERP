import express from 'express';
import { getInventory, getLowStock, getUsageLogs, addInventoryItem, updateInventoryItem, addUsageLog } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.get('/low-stock', getLowStock);
router.get('/usage-logs', getUsageLogs);
router.post('/', addInventoryItem);
router.put('/:id', updateInventoryItem);
router.post('/usage-logs', addUsageLog);

export default router;
