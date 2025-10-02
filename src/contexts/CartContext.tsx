import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: any) => void;
  updateCart: () => void;
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
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    updateCart();
  }, []);

  const updateCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  };

  const addToCart = (product: any, qty: number = 1) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Nếu có variant thì dùng id của variant để phân biệt
    const variant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;
    const cartKey = variant ? `${product.id}-${variant.id}` : product.id;

    const existingIndex = existingCart.findIndex(
      (item: any) => item.cartKey === cartKey
    );

    const price = variant ? variant.price : product.price || 0;

    if (existingIndex >= 0) {
      existingCart[existingIndex].qty += qty;
    } else {
      existingCart.push({
        cartKey, // khóa riêng để phân biệt variant
        id: product.id,
        name: product.name,
        price: price,
        qty: qty,
        image: variant?.images?.[0] || product.imageUrl,
        variant: variant
          ? {
              id: variant.id,
              size: variant.size,
              color: variant.color,
            }
          : null,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    updateCart();
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
    updateCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
