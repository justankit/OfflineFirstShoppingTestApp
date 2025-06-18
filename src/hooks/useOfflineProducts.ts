import { useState, useEffect, useCallback } from 'react';
import { syncManager, SyncStatus } from '@/services/sync/syncManager';
import { StoredProduct } from '@/services/storage/productStorage';

export interface UseOfflineProductsReturn {
  products: StoredProduct[];
  loading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  refreshProducts: () => Promise<void>;
  syncProducts: () => Promise<void>;
}

export const useOfflineProducts = (): UseOfflineProductsReturn => {
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    syncManager.getSyncStatus(),
  );

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const localProducts = await syncManager.loadProducts();
      setProducts(localProducts);

      const currentStatus = syncManager.getSyncStatus();
      setSyncStatus(currentStatus);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  const syncProducts = useCallback(async () => {
    try {
      setError(null);
      await syncManager.syncProducts();
      await loadProducts();
    } catch (err) {
      const isNetworkError =
        err instanceof Error &&
        (err.message === 'No internet connection' ||
          err.message.includes('Network request failed'));

      if (!isNetworkError) {
        const errorMessage = err instanceof Error ? err.message : 'Sync failed';
        setError(errorMessage);
      }
    }
  }, [loadProducts]);

  useEffect(() => {
    const initializeData = async () => {
      await loadProducts();
      await syncProducts();
    };
    initializeData();
  }, [loadProducts, syncProducts]);

  return {
    products,
    loading,
    error,
    syncStatus,
    refreshProducts,
    syncProducts,
  };
};
