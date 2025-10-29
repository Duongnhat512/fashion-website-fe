import React, { createContext, useContext, useState, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addToCart as addToCartAction,
  updateQuantity,
  removeFromCart,
  loadCart,
  type CartItem,
} from "../store/slices/cartSlice";
import { cartService } from "../services/cartService";

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  cartCount: number;
  addToCart: (product: any, qty?: number) => void;
  updateQuantity: (cartKey: string, qty: number) => void;
  removeFromCart: (cartKey: string) => void;
  fetchCart: () => void;
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.success && Array.isArray(response.data.cartItems)) {
        const mappedItems: CartItem[] = response.data.cartItems.map(
          (item: any) => ({
            id: item.id,
            cartKey: `${item.product.id}-${item.variant?.id ?? "default"}`,
            name: item.product.name,
            price: item.variant?.discountPrice ?? item.variant?.price ?? 0,
            qty: item.quantity,
            image:
              item.variant?.imageUrl ||
              item.product.imageUrl ||
              "/placeholder.jpg",
            productId: item.product.id,
            variantId: item.variant?.id ?? "",
            variant: item.variant
              ? {
                  id: item.variant.id,
                  size: item.variant.size,
                  color: item.variant.color,
                  sku: item.variant.sku,
                }
              : undefined,
          })
        );

        dispatch(loadCart(mappedItems));
      }
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Cập nhật số lượng sản phẩm
  const handleUpdateQuantity = async (cartKey: string, qty: number) => {
    const item = cart.find((i) => i.cartKey === cartKey);
    if (!item) return;

    const updatedItem = {
      productId: item.productId,
      variantId: item.variantId ?? "", // ✅ fix type
      quantity: qty,
    };

    try {
      const response = await cartService.updateCartItem(updatedItem);
      if (response.success) {
        dispatch(updateQuantity({ cartKey, qty }));
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
    }
  };

  // 🗑️ Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveFromCart = async (cartKey: string) => {
    const item = cart.find((i) => i.cartKey === cartKey);
    if (!item) return;

    const itemToRemove = {
      productId: item.productId,
      variantId: item.variantId ?? "", // ✅ fix type
      quantity: item.qty,
    };

    try {
      const response = await cartService.removeItemFromCart(itemToRemove);
      if (response.success) {
        dispatch(removeFromCart(cartKey)); // Cập nhật Redux local
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  // 🛒 Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product: any, qty: number = 1) => {
    const variant = product.variants?.[0] ?? null;
    const cartKey = variant ? `${product.id}-${variant.id}` : product.id;
    const price = variant ? variant.price : product.price || 0;

    const cartItem: CartItem = {
      id: product.id,
      cartKey,
      name: product.name,
      price: price,
      qty,
      image: variant?.imageUrl || product.imageUrl,
      productId: product.id,
      variantId: variant?.id ?? "", // ✅ fix type
      variant: variant
        ? {
            id: variant.id,
            size: variant.size,
            color: variant.color,
            sku: variant.sku || "",
          }
        : undefined,
    };

    try {
      const response = await cartService.addItemToCart({
        productId: cartItem.productId,
        variantId: cartItem.variantId ?? "", // ✅ fix undefined
        quantity: cartItem.qty,
      });

      if (response.success) {
        dispatch(addToCartAction(cartItem));
        alert(
          `Đã thêm ${qty} x ${product.name}${
            variant ? ` (${variant.size} - ${variant.color})` : ""
          } vào giỏ hàng!`
        );
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const value: CartContextType = {
    cart,
    loading,
    cartCount,
    addToCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
