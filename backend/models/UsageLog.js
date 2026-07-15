import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "USG-001"
  materialId: { type: String, required: true },
  materialName: { type: String, required: true },
  quantityUsed: { type: Number, required: true },
  unit: { type: String, required: true },
  taskRef: { type: String, required: true },
  usedBy: { type: String, required: true },
  date: { type: String, required: true }
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

const UsageLog = mongoose.model('UsageLog', usageLogSchema);
export default UsageLog;
