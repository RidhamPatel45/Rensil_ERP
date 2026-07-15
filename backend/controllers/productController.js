import Product from '../models/Product.js';

export async function getProducts(req, res, next) {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    next(error);
  }
}
