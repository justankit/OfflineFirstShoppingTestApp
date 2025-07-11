import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  @field('api_id') apiId!: string; // Store the original API ID
  @field('name') name!: string;
  @field('price') price!: number;
  @field('image') image!: string;
  @date('created_at') createdAt!: number;
  @date('updated_at') updatedAt!: number;
  @date('synced_at') syncedAt?: number;
  @field('sync_status') customSyncStatus?: string;
}
