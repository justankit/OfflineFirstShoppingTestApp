export interface OrderLineItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  totalPrice: number;
  productId: string;
}

export interface Order {
  id: string;
  timestamp: number;
  lineItems: OrderLineItem[];
  syncStatus?: 'pending' | 'synced';
}
