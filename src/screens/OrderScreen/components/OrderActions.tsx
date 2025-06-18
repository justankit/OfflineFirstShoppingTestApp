import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';

interface OrderActionsProps {
  onPlaceOrder: () => void;
  onClearOrder: () => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  onPlaceOrder,
  onClearOrder,
}) => {
  const { theme } = useTheme();

  const handleClearOrders = () => {
    Alert.alert('Clear Orders', 'Are you sure you want to clear all orders?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: onClearOrder,
      },
    ]);
  };

  return (
    <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.buttonContainer}>
        <Button
          title="Clear Orders"
          onPress={handleClearOrders}
          variant="outline"
          size="medium"
          style={styles.clearButton}
        />
        <Button
          title="Place Order"
          onPress={onPlaceOrder}
          variant="primary"
          size="medium"
          style={styles.placeButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  placeButton: {
    flex: 1,
  },
});

export default OrderActions;
