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
    <aside className="w-64 bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2.5 rounded-md bg-gray-800">
          <FolderTree size={16} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Danh mục sản phẩm
        </h3>
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
    </aside>
  );
}

export default memo(CategorySidebar);
