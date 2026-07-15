import mongoose from 'mongoose';

const workDetailsSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  value: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const salaryHistorySchema = new mongoose.Schema({
  month: { type: String, required: true },
  amount: { type: String, required: true },
  status: { type: String, required: true }
}, { _id: false });

const salarySchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Store userId as primary key string ID
  baseSalary: { type: String, required: true },
  allowance: { type: String, required: true },
  bonuses: { type: String, required: true },
  deductions: { type: String, required: true },
  netSalary: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  lastPaymentDate: { type: String, required: true },
  workDetails: { type: workDetailsSchema, default: null },
  history: { type: [salaryHistorySchema], default: [] }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.userId = ret._id; // Provide userId mapping
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.userId = ret._id;
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Salary = mongoose.model('Salary', salarySchema);
export default Salary;
