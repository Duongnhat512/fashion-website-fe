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

  // 🧭 Toggle mở/đóng danh mục cha
  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      localStorage.setItem("open_category_ids", JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // 🧩 Render cây danh mục
  const renderTree = (items: Category[], level = 0) => (
    <ul
      className={`${
        level > 0 ? "pl-4 border-l border-purple-100 ml-2" : ""
      } space-y-1`}
    >
      {items.map((c) => {
        const hasChildren = c.children?.length > 0;
        const isOpen = openIds.has(c.id);
        const isActive = selectedCategoryId === c.id;

        return (
          <li key={c.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center group cursor-pointer ${
                level === 0 ? "py-2" : "py-1"
              }`}
            >
              {hasChildren && (
                <button
                  onClick={() => toggleOpen(c.id)}
                  className={`mr-1 p-1.5 rounded-full transition-all duration-200 ${
                    isOpen
                      ? "bg-gradient-to-br from-purple-300/30 to-blue-300/30 text-purple-600"
                      : "text-gray-400 hover:bg-purple-50"
                  }`}
                >
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}

              <motion.button
                onClick={() => onSelectCategory(c.id, c.name)}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.96 }}
                className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden
                  ${
                    isActive
                      ? "text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-md"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50"
                  }`}
              >
                {/* 💡 Thanh highlight bên trái */}
                {!isActive && (
                  <motion.span className="absolute inset-0 bg-gradient-to-r  from-purple-500/50 via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 blur-lg transition-all duration-300" />
                )}
                {c.name}
              </motion.button>
            </motion.div>

            {/* 🌿 Danh mục con */}
            <AnimatePresence>
              {hasChildren && isOpen && (
                <motion.div
                  className="mt-1"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
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
    <aside
      className="w-64 bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.08)] 
      border border-purple-100 sticky top-6 h-fit relative overflow-hidden"
    >
      {/* 🌈 Hiệu ứng ánh sáng nhẹ */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 via-blue-100/30 to-transparent animate-pulse-slow pointer-events-none"></div>

      {/* 🔖 Header */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2.5 rounded-xl shadow-md">
          <FolderTree size={18} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 select-none">
          Danh mục sản phẩm
        </h3>
      </div>

      {/* 🌳 Nội dung */}
      <div className="relative z-10">
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
