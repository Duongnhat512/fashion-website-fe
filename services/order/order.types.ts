export interface CreateOrderShippingAddressRequest {
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  district: string;
  ward: string;
}

export interface CreateOrderItemRequest {
  product: { id: string };
  variant: { id: string };
  quantity: number;
  rate: number;
}

export interface CreateOrderRequest {
  user: { id: string };
  status: 'unpaid' | 'pending' | 'ready_to_ship' | 'shipping' | 'delivered' | 'completed' | 'cancelled';
  discount: number;
  isCOD: boolean;
  shippingFee: number;
  addressId: string;
  items: CreateOrderItemRequest[];
  voucherCode?: string;
}

export interface OrderResponse {
  id: string;
  user: any;
  status: string;
  isCOD: boolean;
  subTotal: number;
  discount: number;
  totalAmount: number;
  shippingFee: number;
  createdAt: string;
  updatedAt: string;
  items: any[];
  shippingAddress: any;
}