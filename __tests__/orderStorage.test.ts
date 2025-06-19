// Simple tests for orderStorage business functions

import { orderStorage } from '../src/services/storage/orderStorage';

// Mock database to allow business logic testing
jest.mock('../src/services/storage/database', () => ({
  database: {
    write: jest.fn(callback => callback()),
    get: jest.fn(() => ({
      create: jest.fn(() => ({ id: 'test-order-id' })),
      find: jest.fn(() =>
        Promise.resolve({
          update: jest.fn(),
        }),
      ),
      query: jest.fn(() => ({
        fetch: jest.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

jest.mock('@nozbe/watermelondb', () => ({
  Q: { where: jest.fn() },
}));

describe('OrderStorage Business Functions', () => {
  afterAll(() => {
    jest.clearAllTimers();
  });

  test('createOrder - should create new order', async () => {
    const orderData = {
      timestamp: Date.now(),
      lineItems: [
        {
          id: 'item-1',
          name: 'Test Product',
          price: 10,
          image: 'test.jpg',
          quantity: 1,
          totalPrice: 10,
          productId: 'prod-1',
          orderId: '',
          syncStatus: 'pending' as const,
        },
      ],
    };

    const result = await orderStorage.createOrder(orderData);
    expect(result).toBeDefined();
  });

  test('updateOrder - should update existing order', async () => {
    const updateData = {
      lineItems: [
        {
          id: 'item-2',
          name: 'Updated Product',
          price: 15,
          image: 'updated.jpg',
          quantity: 2,
          totalPrice: 30,
          productId: 'prod-2',
          orderId: 'order-1',
          syncStatus: 'pending' as const,
        },
      ],
    };

    const result = await orderStorage.updateOrder('test-id', updateData);
    expect(result).toBeDefined();
  });

  test('deleteOrder - should delete order', async () => {
    await orderStorage.deleteOrder('test-id');
    // If no error thrown, test passes
    expect(true).toBe(true);
  });
});
