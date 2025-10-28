import { useState, useEffect, memo } from "react";
import { categoryService } from "../services/categoryService";
import { ChevronDown, ChevronRight } from "lucide-react";

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

  // 🧭 toggle mở/đóng danh mục cha
  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      localStorage.setItem("open_category_ids", JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // 🧩 render cây danh mục có thể thu gọn
  const renderTree = (items: Category[], level = 0) => (
    <ul
      className={`${
        level > 0 ? "pl-4 border-l border-gray-200 ml-2" : ""
      } space-y-1`}
    >
      {items.map((c) => {
        const hasChildren = c.children?.length > 0;
        const isOpen = openIds.has(c.id);
        const isLeaf = !hasChildren;

        return (
          <li key={c.id}>
            <div
              className={`flex items-center ${
                isLeaf ? "pl-1" : ""
              } transition-all duration-200`}
            >
              {hasChildren && (
                <button
                  onClick={() => toggleOpen(c.id)}
                  className="mr-1 p-1 text-gray-500 hover:text-purple-600"
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
                className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    selectedCategoryId === c.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm"
                      : "hover:bg-purple-50 text-gray-700"
                  }`}
              >
                {c.name}
              </button>
            </div>

            {hasChildren && isOpen && (
              <div className="mt-1">{renderTree(c.children, level + 1)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-md h-fit">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Danh mục</h3>
      {loading ? (
        <p className="text-sm text-gray-400 italic">Đang tải danh mục...</p>
      ) : categories.length > 0 ? (
        renderTree(categories)
      ) : (
        <p className="text-sm text-gray-400 italic">Không có danh mục</p>
      )}
    </aside>
  );
}

export default memo(CategorySidebar);
