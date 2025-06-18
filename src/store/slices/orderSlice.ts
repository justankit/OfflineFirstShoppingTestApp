import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '@/services/api/orderService';
import { Order } from '@/services/api/types';

interface OrderState {
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData: Omit<Order, 'id'>) => {
    const order = await orderService.createOrder(orderData);
    return order;
  },
);

export const updateOrder = createAsyncThunk(
  'order/updateOrder',
  async ({
    orderId,
    orderData,
  }: {
    orderId: string;
    orderData: Partial<Order>;
  }) => {
    const order = await orderService.updateOrder(orderId, orderData);
    return order;
  },
);

export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (orderId: string) => {
    await orderService.deleteOrder(orderId);
    return orderId;
  },
);

const initialState: OrderState = {
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearOrder: state => {
      state.currentOrder = null;
    },
    setOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
    },
    refreshOrder: _state => {},
  },
  extraReducers: builder => {
    builder
      .addCase(createOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      .addCase(updateOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order';
      })
      .addCase(deleteOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, state => {
        state.loading = false;
        state.currentOrder = null;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete order';
      });
  },
});

export const { clearError, clearOrder, setOrder, refreshOrder } =
  orderSlice.actions;
export default orderSlice.reducer;
