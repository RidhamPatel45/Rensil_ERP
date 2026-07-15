import mongoose from 'mongoose';

const supplyOrderSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "SUP-001"
  factoryRef: { type: String, required: true },
  material: { type: String, required: true },
  quantity: { type: String, required: true },
  dateRequested: { type: String, required: true },
  status: { type: String, required: true },
  amount: { type: String, required: true },
  eta: { type: String },
  shippingCarrier: { type: String }
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

const SupplyOrder = mongoose.model('SupplyOrder', supplyOrderSchema);
export default SupplyOrder;
