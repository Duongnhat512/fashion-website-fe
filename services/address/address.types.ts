export interface Address {
  id: string;
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  id: string;
  fullName?: string;
  phone?: string;
  fullAddress?: string;
  city?: string;
  district?: string;
  ward?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: Address | Address[] | null;
}
