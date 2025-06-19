import { Product } from '../../types';
import { API_CONFIG } from './config';

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      return products;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error}`);
    }
  },
};
