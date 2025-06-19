import NetInfo from '@react-native-community/netinfo';
import { productService } from '@/services/api/productService';
import {
  productStorage,
  StoredProduct,
} from '@/services/storage/productStorage';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  isSyncing: boolean;
  error: string | null;
}

class SyncManager {
  private syncStatus: SyncStatus = {
    isOnline: true,
    lastSync: null,
    isSyncing: false,
    error: null,
  };

  private async checkOnlineStatus(): Promise<boolean> {
    try {
      const initialState = await NetInfo.fetch();
      await new Promise(resolve => setTimeout(resolve, 2000));
      const finalState = await NetInfo.fetch();
      const isInternetReachable = finalState.isInternetReachable;
      const isConnected = Boolean(finalState.isConnected);
      const isOnline = isConnected && isInternetReachable;

      const initialIsOnline =
        Boolean(initialState.isConnected) &&
        initialState.isInternetReachable === true;

      return isOnline || initialIsOnline;
    } catch (error) {
      return false;
    }
  }

  async syncProducts(): Promise<void> {
    if (this.syncStatus.isSyncing) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;

    try {
      this.syncStatus.isOnline = await this.checkOnlineStatus();

      if (!this.syncStatus.isOnline) {
        throw new Error('No internet connection');
      }

      const apiProducts = await productService.getProducts();
      const storedProducts: Omit<
        StoredProduct,
        'id' | 'createdAt' | 'updatedAt'
      >[] = apiProducts.map(product => ({
        apiId: product.id, // Store the original API ID
        name: product.name,
        price: product.price,
        image: product.image,
        syncedAt: Date.now(),
        syncStatus: 'synced' as const,
      }));

      // Clear existing products and save new ones
      await productStorage.clearAllProducts();

      for (const product of storedProducts) {
        await productStorage.createProduct(product);
      }

      this.syncStatus.lastSync = Date.now();
    } catch (error) {
      this.syncStatus.error =
        error instanceof Error ? error.message : 'Sync failed';
      throw error;
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  getSyncStatus(): SyncStatus {
    const status = { ...this.syncStatus };
    return status;
  }

  async loadProducts(): Promise<StoredProduct[]> {
    try {
      const products = await productStorage.getAllProducts();
      if (products.length === 0) {
        await this.syncProducts();
        return await productStorage.getAllProducts();
      }

      return products;
    } catch (error) {
      return [];
    }
  }

  async backgroundSync(): Promise<void> {
    try {
      const isOnline = await this.checkOnlineStatus();
      if (isOnline) {
        await this.syncProducts();
      }
    } catch (error) {}
  }

  async forceSync(): Promise<void> {
    this.syncStatus.lastSync = null;
    await this.syncProducts();
  }
}

export const syncManager = new SyncManager();
