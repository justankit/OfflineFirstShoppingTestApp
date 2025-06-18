import { useState } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createOrder, updateOrder } from '@/store/slices/orderSlice';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const useOrderActions = () => {
  const dispatch = useAppDispatch();
  const { currentOrder } = useAppSelector(state => state.order);
  const [isAddingToOrder, setIsAddingToOrder] = useState(false);

  const addToOrder = async (product: Product) => {
    try {
      setIsAddingToOrder(true);
      if (!currentOrder) {
        return await createNewOrderWithItem(product);
      }

      return await updateExistingOrderWithItem(product);
    } catch (error) {
      console.log({ error });
      Alert.alert('Error', 'Failed to add product to order. Please try again.');
    } finally {
      setIsAddingToOrder(false);
    }
  };

  const createNewOrderWithItem = async (product: Product) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      totalPrice: product.price,
    };

    const orderData = {
      timestamp: Date.now(),
      lineItems: [newItem],
    };

    const result = await dispatch(createOrder(orderData)).unwrap();
    Alert.alert('Success', `${product.name} added to your new order!`);
    return result;
  };

  const updateExistingOrderWithItem = async (product: Product) => {
    if (!currentOrder) return;

    const existingItem = currentOrder.lineItems.find(
      (item: any) => item.id === product.id,
    );

    if (existingItem) {
      return await updateExistingItemQuantity(product);
    } else {
      return await addNewItemToOrder(product);
    }
  };

  const updateExistingItemQuantity = async (product: Product) => {
    if (!currentOrder) return;

    const updatedLineItems = currentOrder.lineItems.map((item: any) =>
      item.id === product.id
        ? {
            ...item,
            quantity: item.quantity + 1,
            totalPrice: item.price * (item.quantity + 1),
          }
        : item,
    );

    const result = await dispatch(
      updateOrder({
        orderId: currentOrder.id,
        orderData: { lineItems: updatedLineItems },
      }),
    ).unwrap();

    Alert.alert('Success', `${product.name} quantity increased!`);
    return result;
  };

  const addNewItemToOrder = async (product: Product) => {
    if (!currentOrder) return;

    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      totalPrice: product.price,
    };

    const updatedLineItems = [...currentOrder.lineItems, newItem];
    const result = await dispatch(
      updateOrder({
        orderId: currentOrder.id,
        orderData: { lineItems: updatedLineItems },
      }),
    ).unwrap();

    Alert.alert('Success', `${product.name} added to your order!`);
    return result;
  };

  return {
    addToOrder,
    isAddingToOrder,
  };
};
