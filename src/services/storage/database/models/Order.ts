import { Model } from '@nozbe/watermelondb';
import {
  field,
  date,
  readonly,
  children,
} from '@nozbe/watermelondb/decorators';

export default class Order extends Model {
  static table = 'orders';
  static associations = {
    order_line_items: { type: 'has_many', foreignKey: 'order_id' },
  } as const;

  @field('status') status!: string;
  @field('synced') synced!: boolean;
  @field('timestamp') timestamp!: number;
  @field('operation') operation!: string;
  @field('is_deleted') isDeleted!: boolean;
  @field('api_id') apiId?: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('total_price') totalPrice!: number;

  @children('order_line_items') lineItems!: any;
}
