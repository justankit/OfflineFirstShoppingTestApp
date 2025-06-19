import { configureStore } from '@reduxjs/toolkit';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    products: productSlice,
    order: orderSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {
  fetchProducts,
  clearError,
  clearProducts,
} from './slices/productSlice';
export {
  createOrder,
  updateOrder,
  deleteOrder,
  clearOrder,
  loadActiveOrder,
  syncOrders,
  setSyncStatus,
} from './slices/orderSlice';

export { useAppDispatch, useAppSelector } from './hooks';
