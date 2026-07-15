import express from 'express';
import { getApprovals, createApproval, updateApprovalStatus } from '../controllers/approvalController.js';

const router = express.Router();

router.get('/', getApprovals);
router.post('/', createApproval);
router.put('/:id', updateApprovalStatus);

export default router;
