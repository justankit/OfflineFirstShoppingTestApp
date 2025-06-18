import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';

interface OfflineBannerProps {
  isConnected: boolean;
  onRefresh: () => void;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isConnected,
  onRefresh,
}) => {
  const { theme } = useTheme();

  if (isConnected) return null;

  return (
    <View
      style={[styles.offlineBanner, { backgroundColor: theme.colors.warning }]}
    >
      <View style={styles.offlineContent}>
        <Text style={[styles.offlineText, { color: theme.colors.text }]}>
          {!isConnected
            ? 'No network connection. Showing cached data.'
            : 'Limited connectivity. Showing cached data.'}
        </Text>
        <Button
          title="Refresh"
          onPress={onRefresh}
          variant="secondary"
          size="small"
          style={styles.refreshButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  offlineBanner: {
    padding: 8,
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  offlineText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  refreshButton: {
    minWidth: 80,
  },
});

export default OfflineBanner;
