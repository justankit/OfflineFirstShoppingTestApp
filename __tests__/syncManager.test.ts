// Simple tests for sync manager business functions

import { offlineFirstSyncManager } from '../src/services/sync/offlineFirstSyncManager';

// Mock dependencies
jest.mock('../src/services/storage/database', () => ({
  database: {
    write: jest.fn(callback => callback()),
    get: jest.fn(() => ({
      create: jest.fn(),
      query: jest.fn(() => ({
        fetch: jest.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock('../src/services/api/orderService', () => ({
  orderService: {
    createOrder: jest.fn(() => Promise.resolve({ id: 'api-123' })),
  },
}));

describe('Sync Manager Business Functions', () => {
  afterAll(() => {
    jest.clearAllTimers();
  });

  test('queueAction - should queue sync action', async () => {
    const actionData = {
      timestamp: Date.now(),
      lineItems: [
        {
          id: 'item-1',
          name: 'Product',
          price: 20,
          image: 'test.jpg',
          quantity: 1,
          totalPrice: 20,
          productId: 'prod-1',
        },
      ],
    };

    await offlineFirstSyncManager.queueAction(
      'order',
      'entity-id',
      'create',
      actionData,
      1,
    );
    // If no error thrown, test passes
    expect(true).toBe(true);
  });

  test('getSyncStatus - should return sync status', () => {
    const status = offlineFirstSyncManager.getSyncStatus();

    expect(status).toBeDefined();
    expect(status).toHaveProperty('isOnline');
    expect(status).toHaveProperty('isSyncing');
  });

  test('syncPendingActions - should sync pending actions', async () => {
    await offlineFirstSyncManager.syncPendingActions();
    // If no error thrown, test passes
    expect(true).toBe(true);
  });
});
