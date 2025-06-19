import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import Order from './Order';

export default class OrderLineItem extends Model {
  static table = 'order_line_items';
  static associations = {
    orders: { type: 'belongs_to', key: 'order_id' },
  } as const;

  @field('name') name!: string;
  @field('price') price!: number;
  @field('quantity') quantity!: number;
  @field('image') image!: string;
  @field('order_id') orderId!: string;
  @field('product_id') productId!: string;
  @field('synced') synced!: boolean;
  @field('operation') operation!: string;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  
  @relation('orders', 'order_id') order!: Order;
}
