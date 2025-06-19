import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoredOrder } from '@/services/storage/orderStorage';

interface OrderState {
  currentOrder: StoredOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<StoredOrder>) => {
      state.currentOrder = action.payload;
      state.error = null;
    },
    clearOrder: state => {
      state.currentOrder = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: state => {
      state.error = null;
    },
  },
});

export const { setOrder, clearOrder, setLoading, setError, clearError } =
  orderSlice.actions;
export default orderSlice.reducer;
