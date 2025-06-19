import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { orderStorage } from '@/services/storage/orderStorage';
import { useAppSelector } from '@/store/hooks';
import { useNetInfo } from '@react-native-community/netinfo';
import { setOrder } from '@/store/slices/orderSlice';
import { offlineFirstSyncManager } from '@/services/sync/offlineFirstSyncManager';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const useOfflineOrderActions = () => {
  const dispatch = useDispatch();
  const { currentOrder } = useAppSelector(state => state.order);
  const [isAddingToOrder, setIsAddingToOrder] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const netInfo = useNetInfo();
  const lastNetworkState = useRef({
    isConnected: false,
    isInternetReachable: false,
  });

  // Load active order on mount
  useEffect(() => {
    const loadActiveOrder = async () => {
      try {
        const order = await orderStorage.getActiveOrder();
        if (order) {
          dispatch(setOrder(order));
        }
      } catch (error) {
        console.log('Failed to load active order:', error);
      }
    };

    loadActiveOrder();
  }, [dispatch]);

  // Remove duplicate sync complete callback to prevent race conditions
  // Order state reloading is handled by useOrderManagement hook

  const handleAutoSync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await offlineFirstSyncManager.syncPendingActions();
      // Order state reloading is handled by useOrderManagement sync callback
    } catch (error) {
      console.log('Auto-sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Auto-sync when network comes back online - optimized to prevent loops
  useEffect(() => {
    const currentNetworkState = {
      isConnected: Boolean(netInfo.isConnected),
      isInternetReachable: Boolean(netInfo.isInternetReachable),
    };

    // Only trigger sync if we just came online (was offline, now online)
    const wasOffline =
      !lastNetworkState.current.isConnected ||
      !lastNetworkState.current.isInternetReachable;
    const isNowOnline =
      currentNetworkState.isConnected &&
      currentNetworkState.isInternetReachable;

    if (wasOffline && isNowOnline && !isSyncing) {
      handleAutoSync();
    }

    // Update the ref for next comparison
    lastNetworkState.current = currentNetworkState;
  }, [
    netInfo.isConnected,
    netInfo.isInternetReachable,
    isSyncing,
    handleAutoSync,
  ]);

  const addToOrder = async (product: Product) => {
    if (isAddingToOrder) return;

    setIsAddingToOrder(true);
    try {
      let updatedOrder;

      if (!currentOrder) {
        updatedOrder = await createNewOrderWithItem(product);
        dispatch(setOrder(updatedOrder));

        await queueOrderAction('create', updatedOrder.id, updatedOrder);
      } else {
        updatedOrder = await addItemToExistingOrder(product);
        await queueOrderAction('update', updatedOrder.id, updatedOrder);
      }
    } catch (error) {
      console.log('Failed to add to order:', error);
    } finally {
      setIsAddingToOrder(false);
    }
  };

  // Create new order with first item
  const createNewOrderWithItem = async (product: Product) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      totalPrice: product.price,
      productId: product.id,
      orderId: '',
      syncStatus: 'pending' as const,
    };

    const newOrder = await orderStorage.createOrder({
      timestamp: Date.now(),
      lineItems: [newItem],
    });

    return newOrder;
  };

  const addItemToExistingOrder = async (product: Product) => {
    const existingItem = currentOrder!.lineItems.find(
      (item: any) => item.productId === product.id,
    );

    let updatedLineItems;

    if (existingItem) {
      updatedLineItems = currentOrder!.lineItems.map((item: any) =>
        item.productId === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice: item.price * (item.quantity + 1),
            }
          : item,
      );
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        totalPrice: product.price,
        productId: product.id,
        orderId: currentOrder!.id,
        syncStatus: 'pending' as const,
      };
      updatedLineItems = [...currentOrder!.lineItems, newItem];
    }

    const updatedOrder = await orderStorage.updateOrder(currentOrder!.id, {
      lineItems: updatedLineItems,
    });
    return updatedOrder;
  };

  // Queue sync action using SyncQueue model
  const queueOrderAction = async (
    action: 'create' | 'update' | 'delete',
    orderId: string,
    orderData: any,
  ) => {
    try {
      await offlineFirstSyncManager.queueAction(
        'order',
        orderId,
        action,
        {
          timestamp: orderData.timestamp,
          lineItems: orderData.lineItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            productId: item.productId,
          })),
          apiId: orderData.apiId,
        },
        1,
      );
    } catch (error) {
      console.log('Failed to queue action:', error);
    }
  };

  const manualSync = async () => {
    if (netInfo.isConnected && netInfo.isInternetReachable && !isSyncing) {
      setIsSyncing(true);

      try {
        await offlineFirstSyncManager.forcSync();

        const updatedOrder = await orderStorage.getActiveOrder();
        if (updatedOrder) {
          dispatch(setOrder(updatedOrder));
        }
      } catch (error) {
        console.log('Manual sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return {
    addToOrder,
    isAddingToOrder,
    isSyncing,
    manualSync,
  };
};
