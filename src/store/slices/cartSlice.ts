import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  cartKey: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  productId: string;
  variantId?: string;
  variant?: {
    id: string;
    size: string;
    color: string;
    sku: string;
  };
}

interface CartState {
  items: CartItem[];
  selectedItems: CartItem[];
}

const initialState: CartState = {
  items: [],
  selectedItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Load cart data (for future persistence if needed)
    loadCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    
    // Thêm sản phẩm vào giỏ hàng
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.cartKey === action.payload.cartKey);
      if (existingItem) {
        existingItem.qty += action.payload.qty;
      } else {
        state.items.push(action.payload);
      }
    },
    
    // Cập nhật số lượng sản phẩm
    updateQuantity: (state, action: PayloadAction<{ cartKey: string; qty: number }>) => {
      const item = state.items.find(item => item.cartKey === action.payload.cartKey);
      if (item) {
        item.qty = Math.max(1, action.payload.qty);
      }
    },
    
    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.cartKey !== action.payload);
    },
    
    // Xóa nhiều sản phẩm (sau khi đặt hàng)
    removeMultipleItems: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter(item => !action.payload.includes(item.cartKey));
    },
    
    // Clear toàn bộ giỏ hàng
    clearCart: (state) => {
      state.items = [];
      state.selectedItems = [];
    },
    
    // Set selected items cho payment
    setSelectedItems: (state, action: PayloadAction<CartItem[]>) => {
      state.selectedItems = action.payload;
    },
    
    // Clear selected items
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
  },
});

export const {
  loadCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  removeMultipleItems,
  clearCart,
  setSelectedItems,
  clearSelectedItems,
} = cartSlice.actions;

export default cartSlice.reducer;