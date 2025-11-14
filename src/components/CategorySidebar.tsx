import { useState, useEffect, memo } from "react";
import { categoryService } from "../services/categoryService";
import { ChevronDown, ChevronRight, FolderTree } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  children: Category[];
}

interface Props {
  onSelectCategory: (categoryId: string, name: string) => void;
  selectedCategoryId: string | null;
}

function CategorySidebar({ onSelectCategory, selectedCategoryId }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("open_category_ids");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    categoryService
      .getTree()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      localStorage.setItem("open_category_ids", JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const renderTree = (items: Category[], level = 0) => (
    <ul
      className={`${
        level > 0 ? "pl-4 border-l border-gray-200 ml-2" : ""
      } space-y-1`}
    >
      {items.map((c) => {
        const hasChildren = c.children?.length > 0;
        const isOpen = openIds.has(c.id);
        const isActive = selectedCategoryId === c.id;

        return (
          <li key={c.id}>
            <div
              className={`flex items-center group cursor-pointer ${
                level === 0 ? "py-2" : "py-1"
              }`}
            >
              {hasChildren && (
                <button
                  onClick={() => toggleOpen(c.id)}
                  className={`mr-1 p-1.5 rounded-md transition-all duration-200 ${
                    isOpen
                      ? "bg-gray-200 text-gray-700"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}

              <button
                onClick={() => onSelectCategory(c.id, c.name)}
                className={`flex-1 text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {c.name}
              </button>
            </div>

            <AnimatePresence>
              {hasChildren && isOpen && (
                <motion.div
                  className="mt-1"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  {renderTree(c.children, level + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className="w-64 bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header - Sản phẩm */}
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-md bg-purple-600">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Sản phẩm</h3>
        </div>
      </div>

      {/* Tìm kiếm Section */}
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h4 className="text-sm font-medium text-gray-700">Tìm kiếm</h4>
        </div>
      </div>

      {/* Danh mục sản phẩm */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-md bg-gray-800">
            <FolderTree size={14} className="text-white" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">Danh mục</h4>
        </div>

        <div>
          {loading ? (
            <p className="text-sm text-gray-400 italic">Đang tải danh mục...</p>
          ) : categories.length > 0 ? (
            renderTree(categories)
          ) : (
            <p className="text-sm text-gray-400 italic">Không có danh mục</p>
          )}
        </div>
      </div>
    </aside>
  );
}

export default memo(CategorySidebar);
