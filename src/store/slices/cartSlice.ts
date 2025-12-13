import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  cartKey: string;
  name: string;
  price: number;
  originalPrice: number; 
  discountPercent: number; 
  qty: number;
  image: string;
  productId: string;
  variantId?: string;
  variant?: {
    id: string;
    size: string;
    color: string | { id: string; name: string; code: string; hex: string; imageUrl?: string };
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
    loadCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.cartKey === action.payload.cartKey);
      if (existingItem) {
        existingItem.qty += action.payload.qty;
      } else {
        state.items.push(action.payload);
      }
    },
    
    updateQuantity: (state, action: PayloadAction<{ cartKey: string; qty: number }>) => {
      const item = state.items.find(item => item.cartKey === action.payload.cartKey);
      if (item) {
        item.qty = Math.max(1, action.payload.qty);
      }
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.cartKey !== action.payload);
    },
    
    removeMultipleItems: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter(item => !action.payload.includes(item.cartKey));
    },
    
    clearCart: (state) => {
      state.items = [];
      state.selectedItems = [];
    },
    
    setSelectedItems: (state, action: PayloadAction<CartItem[]>) => {
      state.selectedItems = action.payload;
    },
    
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