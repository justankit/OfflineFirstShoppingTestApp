import { Order } from './types';
import { API_CONFIG } from './config';

export const orderService = {
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Orders/${orderId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error}`);
    }
  },

  async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  },

  async updateOrder(
    orderId: string,
    orderData: Partial<Order>,
  ): Promise<Order> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      return order;
    } catch (error) {
      throw new Error(`Failed to update order: ${error}`);
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/Orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete order: ${error}`);
    }
  },
};
