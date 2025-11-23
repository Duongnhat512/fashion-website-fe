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
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  cartCount: number;
  addToCart: (product: any, qty?: number) => void;
  updateQuantity: (cartKey: string, qty: number) => void;
  removeFromCart: (cartKey: string) => void;
  clearCart: () => void;
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
  const notify = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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
            originalPrice: item.variant?.price ?? item.product.price ?? 0,
            discountPercent:
              item.variant?.discountPercent ??
              item.product.discountPercent ??
              0,
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
    if (!user) return;

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
    if (!user) return;

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

  // 🧹 Xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    if (!user) return;

    try {
      // Xóa từng item trong giỏ hàng
      for (const item of cart) {
        await cartService.removeItemFromCart({
          productId: item.productId,
          variantId: item.variantId ?? "",
          quantity: item.qty,
        });
      }
      await fetchCart();
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
    }
  };

  // 🛒 Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product: any, qty: number = 1) => {
    if (!user) {
      notify.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    const variant = product.variants?.[0] ?? null;
    const cartKey = variant ? `${product.id}-${variant.id}` : product.id;
    const price = variant
      ? variant.discountPrice || variant.price
      : product.discountPrice || product.price || 0;
    const originalPrice = variant ? variant.price : product.price || 0;
    const discountPercent = variant
      ? variant.discountPercent || 0
      : product.discountPercent || 0;

    const cartItem: CartItem = {
      id: product.id,
      cartKey,
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
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
        notify.success("Đã thêm sản phẩm vào giỏ hàng!");
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
    clearCart: handleClearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
