import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import Product from './models/Product';
import Order from './models/Order';
import OrderLineItem from './models/OrderLineItem';
import SyncQueue from './models/SyncQueue';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'OfflineShoppingApp',
});

export const database = new Database({
  adapter,
  modelClasses: [Product, Order, OrderLineItem, SyncQueue],
});

export default database;
