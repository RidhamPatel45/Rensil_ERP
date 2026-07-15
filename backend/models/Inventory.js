import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "INV-001"
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  status: { type: String, required: true },
  lastRestock: { type: String, required: true }
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

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
