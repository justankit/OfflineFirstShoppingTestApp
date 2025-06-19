import NetInfo from '@react-native-community/netinfo';
import { database } from '@/services/storage/database';
import { Q } from '@nozbe/watermelondb';
import { orderService } from '@/services/api/orderService';
import SyncQueue, {
  SyncAction,
  EntityType,
} from '@/services/storage/database/models/SyncQueue';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  isSyncing: boolean;
  error: string | null;
  pendingActions: number;
  failedActions: number;
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'manual';
  resolveConflict?: (local: any, remote: any) => any;
}

class OfflineFirstSyncManager {
  private syncStatus: SyncStatus = {
    isOnline: false,
    lastSync: null,
    isSyncing: false,
    error: null,
    pendingActions: 0,
    failedActions: 0,
  };

  private listeners: Array<(status: SyncStatus) => void> = [];
  private syncCompleteCallbacks: Array<() => void> = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.initializeNetworkListener();
    this.startPeriodicSync();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.syncStatus.isOnline;
      this.syncStatus.isOnline = Boolean(
        state.isConnected && state.isInternetReachable,
      );

      if (!wasOnline && this.syncStatus.isOnline) {
        this.syncPendingActions();
      }

      this.notifyListeners();
    });
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
        this.syncPendingActions();
      }
    }, 30000);
  }

  async queueAction(
    entityType: EntityType,
    entityId: string,
    action: SyncAction,
    data: any,
    priority: number = 1,
  ): Promise<void> {
    try {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue');

      await database.write(async () => {
        await syncQueueCollection.create(record => {
          record.entityType = entityType;
          record.entityId = entityId;
          record.action = action;
          record.data = data;
          record.timestamp = Date.now();
          record.retryCount = 0;
          record.priority = priority;
        });
      });

      await this.updatePendingCount();

      if (this.syncStatus.isOnline) {
        setTimeout(() => {
          this.syncPendingActions();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  }

  async syncPendingActions(): Promise<void> {
    if (this.syncStatus.isSyncing || !this.syncStatus.isOnline) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.notifyListeners();

    try {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue');

      const pendingActions = await syncQueueCollection
        .query(Q.sortBy('priority', Q.desc), Q.sortBy('timestamp', Q.asc))
        .fetch();

      for (const queueItem of pendingActions) {
        try {
          await this.processSyncAction(queueItem);

          await database.write(async () => {
            await queueItem.destroyPermanently();
          });
        } catch (error) {
          await this.handleSyncError(queueItem, error);
        }
      }

      this.syncStatus.lastSync = Date.now();
      // Notify sync complete callbacks
      this.syncCompleteCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in sync complete callback:', error);
        }
      });
    } catch (error) {
      this.syncStatus.error =
        error instanceof Error ? error.message : 'Sync failed';
    } finally {
      this.syncStatus.isSyncing = false;
      await this.updatePendingCount();
      this.notifyListeners();
    }
  }

  private async processSyncAction(queueItem: SyncQueue): Promise<void> {
    const { entityType, entityId, action, data } = queueItem;

    switch (entityType) {
      case 'order':
        await this.syncOrderAction(entityId, action, data);
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  private async syncOrderAction(
    entityId: string,
    action: SyncAction,
    data: any,
  ): Promise<void> {
    const ordersCollection = database.get('orders');

    switch (action) {
      case 'create':
        try {
          const apiOrder = await orderService.createOrder({
            timestamp: data.timestamp,
            lineItems: data.lineItems.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              productId: item.productId,
            })),
          });

          await this.resolveOrderConflict(entityId, apiOrder, 'create');
        } catch (error) {
          if (error instanceof Error && error.message.includes('409')) {
            const remoteOrder = await orderService.getOrder(
              data.apiId || entityId,
            );
            await this.resolveOrderConflict(entityId, remoteOrder, 'conflict');
          } else {
            throw error;
          }
        }
        break;

      case 'update':
        try {
          const localOrder = await ordersCollection.find(entityId);
          const apiId = (localOrder as any).apiId || entityId;

          const apiOrder = await orderService.updateOrder(apiId, {
            lineItems: data.lineItems.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              productId: item.productId,
            })),
          });

          await this.resolveOrderConflict(entityId, apiOrder, 'update');
        } catch (error) {
          if (error instanceof Error && error.message.includes('409')) {
            const remoteOrder = await orderService.getOrder(
              data.apiId || entityId,
            );
            await this.resolveOrderConflict(entityId, remoteOrder, 'conflict');
          } else {
            throw error;
          }
        }
        break;

      case 'delete':
        try {
          const localOrder = await ordersCollection.find(entityId);
          const apiId = (localOrder as any).apiId || entityId;

          await orderService.deleteOrder(apiId);

          await database.write(async () => {
            await localOrder.update((record: any) => {
              record.isDeleted = true;
              record.synced = true;
            });
          });
        } catch (error) {
          if (error instanceof Error && !error.message.includes('404')) {
            throw error;
          }
        }
        break;
    }
  }

  private async resolveOrderConflict(
    localOrderId: string,
    remoteOrder: any,
    _context: 'create' | 'update' | 'conflict',
  ): Promise<void> {
    const ordersCollection = database.get('orders');
    const orderLineItemsCollection = database.get('order_line_items');

    try {
      const localOrder = await ordersCollection.find(localOrderId);
      const localData = localOrder as any;

      const localTimestamp =
        localData.lastModified || localData.updatedAt || localData.createdAt;
      const remoteTimestamp =
        remoteOrder.updatedAt ||
        remoteOrder.lastModified ||
        remoteOrder.timestamp;

      const localWins = localTimestamp >= remoteTimestamp;

      if (localWins) {
        await this.applyLocalWins(
          localOrderId,
          remoteOrder,
          ordersCollection,
          orderLineItemsCollection,
        );
      } else {
        await this.applyRemoteWins(
          localOrderId,
          remoteOrder,
          ordersCollection,
          orderLineItemsCollection,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async applyLocalWins(
    localOrderId: string,
    remoteOrder: any,
    ordersCollection: any,
    orderLineItemsCollection: any,
  ): Promise<void> {
    await database.write(async () => {
      const localOrder = await ordersCollection.find(localOrderId);
      await localOrder.update((record: any) => {
        record.synced = true;
        record.operation = '';
        record.apiId = remoteOrder.id;
      });

      const existingLineItems = await orderLineItemsCollection
        .query(Q.where('order_id', localOrderId))
        .fetch();

      for (const item of existingLineItems) {
        await item.update((record: any) => {
          record.synced = true;
          record.operation = '';
        });
      }
    });
  }

  private async applyRemoteWins(
    localOrderId: string,
    remoteOrder: any,
    ordersCollection: any,
    orderLineItemsCollection: any,
  ): Promise<void> {
    await database.write(async () => {
      const localOrder = await ordersCollection.find(localOrderId);
      await localOrder.update((record: any) => {
        record.synced = true;
        record.operation = '';
        record.apiId = remoteOrder.id;
        record.lastModified =
          remoteOrder.updatedAt ||
          remoteOrder.lastModified ||
          remoteOrder.timestamp;
        record.timestamp = remoteOrder.timestamp;
      });

      const existingLineItems = await orderLineItemsCollection
        .query(Q.where('order_id', localOrderId))
        .fetch();

      for (const item of existingLineItems) {
        await item.destroyPermanently();
      }

      for (const remoteItem of remoteOrder.lineItems || []) {
        const productsCollection = database.get('products');
        const productRecord = await productsCollection
          .query(Q.where('name', remoteItem.name))
          .fetch();

        const productId =
          productRecord.length > 0 ? productRecord[0].id : remoteItem.productId;

        await orderLineItemsCollection.create((record: any) => {
          record.name = remoteItem.name;
          record.price = remoteItem.price;
          record.quantity = remoteItem.quantity;
          record.image = remoteItem.image;
          record.orderId = localOrderId;
          record.productId = productId;
          record.synced = true;
          record.operation = '';
          record.isDeleted = false;
        });
      }
    });
  }

  private async handleSyncError(
    queueItem: SyncQueue,
    error: any,
  ): Promise<void> {
    const retryCount = queueItem.retryCount + 1;

    if (retryCount >= this.maxRetries) {
      await database.write(async () => {
        await queueItem.update(record => {
          record.retryCount = retryCount;
          record.lastError =
            error instanceof Error ? error.message : 'Unknown error';
        });
      });
    } else {
      const delay = this.retryDelay * Math.pow(2, retryCount - 1);

      setTimeout(async () => {
        await database.write(async () => {
          await queueItem.update(record => {
            record.retryCount = retryCount;
            record.lastError =
              error instanceof Error ? error.message : 'Unknown error';
          });
        });
      }, delay);
    }
  }

  private async updatePendingCount(): Promise<void> {
    try {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue');

      const [pendingActions, failedActions] = await Promise.all([
        syncQueueCollection.query().fetchCount(),
        syncQueueCollection
          .query(Q.where('retry_count', Q.gte(this.maxRetries)))
          .fetchCount(),
      ]);

      this.syncStatus.pendingActions = pendingActions;
      this.syncStatus.failedActions = failedActions;
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  addSyncCompleteCallback(callback: () => void): () => void {
    this.syncCompleteCallbacks.push(callback);
    return () => {
      const index = this.syncCompleteCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCompleteCallbacks.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getSyncStatus()));
  }

  async forcSync(): Promise<void> {
    if (this.syncStatus.isOnline) {
      await this.syncPendingActions();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  async clearFailedActions(): Promise<void> {
    try {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue');
      const failedActions = await syncQueueCollection
        .query(Q.where('retry_count', Q.gte(this.maxRetries)))
        .fetch();

      await database.write(async () => {
        for (const action of failedActions) {
          await action.destroyPermanently();
        }
      });

      await this.updatePendingCount();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to clear failed actions:', error);
    }
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners = [];
  }

  async testConflictResolution(
    localOrderId: string,
    simulatedRemoteOrder: any,
  ): Promise<void> {
    await this.resolveOrderConflict(
      localOrderId,
      simulatedRemoteOrder,
      'conflict',
    );
  }
}

export const offlineFirstSyncManager = new OfflineFirstSyncManager();
