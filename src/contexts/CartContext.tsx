import React, { createContext, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addToCart as addToCartAction,
  updateQuantity,
  removeFromCart,
  type CartItem,
} from "../store/slices/cartSlice";

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: any, qty?: number) => void;
  updateQuantity: (cartKey: string, qty: number) => void;
  removeFromCart: (cartKey: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);

  const handleUpdateQuantity = (cartKey: string, qty: number) => {
    dispatch(updateQuantity({ cartKey, qty }));
  };

  const handleRemoveFromCart = (cartKey: string) => {
    dispatch(removeFromCart(cartKey));
  };

  const addToCart = (product: any, qty: number = 1) => {
    // Nếu có variant thì dùng id của variant để phân biệt
    const variant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;
    const cartKey = variant ? `${product.id}-${variant.id}` : product.id;
    const price = variant ? variant.price : product.price || 0;

    const cartItem: CartItem = {
      id: product.id,
      cartKey,
      name: product.name,
      price: price,
      qty: qty,
      image: variant?.images?.[0] || product.imageUrl,
      productId: product.id,
      variantId: variant?.id,
      variant: variant
        ? {
            id: variant.id,
            size: variant.size,
            color: variant.color,
            sku: variant.sku || "",
          }
        : undefined,
    };

    dispatch(addToCartAction(cartItem));

    alert(
      `Đã thêm ${qty} x ${product.name}${
        variant ? ` (${variant.size} - ${variant.color})` : ""
      } vào giỏ hàng!`
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const value: CartContextType = {
    cart,
    cartCount,
    addToCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
