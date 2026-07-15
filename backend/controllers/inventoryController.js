import Inventory from '../models/Inventory.js';
import UsageLog from '../models/UsageLog.js';
import { createAuditLog } from '../middleware/auditMiddleware.js';

export async function getInventory(req, res, next) {
  try {
    const items = await Inventory.find({}).sort({ _id: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function getLowStock(req, res, next) {
  try {
    const items = await Inventory.find({
      $or: [{ status: 'Low Stock' }, { status: 'Critical' }]
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function getUsageLogs(req, res, next) {
  try {
    const logs = await UsageLog.find({}).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

export async function addInventoryItem(req, res, next) {
  const item = req.body;
  try {
    const newItem = await Inventory.create({
      _id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      lastRestock: item.lastRestock
    });
    
    await createAuditLog(req, 'Inventory', 'New Material', `${item.name} added to catalog.`);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
}

export async function updateInventoryItem(req, res, next) {
  const updates = req.body;
  try {
    const filteredUpdates = {};
    Object.keys(updates).forEach(k => {
      if (k !== '_id' && k !== 'id') {
        filteredUpdates[k] = updates[k];
      }
    });

    await Inventory.findOneAndUpdate(
      { _id: req.params.id },
      { $set: filteredUpdates },
      { new: true }
    );

    await createAuditLog(req, 'Inventory', 'Stock Update', `Item ${req.params.id} updated.`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function addUsageLog(req, res, next) {
  const log = req.body;
  try {
    const newLog = await UsageLog.create({
      _id: log.id,
      materialId: log.materialId,
      materialName: log.materialName,
      quantityUsed: log.quantityUsed,
      unit: log.unit,
      taskRef: log.taskRef,
      usedBy: log.usedBy,
      date: log.date
    });
    
    res.status(201).json(newLog);
  } catch (error) {
    next(error);
  }
}
