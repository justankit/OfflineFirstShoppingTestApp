import { useState } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateOrder, deleteOrder } from '@/store/slices/orderSlice';

export const useOrderManagement = () => {
  const dispatch = useAppDispatch();
  const { currentOrder, loading } = useAppSelector(state => state.order);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!currentOrder) return;

    try {
      setIsUpdating(true);

      if (newQuantity <= 0) {
        const updatedLineItems = currentOrder.lineItems.filter(
          (item: any) => item.id !== itemId,
        );

        if (updatedLineItems.length === 0) {
          await dispatch(deleteOrder(currentOrder.id)).unwrap();
        } else {
          await dispatch(
            updateOrder({
              orderId: currentOrder.id,
              orderData: { lineItems: updatedLineItems },
            }),
          ).unwrap();
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

        await dispatch(
          updateOrder({
            orderId: currentOrder.id,
            orderData: { lineItems: updatedLineItems },
          }),
        ).unwrap();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order. Please try again.');
    } finally {
      setIsUpdating(false);
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
      await dispatch(deleteOrder(currentOrder.id)).unwrap();
      Alert.alert('Success', 'Order cleared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    currentOrder,
    loading: loading || isUpdating,
    updateItemQuantity,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    clearOrder,
  };
};
