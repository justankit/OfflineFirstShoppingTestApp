/**
 * WatermelonDB Schema Configuration
 * Database schema for offline-first app
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'image', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'sync_status', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'status', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'timestamp', type: 'number' },
        { name: 'operation', type: 'string' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'total_price', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'order_line_items',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'quantity', type: 'number' },
        { name: 'image', type: 'string' },
        { name: 'order_id', type: 'string' },
        { name: 'product_id', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'operation', type: 'string' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
