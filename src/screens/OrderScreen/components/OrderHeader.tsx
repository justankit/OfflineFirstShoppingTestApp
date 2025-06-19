import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import PendingIcon from '@/components/common/icons/PendingIcon';
import SyncedIcon from '@/components/common/icons/SyncedIcon';

interface OrderHeaderProps {
  orderId: string;
  timestamp: number;
  totalItems: number;
  syncStatus?: 'pending' | 'synced';
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  orderId,
  timestamp,
  totalItems,
  syncStatus = 'synced',
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

  const renderSyncIcon = () => {
    if (syncStatus === 'pending') {
      return (
        <View style={styles.syncStatus}>
          <PendingIcon size={18} color={theme.colors.warning} />
          <Text style={[styles.syncText, { color: theme.colors.warning }]}>
            Pending
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.syncStatus}>
        <SyncedIcon size={18} color={theme.colors.success} />
        <Text style={[styles.syncText, { color: theme.colors.success }]}>
          Synced
        </Text>
      </View>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Order Details
        </Text>
        {renderSyncIcon()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
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
