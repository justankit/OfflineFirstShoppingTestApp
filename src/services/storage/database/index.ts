import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import Product from './models/Product';
import Order from './models/Order';
import OrderLineItem from './models/OrderLineItem';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'OfflineShoppingDB',
  onSetUpError: error => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Product, Order, OrderLineItem],
});

export default database;
