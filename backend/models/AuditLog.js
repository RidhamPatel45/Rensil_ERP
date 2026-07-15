import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "LOG-001"
  timestamp: { type: String, required: true },
  user: { type: String, required: true },
  userRole: { type: String, required: true },
  module: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true }
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

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
