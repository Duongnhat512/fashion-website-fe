import { API_CONFIG } from "../config/api.config";

const API_BASE_URL = API_CONFIG.BASE_URL;

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
      imageUrl: string;
      brand: string;
      description?: string;
    };
  };
}

export const inventoryService = {
  getAllInventories: async (): Promise<InventoryDetail[]> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORIES.GET_ALL}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách inventory");
    }

    const result = await response.json();
    return result.data;
  },

  getInventoryById: async (inventoryId: string): Promise<InventoryDetail> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.INVENTORIES.GET_BY_ID.replace(
      ":id",
      inventoryId
    );
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin inventory");
    }

    const result = await response.json();
    return result.data;
  },

  getInventoryByWarehouse: async (
    warehouseId: string
  ): Promise<InventoryDetail[]> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.INVENTORIES.GET_BY_WAREHOUSE.replace(
      ":warehouseId",
      warehouseId
    );
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy inventory theo warehouse");
    }

    const result = await response.json();
    return result.data;
  },

  getInventoryByVariant: async (
    variantId: string
  ): Promise<InventoryDetail[]> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.INVENTORIES.GET_BY_VARIANT.replace(
      ":variantId",
      variantId
    );
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy inventory theo variant");
    }

    const result = await response.json();
    return result.data;
  },
};
