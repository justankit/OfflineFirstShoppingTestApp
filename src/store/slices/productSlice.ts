import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productService } from '@/services/api/productService';
import { Product } from '@/types';

interface ProductState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const products = await productService.getProducts();
    return products;
  },
);

const initialState: ProductState = {
  items: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearProducts: state => {
      state.items = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const { clearError, clearProducts } = productSlice.actions;
export default productSlice.reducer;
