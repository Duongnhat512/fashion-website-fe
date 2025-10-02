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

  const addToCart = (product: any) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = existingCart.findIndex(
      (item: any) => item.id === product.id
    );

    // Lấy giá từ variants hoặc price trực tiếp
    const price =
      product.variants && product.variants.length > 0
        ? product.variants[0].price
        : product.price || 0;

    if (existingIndex >= 0) {
      existingCart[existingIndex].qty += 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: price,
        qty: 1,
        image: product.imageUrl,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    updateCart();
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
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
