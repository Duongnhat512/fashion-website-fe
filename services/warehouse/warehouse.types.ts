export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockEntryItem {
  id?: string;
  variantId?: string;
  quantity: number;
  rate: number;
  amount?: number;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  inventory?: {
    id: string;
    onHand?: number;
    reserved?: number;
    createdAt?: string;
    updatedAt?: string;
    variant?: {
      id: string;
      sku: string;
      size: string;
      price: number;
      imageUrl: string;
      color: {
        id: string;
        name: string;
        code: string;
        hex: string;
      };
      product?: {
        id: string;
        name: string;
        imageUrl: string;
        brand: string;
      };
    };
  };
}

export interface StockEntry {
  id: string;
  type: string;
  supplierName: string;
  status: string;
  note: string;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  stockEntryItems: StockEntryItem[];
  warehouse?: Warehouse;
}

export interface CreateStockEntryRequest {
  type: "IMPORT" | "EXPORT";
  supplierName: string;
  warehouseId: string;
  stockEntryItems: {
    variantId: string;
    quantity: number;
    rate: number;
  }[];
  note?: string;
}

export interface UpdateStockEntryRequest {
  type: "IMPORT" | "EXPORT";
  supplierName: string;
  stockEntryItems: {
    inventory: { id: string };
    quantity: number;
    unitCost: number;
  }[];
  note?: string;
  totalCost: number;
}