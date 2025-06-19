import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
  isInOrder?: boolean;
  orderQuantity?: number;
  onAddToOrder: (product: Product) => void;
  disabled?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInOrder = false,
  orderQuantity = 0,
  onAddToOrder,
  disabled = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.productCard,
        { backgroundColor: theme.colors.productCard },
      ]}
    >
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.colors.text }]}>
          {product.name}
        </Text>
        <Text style={[styles.productId, { color: theme.colors.textSecondary }]}>
          ID: {product.id}
        </Text>
        <Text style={[styles.price, { color: theme.colors.primary }]}>
          ₹{product.price}
        </Text>
        {isInOrder && (
          <Text style={[styles.inOrderText, { color: theme.colors.success }]}>
            In order: {orderQuantity}
          </Text>
        )}
      </View>
      <Button
        title={isInOrder ? 'Add More' : 'Add to Order'}
        onPress={() => onAddToOrder(product)}
        variant={isInOrder ? 'secondary' : 'primary'}
        size="small"
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productId: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inOrderText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ProductCard;
