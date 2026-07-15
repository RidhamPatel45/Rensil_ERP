import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom string ID (e.g., "1", "USR-101")
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  status: { type: String, required: true, default: 'Active' },
  password: { type: String, required: true },
  avatar: { type: String, required: true }
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

const User = mongoose.model('User', userSchema);
export default User;
