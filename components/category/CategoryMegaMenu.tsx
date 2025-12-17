import Link from "next/link";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  iconUrl: string;
  slug: string;
  children?: Category[];
}

interface Props {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryMegaMenu({
  categories,
  isOpen,
  onClose,
}: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  if (!isOpen) return null;

  return (
    <div className="sticky top-[88px] w-full bg-white shadow-2xl border-t border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Cột 1: Danh mục ÔNG (Level 1) */}
          <div className="col-span-4 border-r border-gray-200 pr-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Danh mục chính
            </h3>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => {
                    if (selectedCategoryId === category.id) {
                      setSelectedCategoryId(null);
                    } else {
                      setSelectedCategoryId(category.id);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedCategoryId === category.id
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-purple-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {category.iconUrl ? (
                    <img
                      src={category.iconUrl}
                      alt={category.name}
                      className="w-10 h-10 object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <div
                      className={`font-semibold transition-colors duration-200 ${
                        selectedCategoryId === category.id
                          ? "text-purple-700"
                          : "text-gray-900"
                      }`}
                    >
                      {category.name}
                    </div>
                    {category.children && category.children.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {category.children.length} danh mục
                      </div>
                    )}
                  </div>
                  {category.children && category.children.length > 0 && (
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        selectedCategoryId === category.id ? "rotate-90" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cột 2: Danh mục CHA (Level 2) */}
          <div className="col-span-4 border-r border-gray-200 pr-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Danh mục phụ
            </h3>
            {selectedCategoryId ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {categories
                  .find((cat) => cat.id === selectedCategoryId)
                  ?.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={`/products?category=${child.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group"
                    >
                      {child.iconUrl ? (
                        <img
                          src={child.iconUrl}
                          alt={child.name}
                          className="w-10 h-10 object-contain rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-gray-700 group-hover:text-blue-600">
                        {child.name}
                      </span>
                    </Link>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Chọn danh mục chính để xem danh mục phụ
              </p>
            )}
          </div>

          {/* Cột 3: Danh mục CON (Level 3) */}
          <div className="col-span-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Danh mục chi tiết
            </h3>
            {selectedCategoryId ? (
              <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {categories
                  .find((cat) => cat.id === selectedCategoryId)
                  ?.children?.map((child) =>
                    child.children && child.children.length > 0 ? (
                      <div key={child.id} className="space-y-2">
                        <div className="font-semibold text-xs text-purple-600 uppercase tracking-wide border-b border-purple-200 pb-1">
                          {child.name}
                        </div>
                        {child.children.map((grandchild) => (
                          <Link
                            key={grandchild.id}
                            href={`/products?category=${grandchild.id}`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-blue-50 transition-colors duration-200 text-sm text-gray-600 hover:text-blue-600"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span className="truncate">{grandchild.name}</span>
                          </Link>
                        ))}
                      </div>
                    ) : null
                  )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Chọn danh mục chính để xem chi tiết
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
