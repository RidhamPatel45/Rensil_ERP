import { apiFetch } from './apiHelper';

export const productService = {
  getProducts: async () => {
    return apiFetch('/api/products');
  }
};
