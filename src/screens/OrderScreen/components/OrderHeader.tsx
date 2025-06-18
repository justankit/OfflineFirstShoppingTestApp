import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface OrderHeaderProps {
  orderId: string;
  timestamp: number;
  totalItems: number;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  orderId,
  timestamp,
  totalItems,
}) => {
  const { theme } = useTheme();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Order Details
        </Text>
      </View>

      <View
        style={[styles.orderInfo, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.orderInfoRow}>
          <Text
            style={[
              styles.orderInfoLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Order ID:
          </Text>
          <Text style={[styles.orderInfoValue, { color: theme.colors.text }]}>
            {orderId}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text
            style={[
              styles.orderInfoLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Created:
          </Text>
          <Text style={[styles.orderInfoValue, { color: theme.colors.text }]}>
            {formatDate(timestamp)}
          </Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Text
            style={[
              styles.orderInfoLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Items:
          </Text>
          <Text style={[styles.orderInfoValue, { color: theme.colors.text }]}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  orderInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderHeader;
