/**
 * WatermelonDB Schema Configuration
 * Database schema for offline-first app
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 2, // Incremented for api_id field addition
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'api_id', type: 'string' }, // Store original API ID
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'image', type: 'string' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'sync_status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'timestamp', type: 'number' },
        { name: 'synced', type: 'boolean' },
        { name: 'operation', type: 'string' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'api_id', type: 'string', isOptional: true },
        { name: 'last_modified', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'order_line_items',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'quantity', type: 'number' },
        { name: 'image', type: 'string' },
        { name: 'order_id', type: 'string', isIndexed: true },
        { name: 'product_id', type: 'string' },
        { name: 'synced', type: 'boolean' },
        { name: 'operation', type: 'string' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'entity_type', type: 'string' },
        { name: 'entity_id', type: 'string' },
        { name: 'action', type: 'string' },
        { name: 'data', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'last_error', type: 'string', isOptional: true },
        { name: 'priority', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
