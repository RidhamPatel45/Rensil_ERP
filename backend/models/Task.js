import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "TSK-001"
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  assignedTo: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, required: true },
  dueDate: { type: String, required: true }
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

const Task = mongoose.model('Task', taskSchema);
export default Task;
