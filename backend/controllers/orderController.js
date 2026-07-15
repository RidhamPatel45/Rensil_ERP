import Order from '../models/Order.js';
import { createAuditLog } from '../middleware/auditMiddleware.js';

export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find({}).sort({ datePlaced: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  const o = req.body;
  try {
    const newOrder = await Order.create({
      _id: o.id,
      customerName: o.customerName,
      email: o.email,
      product: o.product,
      datePlaced: o.datePlaced,
      amount: o.amount,
      status: o.status,
      timelineStep: o.timelineStep,
      paymentStatus: o.paymentStatus
    });

    await createAuditLog(req, 'Sales', 'Order Created', `New order ${o.id} for ${o.amount} recorded.`);
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentStatus(req, res, next) {
  const { status } = req.body;
  try {
    await Order.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { paymentStatus: status } }
    );

    await createAuditLog(req, 'Sales', 'Payment Update', `Order ${req.params.id} marked as ${status}`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
