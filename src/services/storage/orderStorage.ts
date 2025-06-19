import { database } from './database';
import { Q } from '@nozbe/watermelondb';

export interface StoredOrder {
  id: string;
  timestamp: number;
  lineItems: StoredOrderLineItem[];
  syncStatus: 'pending' | 'synced' | 'failed' | 'pending_deletion';
  createdAt: number;
  updatedAt: number;
  apiId?: string; // API ID for syncing with remote server
}

export interface StoredOrderLineItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  totalPrice: number;
  productId: string;
  orderId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

class OrderStorage {
  async createOrder(
    orderData: Omit<
      StoredOrder,
      'id' | 'syncStatus' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<StoredOrder> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      let createdOrder: any;

      await database.write(async () => {
        // Create the order
        createdOrder = await ordersCollection.create((rec: any) => {
          rec.timestamp = orderData.timestamp;
          rec.synced = false;
          rec.operation = 'create';
          rec.isDeleted = false;
          rec.lastModified = Date.now(); // Set initial lastModified for conflict resolution
        });

        // Create line items
        for (const lineItem of orderData.lineItems) {
          await orderLineItemsCollection.create((rec: any) => {
            rec.name = lineItem.name;
            rec.price = lineItem.price;
            rec.quantity = lineItem.quantity;
            rec.image = lineItem.image;
            rec.orderId = createdOrder.id;
            rec.productId = lineItem.productId;
            rec.synced = false;
            rec.operation = 'create';
            rec.isDeleted = false;
          });
        }
      });

      return await this.getOrderById(createdOrder.id);
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(
    orderId: string,
    orderData: Partial<StoredOrder>,
  ): Promise<StoredOrder> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      await database.write(async () => {
        // Update the order
        const orderRecord = await ordersCollection.find(orderId);
        if (orderRecord) {
          await orderRecord.update((rec: any) => {
            if (orderData.timestamp !== undefined)
              rec.timestamp = orderData.timestamp;
            rec.synced = false;
            rec.operation = 'update';
            rec.lastModified = Date.now(); // Set lastModified for conflict resolution
          });
        }

        // Update line items if provided
        if (orderData.lineItems) {
          // Delete existing line items
          const existingLineItems = await orderLineItemsCollection
            .query(Q.where('order_id', orderId))
            .fetch();

          for (const item of existingLineItems) {
            await item.update((rec: any) => {
              rec.isDeleted = true;
              rec.operation = 'delete';
            });
          }

          // Create new line items
          for (const lineItem of orderData.lineItems) {
            await orderLineItemsCollection.create((rec: any) => {
              rec.name = lineItem.name;
              rec.price = lineItem.price;
              rec.quantity = lineItem.quantity;
              rec.image = lineItem.image;
              rec.orderId = orderId;
              rec.productId = lineItem.productId;
              rec.synced = false;
              rec.operation = 'create';
              rec.isDeleted = false;
            });
          }
        }
      });

      return await this.getOrderById(orderId);
    } catch (error) {
      throw error;
    }
  }

  async getActiveOrder(): Promise<StoredOrder | null> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      const activeOrders = await ordersCollection
        .query(Q.where('is_deleted', false))
        .fetch();

      if (activeOrders.length === 0) {
        return null;
      }

      // Get the most recent active order
      const orderRecord = activeOrders[0];
      const orderData = orderRecord as any;

      const lineItems = await orderLineItemsCollection
        .query(Q.where('order_id', orderData.id), Q.where('is_deleted', false))
        .fetch();

      return {
        id: orderData.id,
        timestamp: orderData.timestamp,
        lineItems: lineItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          productId: item.productId,
          orderId: item.orderId,
          syncStatus: item.synced ? 'synced' : 'pending',
        })),
        syncStatus:
          orderData.operation === 'delete'
            ? 'pending_deletion'
            : orderData.synced
            ? 'synced'
            : 'pending',
        createdAt: orderData.createdAt?.getTime() || Date.now(),
        updatedAt: orderData.updatedAt?.getTime() || Date.now(),
        apiId: orderData.apiId,
      };
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<StoredOrder> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      const orderRecord = await ordersCollection.find(orderId);
      const orderData = orderRecord as any;

      const lineItems = await orderLineItemsCollection
        .query(Q.where('order_id', orderId), Q.where('is_deleted', false))
        .fetch();

      return {
        id: orderData.id,
        timestamp: orderData.timestamp,
        lineItems: lineItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          productId: item.productId,
          orderId: item.orderId,
          syncStatus: item.synced ? 'synced' : 'pending',
        })),
        syncStatus:
          orderData.operation === 'delete'
            ? 'pending_deletion'
            : orderData.synced
            ? 'synced'
            : 'pending',
        createdAt: orderData.createdAt?.getTime() || Date.now(),
        updatedAt: orderData.updatedAt?.getTime() || Date.now(),
        apiId: orderData.apiId,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      await database.write(async () => {
        // Mark order as deleted
        const orderRecord = await ordersCollection.find(orderId);
        if (orderRecord) {
          await orderRecord.update((rec: any) => {
            rec.isDeleted = true;
            rec.operation = 'delete';
            rec.synced = false;
          });
        }

        // Mark line items as deleted
        const lineItems = await orderLineItemsCollection
          .query(Q.where('order_id', orderId))
          .fetch();

        for (const item of lineItems) {
          await item.update((rec: any) => {
            rec.isDeleted = true;
            rec.operation = 'delete';
            rec.synced = false;
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async markOrderForDeletion(orderId: string): Promise<StoredOrder> {
    try {
      const ordersCollection = database.get('orders');

      await database.write(async () => {
        // Mark order as pending deletion (but keep it visible with special status)
        const orderRecord = await ordersCollection.find(orderId);
        if (orderRecord) {
          await orderRecord.update((rec: any) => {
            rec.operation = 'delete';
            rec.synced = false;
            // Don't mark as deleted yet - keep visible but mark as pending deletion
          });
        }
      });

      // Return the updated order so UI can show pending deletion state
      return await this.getOrderById(orderId);
    } catch (error) {
      throw error;
    }
  }

  async updateOrderWithApiData(
    localOrderId: string,
    apiOrder: any,
  ): Promise<StoredOrder> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      await database.write(async () => {
        // Update the local order with API data
        const orderRecord = await ordersCollection.find(localOrderId);
        if (orderRecord) {
          await orderRecord.update((rec: any) => {
            rec.synced = true;
            rec.operation = '';
            rec.apiId = apiOrder.id; // Store API ID for future syncs
          });
        }

        // Get existing line items to preserve productId mappings
        const existingLineItems = await orderLineItemsCollection
          .query(Q.where('order_id', localOrderId))
          .fetch();

        // Create a map of product names to existing line items to preserve productId
        const existingItemsMap = new Map();
        existingLineItems.forEach((item: any) => {
          existingItemsMap.set(item.name, item);
        });

        // Update existing line items with API data
        for (const lineItem of apiOrder.lineItems) {
          const existingItem = existingItemsMap.get(lineItem.name);

          if (existingItem) {
            // Update existing item with API data
            await existingItem.update((rec: any) => {
              rec.price = lineItem.price;
              rec.quantity = lineItem.quantity;
              rec.image = lineItem.image;
              rec.synced = true;
              rec.operation = '';
              rec.isDeleted = false;
              // Preserve the existing productId
            });
          } else {
            // Create new item if it doesn't exist
            // Try to find the product ID from the products table
            const productsCollection = database.get('products');
            const productRecord = await productsCollection
              .query(Q.where('name', lineItem.name))
              .fetch();

            const productId =
              productRecord.length > 0 ? productRecord[0].id : lineItem.id;

            await orderLineItemsCollection.create((rec: any) => {
              rec.name = lineItem.name;
              rec.price = lineItem.price;
              rec.quantity = lineItem.quantity;
              rec.image = lineItem.image;
              rec.orderId = localOrderId;
              rec.productId = productId; // Use found product ID
              rec.synced = true;
              rec.operation = '';
              rec.isDeleted = false;
            });
          }
        }

        // Mark any existing items not in API response as deleted
        const apiItemNames = new Set(
          apiOrder.lineItems.map((item: any) => item.name),
        );
        for (const existingItem of existingLineItems) {
          if (!apiItemNames.has((existingItem as any).name)) {
            await existingItem.update((rec: any) => {
              rec.isDeleted = true;
              rec.operation = 'delete';
              rec.synced = false;
            });
          }
        }
      });

      // Return the updated order
      return await this.getOrderById(localOrderId);
    } catch (error) {
      throw error;
    }
  }

  async getPendingSyncOrders(): Promise<StoredOrder[]> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      // Get all orders that are not synced
      const pendingOrders = await ordersCollection
        .query(Q.where('synced', false))
        .fetch();

      const result: StoredOrder[] = [];

      for (const orderRecord of pendingOrders) {
        const orderData = orderRecord as any;

        const lineItems = await orderLineItemsCollection
          .query(
            Q.where('order_id', orderData.id),
            Q.where('is_deleted', false),
          )
          .fetch();

        result.push({
          id: orderData.id,
          timestamp: orderData.timestamp,
          lineItems: lineItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            productId: item.productId,
            orderId: item.orderId,
            syncStatus: item.synced ? 'synced' : 'pending',
          })),
          syncStatus:
            orderData.operation === 'delete'
              ? 'pending_deletion'
              : orderData.synced
              ? 'synced'
              : 'pending',
          createdAt: orderData.createdAt?.getTime() || Date.now(),
          updatedAt: orderData.updatedAt?.getTime() || Date.now(),
          apiId: orderData.apiId,
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to get pending sync orders:', error);
      return [];
    }
  }

  async markOrderSynced(orderId: string): Promise<void> {
    try {
      const ordersCollection = database.get('orders');
      const orderLineItemsCollection = database.get('order_line_items');

      await database.write(async () => {
        // Mark order as synced
        const orderRecord = await ordersCollection.find(orderId);
        if (orderRecord) {
          await orderRecord.update((rec: any) => {
            rec.synced = true;
            rec.operation = '';
          });
        }

        // Mark all line items as synced
        const lineItems = await orderLineItemsCollection
          .query(Q.where('order_id', orderId))
          .fetch();

        for (const item of lineItems) {
          await item.update((rec: any) => {
            rec.synced = true;
            rec.operation = '';
          });
        }
      });
    } catch (error) {
      console.error('Failed to mark order as synced:', error);
      throw error;
    }
  }
}

export const orderStorage = new OrderStorage();
