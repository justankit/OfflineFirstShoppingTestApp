import { Q } from '@nozbe/watermelondb';
import { database } from './database';

export interface StoredProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

class ProductStorage {
  async createProduct(
    product: Omit<StoredProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StoredProduct> {
    try {
      const productsCollection = database.get('products');
      let record: any;
      await database.write(async () => {
        record = await productsCollection.create((rec: any) => {
          rec.name = product.name;
          rec.price = product.price;
          rec.image = product.image;
          rec.syncedAt = product.syncedAt;
          rec.customSyncStatus = product.syncStatus;
        });
      });

      return {
        id: record.id,
        name: (record as any).name,
        price: (record as any).price,
        image: (record as any).image,
        createdAt: (record as any).createdAt,
        updatedAt: (record as any).updatedAt,
        syncedAt: (record as any).syncedAt,
        syncStatus: (record as any).customSyncStatus,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(
    id: string,
    updates: Partial<StoredProduct>,
  ): Promise<StoredProduct> {
    try {
      const productsCollection = database.get('products');
      const record = await productsCollection.find(id);

      await database.write(async () => {
        await record.update((record: any) => {
          if (updates.name !== undefined) record.name = updates.name;
          if (updates.price !== undefined) record.price = updates.price;
          if (updates.image !== undefined) record.image = updates.image;
          if (updates.syncedAt !== undefined)
            record.syncedAt = updates.syncedAt;
          if (updates.syncStatus !== undefined)
            record.customSyncStatus = updates.syncStatus;
        });
      });

      return {
        id: record.id,
        name: (record as any).name,
        price: (record as any).price,
        image: (record as any).image,
        createdAt: (record as any).createdAt,
        updatedAt: (record as any).updatedAt,
        syncedAt: (record as any).syncedAt,
        syncStatus: (record as any).customSyncStatus,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const productsCollection = database.get('products');
      const record = await productsCollection.find(id);
      await record.destroyPermanently();
    } catch (error) {
      throw error;
    }
  }

  async getProduct(id: string): Promise<StoredProduct | null> {
    try {
      const productsCollection = database.get('products');
      const record = await productsCollection.find(id);

      return {
        id: record.id,
        name: (record as any).name,
        price: (record as any).price,
        image: (record as any).image,
        createdAt: (record as any).createdAt,
        updatedAt: (record as any).updatedAt,
        syncedAt: (record as any).syncedAt,
        syncStatus: (record as any).customSyncStatus,
      };
    } catch (error) {
      return null;
    }
  }

  async getAllProducts(): Promise<StoredProduct[]> {
    try {
      const productsCollection = database.get('products');
      const records = await productsCollection.query().fetch();

      return records.map((product: any) => ({
        id: product.id,
        name: (product as any).name,
        price: (product as any).price,
        image: (product as any).image,
        createdAt: (product as any).createdAt,
        updatedAt: (product as any).updatedAt,
        syncedAt: (product as any).syncedAt,
        syncStatus: (product as any).customSyncStatus,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getProductsBySyncStatus(
    syncStatus: 'synced' | 'pending' | 'failed',
  ): Promise<StoredProduct[]> {
    try {
      const productsCollection = database.get('products');
      const records = await productsCollection
        .query(Q.where('sync_status', syncStatus))
        .fetch();

      return records.map((product: any) => ({
        id: product.id,
        name: (product as any).name,
        price: (product as any).price,
        image: (product as any).image,
        createdAt: (product as any).createdAt,
        updatedAt: (product as any).updatedAt,
        syncedAt: (product as any).syncedAt,
        syncStatus: (product as any).customSyncStatus,
      }));
    } catch (error) {
      throw error;
    }
  }

  async clearAllProducts(): Promise<void> {
    try {
      const productsCollection = database.get('products');
      const records = await productsCollection.query().fetch();
      await database.write(async () => {
        await Promise.all(
          records.map((record: any) => record.destroyPermanently()),
        );
      });
    } catch (error) {
      throw error;
    }
  }
}

export const productStorage = new ProductStorage();
