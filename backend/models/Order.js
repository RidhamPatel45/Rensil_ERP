import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "ORD-772"
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  product: { type: String, required: true },
  datePlaced: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, required: true },
  timelineStep: { type: Number, required: true },
  paymentStatus: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
