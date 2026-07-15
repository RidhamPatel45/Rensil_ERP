import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "REQ-01"
  subject: { type: String, required: true },
  requestedBy: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true, default: 'Pending' },
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

const Approval = mongoose.model('Approval', approvalSchema);
export default Approval;
