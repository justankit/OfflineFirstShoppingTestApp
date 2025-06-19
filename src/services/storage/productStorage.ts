import { database } from './database';

export interface StoredProduct {
  id: string;
  apiId: string; // Original API ID
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
          rec.apiId = product.apiId;
          rec.name = product.name;
          rec.price = product.price;
          rec.image = product.image;
          rec.syncedAt = product.syncedAt;
          rec.customSyncStatus = product.syncStatus;
        });
      });

      return {
        id: record.id,
        apiId: (record as any).apiId,
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

  async getAllProducts(): Promise<StoredProduct[]> {
    try {
      const productsCollection = database.get('products');
      const records = await productsCollection.query().fetch();

      return records.map((product: any) => ({
        id: product.id,
        apiId: (product as any).apiId,
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
