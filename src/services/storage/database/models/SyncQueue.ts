import { Model } from '@nozbe/watermelondb';
import { field, text, json, date } from '@nozbe/watermelondb/decorators';

export type EntityType = 'order';
export type SyncAction = 'create' | 'update' | 'delete';

export interface SyncQueueData {
  entityType: EntityType;
  entityId: string;
  action: SyncAction;
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export default class SyncQueue extends Model {
  static table = 'sync_queue';

  @text('entity_type') entityType!: EntityType;
  @text('entity_id') entityId!: string;
  @text('action') action!: SyncAction;
  @json('data', json => json) data!: any;
  @field('timestamp') timestamp!: number;
  @field('retry_count') retryCount!: number;
  @text('last_error') lastError?: string;
  @field('priority') priority!: number;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
