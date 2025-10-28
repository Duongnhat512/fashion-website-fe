import React, { createContext, useContext, useState, useEffect } from "react";
import { productService } from "../services/productService";
import type { Product } from "../types/product.types";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem("products_cache");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);

  // 🔍 Gọi API search hoặc getAll
  const handleSearch = async (query: string) => {
    try {
      setSearchQuery(query);
      setLoading(true);
      let res;

      if (!query.trim()) {
        res = await productService.getAllProducts(1, 16);
      } else {
        res = await productService.searchProducts({
          search: query,
          page: 1,
          limit: 16,
        });
      }

      setProducts(res.products || []);
      localStorage.setItem(
        "products_cache",
        JSON.stringify(res.products || [])
      );
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 🧹 Xóa tìm kiếm, load toàn bộ sản phẩm
  const clearSearch = async () => {
    try {
      setSearchQuery("");
      setLoading(true);
      const res = await productService.getAllProducts(1, 16);
      setProducts(res.products || []);
      localStorage.setItem(
        "products_cache",
        JSON.stringify(res.products || [])
      );
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Load danh sách mặc định khi app mở lần đầu
  useEffect(() => {
    if (products.length === 0) clearSearch();
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        products,
        setProducts,
        loading,
        setLoading,
        handleSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context)
    throw new Error("useSearch must be used within a SearchProvider");
  return context;
};
