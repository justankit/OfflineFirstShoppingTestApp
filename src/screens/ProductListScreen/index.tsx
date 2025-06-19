import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import {
  useOfflineProducts,
  useOfflineOrderActions,
  useOrderManagement,
} from '@/hooks';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAppSelector } from '@/store/hooks';
import ProductCard from './components/ProductCard';
import ErrorState from './components/ErrorState';
import OfflineBanner from './components/OfflineBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const ProductListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { products, loading, error, refreshProducts, syncProducts } =
    useOfflineProducts();
  const networkStatus = useNetInfo();
  const { currentOrder } = useAppSelector(state => state.order);
  const { addToOrder, isAddingToOrder, manualSync } = useOfflineOrderActions();

  const [refreshing, setRefreshing] = useState(false);

  const goToOrders = () => {
    navigation.navigate('OrderScreen');
  };

  const handleRetry = () => {
    refreshProducts();
    syncProducts();
    manualSync();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProducts();
      await syncProducts();
      await manualSync();
    } finally {
      setRefreshing(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const orderItem = currentOrder?.lineItems.find(
      (orderItem: any) => orderItem.productId === item.id,
    );

    return (
      <ProductCard
        product={item}
        isInOrder={!!orderItem}
        orderQuantity={orderItem?.quantity}
        onAddToOrder={addToOrder}
        disabled={isAddingToOrder}
      />
    );
  };

  if (error && networkStatus.isConnected && networkStatus.isInternetReachable) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <OfflineBanner
        isConnected={networkStatus.isConnected ?? false}
        isInternetReachable={networkStatus.isInternetReachable ?? false}
        onRefresh={handleRetry}
      />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button
          title="View Orders"
          onPress={goToOrders}
          variant="secondary"
          size="large"
          style={styles.orderButton}
        />
      </View>
      {loading && !refreshing && (
        <LoadingOverlay message="Loading products..." />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  contentContainer: { padding: 16, paddingBottom: 100 },
  separator: { height: 16 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  orderButton: { width: '100%' },
});

export default ProductListScreen;
