import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface OrderItemProps {
  item: any;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onRemove: (itemId: string, itemName: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const { theme } = useTheme();

  const handleRemoveItem = () => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${item.name}" from your order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(item.id, item.name),
        },
      ],
    );
  };

  return (
    <View style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
          ₹{item.price.toFixed(2)}
        </Text>
        <Text style={[styles.itemTotal, { color: theme.colors.textSecondary }]}>
          Total: ₹{item.totalPrice.toFixed(2)}
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={[
            styles.quantityButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => onDecrement(item.id)}
        >
          <Text style={[styles.quantityButtonText, { color: 'white' }]}>-</Text>
        </TouchableOpacity>

        <Text style={[styles.quantityText, { color: theme.colors.text }]}>
          {item.quantity}
        </Text>

        <TouchableOpacity
          style={[
            styles.quantityButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => onIncrement(item.id)}
        >
          <Text style={[styles.quantityButtonText, { color: 'white' }]}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
        onPress={handleRemoveItem}
      >
        <Text style={[styles.removeButtonText, { color: 'white' }]}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderItem;
