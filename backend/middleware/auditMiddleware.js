import AuditLog from '../models/AuditLog.js';

export async function createAuditLog(req, module, action, description) {
  const userName = req.headers['x-user-name'] || 'System';
  const userRole = req.headers['x-user-role'] || 'System';
  const id = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();
  
  try {
    await AuditLog.create({
      _id: id,
      timestamp,
      user: userName,
      userRole,
      module,
      action,
      description
    });
    console.log(`[AUDIT] ${action} by ${userName}`);
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
  }
}
