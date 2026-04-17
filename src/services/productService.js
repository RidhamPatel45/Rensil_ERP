import productsData from '../mockData/products.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  getProducts: async () => {
    // Simulate network delay
    await delay(500);
    return productsData;
  }
};
