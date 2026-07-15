import AuditLog from '../models/AuditLog.js';
import { createAuditLog } from '../middleware/auditMiddleware.js';

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

export async function addAuditLog(req, res, next) {
  const { module, action, description } = req.body;
  try {
    await createAuditLog(req, module, action, description);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
}
