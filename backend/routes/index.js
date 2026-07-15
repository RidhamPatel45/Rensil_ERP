import express from 'express';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import salaryRoutes from './salaryRoutes.js';
import taskRoutes from './taskRoutes.js';
import approvalRoutes from './approvalRoutes.js';
import reportRoutes from './reportRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/salaries', salaryRoutes);
router.use('/tasks', taskRoutes);
router.use('/approvals', approvalRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
