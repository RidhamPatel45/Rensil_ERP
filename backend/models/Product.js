import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID e.g., "PRD-101"
  name: { type: String, required: true },
  description: { type: String },
  price: { type: String },
  dimensions: { type: String },
  stock: { type: String },
  image: { type: String }
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

const Product = mongoose.model('Product', productSchema);
export default Product;
