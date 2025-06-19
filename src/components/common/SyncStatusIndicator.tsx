import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import PendingIcon from './icons/PendingIcon';
import SyncedIcon from './icons/SyncedIcon';

interface SyncStatusIndicatorProps {
  syncStatus: 'pending' | 'synced' | 'failed' | 'pending_deletion';
  pendingCount?: number;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  syncStatus,
  pendingCount = 0,
}) => {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          color: theme.colors.success,
          text: 'All orders synced',
          icon: <SyncedIcon color={theme.colors.success} />,
        };
      case 'pending':
        return {
          color: theme.colors.warning,
          text:
            pendingCount > 0
              ? `${pendingCount} order(s) pending sync`
              : 'Orders pending sync',
          icon: <PendingIcon color={theme.colors.warning} />,
        };
      case 'failed':
        return {
          color: theme.colors.error,
          text: 'Sync failed',
          icon: <PendingIcon color={theme.colors.error} />,
        };
      case 'pending_deletion':
        return {
          color: theme.colors.error,
          text: 'Order deletion pending sync',
          icon: <PendingIcon color={theme.colors.error} />,
        };
      default:
        return {
          color: theme.colors.textSecondary,
          text: 'Unknown status',
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.content}>
        {config.icon}
        <Text style={[styles.text, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default SyncStatusIndicator;
