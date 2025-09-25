export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export const addToCart = (product: Product) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existingIndex = cart.findIndex((item: any) => item.id === product.id);
  if (existingIndex >= 0) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.imageUrl,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`Đã thêm ${product.name} vào giỏ hàng!`);
};
