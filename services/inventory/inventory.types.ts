export interface InventoryDetail {
  id: string;
  onHand: number;
  reserved: number;
  createdAt: string;
  updatedAt: string;
  warehouse: {
    id: string;
    name: string;
    code: string;
    address: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  variant: {
    id: string;
    sku: string;
    size: string;
    price: number;
    discountPrice: number;
    discountPercent: number;
    imageUrl: string;
    onSales: boolean;
    saleNote: string;
    createdAt: string;
    updatedAt: string;
    color?: {
      id: string;
      name: string;
      code: string;
      hex: string;
    };
    product?: {
      id: string;
      name: string;
      slug: string;
      description: string;
      imageUrl: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}