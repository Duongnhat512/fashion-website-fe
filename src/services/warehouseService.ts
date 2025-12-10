import { API_CONFIG } from "../config/api.config";

const API_BASE_URL = API_CONFIG.BASE_URL;

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

export const warehouseService = {
  // ============= WAREHOUSE APIs =============
  // Lấy danh sách kho
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.GET_ALL}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách kho");
    }

    const result = await response.json();
    return result.data;
  },

  // Lấy thông tin kho theo ID
  getWarehouseById: async (warehouseId: string): Promise<Warehouse> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.WAREHOUSES.GET_BY_ID.replace(
      ":id",
      warehouseId
    );
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin kho");
    }

    const result = await response.json();
    return result.data;
  },

  // Tạo kho mới
  createWarehouse: async (data: {
    name: string;
    code: string;
    address: string;
    status: string;
  }): Promise<Warehouse> => {
    const token = localStorage.getItem("authToken");
    
    // Giữ nguyên format status
    const requestData = {
      name: data.name,
      code: data.code,
      address: data.address,
      status: data.status, // giữ nguyên: active/inactive
    };
    
    const response = await fetch(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.CREATE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error("Không thể tạo kho");
    }

    const result = await response.json();
    return result.data;
  },

  // Cập nhật thông tin kho
  updateWarehouse: async (data: {
    id: string;
    name: string;
    code: string;
    address: string;
    status: string;
  }): Promise<Warehouse> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.WAREHOUSES.UPDATE.replace(
      ":id",
      data.id
    );

    // Body chỉ cần các field cần update
    const requestData = {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address,
      status: data.status, // giữ nguyên: active/inactive
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Update warehouse error:", errorData);
      throw new Error(errorData.message || "Không thể cập nhật kho");
    }

    const result = await response.json();
    return result.data;
  },

  // ============= STOCK ENTRY APIs =============

  // ============= STOCK ENTRY APIs =============
  // Lấy danh sách phiếu nhập/xuất kho
  getAllStockEntries: async (): Promise<StockEntry[]> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.STOCK_ENTRIES.GET_ALL}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách phiếu kho");
    }

    const result = await response.json();
    return result.data;
  },

  // Tạo phiếu nhập/xuất kho
  createStockEntry: async (
    data: CreateStockEntryRequest
  ): Promise<StockEntry> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.STOCK_ENTRIES.CREATE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Không thể tạo phiếu kho");
    }

    const result = await response.json();
    return result.data;
  },

  // Submit phiếu kho (chuyển từ draft sang submitted)
  submitStockEntry: async (stockEntryId: string): Promise<void> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.STOCK_ENTRIES.SUBMIT.replace(
      ":id",
      stockEntryId
    );
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Không thể xác nhận phiếu kho");
    }
  },

  // Cancel phiếu kho
  cancelStockEntry: async (stockEntryId: string): Promise<void> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.STOCK_ENTRIES.CANCEL.replace(
      ":id",
      stockEntryId
    );
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Cancel stock entry error:", errorData);
      throw new Error(errorData.message || "Không thể hủy phiếu kho");
    }

    return await response.json().then((result) => result.data).catch(() => undefined);
  },

  // Cập nhật phiếu kho (chỉ cho draft)
  updateStockEntry: async (
    stockEntryId: string,
    data: UpdateStockEntryRequest
  ): Promise<StockEntry> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.STOCK_ENTRIES.UPDATE.replace(
      ":id",
      stockEntryId
    );
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Không thể cập nhật phiếu kho");
    }

    const result = await response.json();
    return result.data;
  },
};
