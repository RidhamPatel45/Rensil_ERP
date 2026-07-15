import express from 'express';
import { getAuditLogs, addAuditLog } from '../controllers/auditController.js';

const router = express.Router();

router.get('/', getAuditLogs);
router.post('/', addAuditLog);

export default router;
