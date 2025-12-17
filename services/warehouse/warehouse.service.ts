import { API_CONFIG } from "../../lib/api.config";
import type { Warehouse, StockEntryItem, StockEntry, CreateStockEntryRequest, UpdateStockEntryRequest } from './warehouse.types';

export const warehouseService = {

  getAllWarehouses: async (): Promise<Warehouse[]> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.GET_ALL}`,
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

  getWarehouseById: async (warehouseId: string): Promise<Warehouse> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.WAREHOUSES.GET_BY_ID.replace(
      ":id",
      warehouseId
    );
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
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

  createWarehouse: async (data: {
    name: string;
    code: string;
    address: string;
    status: string;
  }): Promise<Warehouse> => {
    const token = localStorage.getItem("authToken");
    
    const requestData = {
      name: data.name,
      code: data.code,
      address: data.address,
      status: data.status, 
    };
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.CREATE}`,
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

    const requestData = {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address,
      status: data.status, 
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
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


  getAllStockEntries: async (): Promise<StockEntry[]> => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STOCK_ENTRIES.GET_ALL}`,
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
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STOCK_ENTRIES.CREATE}`,
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


  submitStockEntry: async (stockEntryId: string): Promise<void> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.STOCK_ENTRIES.SUBMIT.replace(
      ":id",
      stockEntryId
    );
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
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

  cancelStockEntry: async (stockEntryId: string): Promise<void> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.STOCK_ENTRIES.CANCEL.replace(
      ":id",
      stockEntryId
    );
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
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

  updateStockEntry: async (
    stockEntryId: string,
    data: UpdateStockEntryRequest
  ): Promise<StockEntry> => {
    const token = localStorage.getItem("authToken");
    const url = API_CONFIG.ENDPOINTS.STOCK_ENTRIES.UPDATE.replace(
      ":id",
      stockEntryId
    );
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
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

export type { Warehouse, StockEntry } from './warehouse.types';
