import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useOrderManagement } from '../../hooks';
import OrderHeader from './components/OrderHeader';
import OrderItem from './components/OrderItem';
import OrderSummary from './components/OrderSummary';
import OrderActions from './components/OrderActions';
import EmptyState from './components/EmptyState';
import { OrderLineItem } from '../../services/api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderScreen'>;

const OrderScreen: React.FC<Props> = () => {
  const { theme } = useTheme();
  const { loading } = useSelector((state: RootState) => state.order);
  const { currentOrder, removeItem, updateItemQuantity, clearOrder } =
    useOrderManagement();

  const incrementQuantity = (itemId: string) => {
    const item = currentOrder?.lineItems.find(
      (lineItem: OrderLineItem) => lineItem.id === itemId,
    );
    if (item) {
      updateItemQuantity(itemId, item.quantity + 1);
    }
  };

  const decrementQuantity = (itemId: string) => {
    const item = currentOrder?.lineItems.find(
      (lineItem: OrderLineItem) => lineItem.id === itemId,
    );
    if (item && item.quantity > 1) {
      updateItemQuantity(itemId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      removeItem(itemId);
    }
  };

  const placeOrder = () => {
    if (!currentOrder) return;

    const totalPrice = currentOrder.lineItems.reduce(
      (sum: number, item: OrderLineItem) => sum + item.totalPrice,
      0,
    );

    Alert.alert(
      'Order Placed!',
      `Your order #${currentOrder.id} for ₹${totalPrice.toFixed(
        2,
      )} has been placed successfully.`,
      [{ text: 'OK' }],
    );
  };

  if (loading && !currentOrder) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <LoadingOverlay message="Loading order..." />
      </View>
    );
  }

  if (!currentOrder || currentOrder.lineItems.length === 0) {
    return <EmptyState />;
  }

  const totalPrice = currentOrder.lineItems.reduce(
    (sum: number, item: OrderLineItem) => sum + item.totalPrice,
    0,
  );

  const totalItems = currentOrder.lineItems.reduce(
    (sum: number, item: OrderLineItem) => sum + item.quantity,
    0,
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <OrderHeader
          orderId={currentOrder.id}
          timestamp={currentOrder.timestamp}
          totalItems={totalItems}
        />

        <View style={styles.ordersContainer}>
          {currentOrder.lineItems.map((item: OrderLineItem) => (
            <OrderItem
              key={item.id}
              item={item}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onRemove={removeItem}
            />
          ))}
        </View>

        <OrderSummary totalPrice={totalPrice} />
      </ScrollView>

      <OrderActions onPlaceOrder={placeOrder} onClearOrder={clearOrder} />

      {loading && currentOrder && (
        <LoadingOverlay message="Updating order..." />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  ordersContainer: {
    marginBottom: 20,
  },
});

export default OrderScreen;
