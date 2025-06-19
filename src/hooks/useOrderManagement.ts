import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setOrder,
  clearOrder as clearOrderAction,
} from '@/store/slices/orderSlice';
import { orderStorage } from '@/services/storage/orderStorage';
import { useNetInfo } from '@react-native-community/netinfo';
import { offlineFirstSyncManager } from '@/services/sync/offlineFirstSyncManager';

export const useOrderManagement = () => {
  const dispatch = useAppDispatch();
  const { currentOrder, loading } = useAppSelector(state => state.order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const netInfo = useNetInfo();
  const lastNetworkState = useRef({
    isConnected: false,
    isInternetReachable: false,
  });

  // Add sync complete callback to reload order state
  useEffect(() => {
    const unsubscribe = offlineFirstSyncManager.addSyncCompleteCallback(
      async () => {
        try {
          const updatedOrder = await orderStorage.getActiveOrder();
          if (updatedOrder) {
            dispatch(setOrder(updatedOrder));
          }
        } catch (error) {
          console.error('Failed to reload order after sync:', error);
        }
      },
    );

    return unsubscribe;
  }, [dispatch]);

  const handleAutoSync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await offlineFirstSyncManager.syncPendingActions();

      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedOrder = await orderStorage.getActiveOrder();
      if (updatedOrder) {
        dispatch(setOrder(updatedOrder));
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, dispatch]);

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

    lastNetworkState.current = currentNetworkState;
  }, [
    netInfo.isConnected,
    netInfo.isInternetReachable,
    isSyncing,
    handleAutoSync,
  ]);

  useEffect(() => {
    const refreshOrderState = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const updatedOrder = await orderStorage.getActiveOrder();

        if (updatedOrder) {
          dispatch(setOrder(updatedOrder));
        } else {
          dispatch(clearOrderAction());
        }
      } catch (error) {
        console.error('Failed to refresh order state after sync:', error);
      }
    };

    const unsubscribe =
      offlineFirstSyncManager.addSyncCompleteCallback(refreshOrderState);
    return unsubscribe;
  }, [dispatch, currentOrder]);

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!currentOrder) return;

    try {
      setIsUpdating(true);

      if (newQuantity <= 0) {
        const updatedLineItems = currentOrder.lineItems.filter(
          (item: any) => item.id !== itemId,
        );

        if (updatedLineItems.length === 0) {
          await deleteOrderCompletely(currentOrder.id, currentOrder.apiId);
        } else {
          const updatedOrder = await orderStorage.updateOrder(currentOrder.id, {
            lineItems: updatedLineItems,
          });
          dispatch(setOrder(updatedOrder));

          await queueOrderAction('update', updatedOrder.id, updatedOrder);
        }
      } else {
        const updatedLineItems = currentOrder.lineItems.map((item: any) =>
          item.id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: item.price * newQuantity,
              }
            : item,
        );

        const updatedOrder = await orderStorage.updateOrder(currentOrder.id, {
          lineItems: updatedLineItems,
        });
        dispatch(setOrder(updatedOrder));
        await queueOrderAction('update', updatedOrder.id, updatedOrder);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrderCompletely = async (
    localOrderId: string,
    apiId?: string,
  ) => {
    const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

    if (isOnline && apiId) {
      await orderStorage.deleteOrder(localOrderId);
      dispatch(clearOrderAction());
      await queueOrderAction('delete', localOrderId, { apiId });
    } else if (!isOnline && apiId) {
      const updatedOrder = await orderStorage.markOrderForDeletion(
        localOrderId,
      );
      dispatch(setOrder(updatedOrder));
      await queueOrderAction('delete', localOrderId, { apiId });
    } else {
      await orderStorage.deleteOrder(localOrderId);
      dispatch(clearOrderAction());
    }
  };

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
          lineItems:
            orderData.lineItems?.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              productId: item.productId,
            })) || [],
          apiId: orderData.apiId,
        },
        1,
      );
    } catch (error) {
      console.log('Failed to queue action:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    await updateItemQuantity(itemId, 0);
  };

  const incrementQuantity = async (itemId: string) => {
    const item = currentOrder?.lineItems.find(
      (item: any) => item.id === itemId,
    );
    if (item) {
      await updateItemQuantity(itemId, item.quantity + 1);
    }
  };

  const decrementQuantity = async (itemId: string) => {
    const item = currentOrder?.lineItems.find(
      (item: any) => item.id === itemId,
    );
    if (item && item.quantity > 1) {
      await updateItemQuantity(itemId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      await removeItem(itemId);
    }
  };

  const clearOrder = async () => {
    if (!currentOrder) return;

    try {
      setIsUpdating(true);
      const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

      await deleteOrderCompletely(currentOrder.id, currentOrder.apiId);

      if (isOnline && currentOrder.apiId) {
        Alert.alert('Success', 'Order cleared successfully!');
      } else if (!isOnline && currentOrder.apiId) {
        Alert.alert(
          'Order Marked for Deletion',
          'Order will be deleted from server when you come back online.',
        );
      } else {
        Alert.alert('Success', 'Order cleared successfully!');
      }
    } catch (error) {
      console.error('Failed to clear order:', error);
      Alert.alert('Error', 'Failed to clear order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const manualSync = async () => {
    if (netInfo.isConnected && netInfo.isInternetReachable && !isSyncing) {
      setIsSyncing(true);

      try {
        await offlineFirstSyncManager.syncPendingActions();

        const updatedOrder = await orderStorage.getActiveOrder();
        if (updatedOrder) {
          dispatch(setOrder(updatedOrder));
        }

        Alert.alert('Success', 'Order synced successfully!');
      } catch (error) {
        console.log('Manual sync failed:', error);
        Alert.alert('Error', 'Failed to sync order. Please try again.');
      } finally {
        setIsSyncing(false);
      }
    } else if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      Alert.alert(
        'No Internet',
        'Please check your internet connection and try again.',
      );
    }
  };

  return {
    currentOrder,
    loading: loading || isUpdating,
    isSyncing,
    updateItemQuantity,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    clearOrder,
    manualSync,
  };
};
