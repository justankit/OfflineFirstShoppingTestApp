import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface OrderSummaryProps {
  totalPrice: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ totalPrice }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.totalSection, { backgroundColor: theme.colors.surface }]}
    >
      <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
        Total:
      </Text>
      <Text
        style={[styles.totalPrice, { color: theme.colors.primary }]}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
      >
        ₹{totalPrice.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  totalSection: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 0,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'right',
    minWidth: 80,
  },
});

export default OrderSummary;
