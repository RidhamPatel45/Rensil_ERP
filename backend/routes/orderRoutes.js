import express from 'express';
import { getOrders, getOrderById, createOrder, updatePaymentStatus } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id/payment', updatePaymentStatus);

export default router;
