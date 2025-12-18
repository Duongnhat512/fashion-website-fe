"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import UserDropdown from "../user/UserDropdown";
import { Badge } from "antd";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import LoginDialog from "../common/LoginDialog";
import AccountDropdown from "../user/AccountDropdown";
import { categoryService } from "@/services/category/category.service";
import CategoryMegaMenu from "../category/CategoryMegaMenu";

interface Category {
  id: string;
  name: string;
  iconUrl: string;
  slug: string;
  children?: Category[];
}

export default function Header() {
  const { cartCount } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user, avatarUpdateKey } = useAuth();
  const [userUpdateKey, setUserUpdateKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showMobileCategoryMenu, setShowMobileCategoryMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isUserIconDropdownOpen, setIsUserIconDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setUserUpdateKey((prev) => prev + 1);
      // Force re-render by updating a dummy state
      setTimeout(() => setUserUpdateKey((prev) => prev + 1), 100);
    }
  }, [user]);

  useEffect(() => {
    if (user?.avt) {
      // Avatar update is now handled by avatarUpdateKey from context
    }
  }, [user?.avt]);

  useEffect(() => {
    const handleUserProfileUpdate = () => {
      setUserUpdateKey((prev) => prev + 1);
      // Avatar update is now handled by avatarUpdateKey from context
    };

    window.addEventListener("userProfileUpdated", handleUserProfileUpdate);
    return () =>
      window.removeEventListener("userProfileUpdated", handleUserProfileUpdate);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getTree();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!searchParams.get("search")) {
      setSearchQuery("");
    }
  }, [searchParams]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    const delay = setTimeout(() => {
      if (trimmed) {
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery, router]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
    setIsMobileMenuOpen(false);
    setShowMobileCategoryMenu(false);
    setExpandedCategories([]);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 shadow-2xl z-30">
        <div className="relative flex items-center justify-between px-4 md:px-8 py-3 md:py-4 gap-2 md:gap-6">
          {/* 🟣 Logo */}
          <Link
            href="/"
            className="group flex items-center space-x-2 md:space-x-3 flex-shrink-0"
            onClick={() => {
              setSearchQuery("");
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="relative">
              <Image
                src="/BooBoo.png"
                alt="BooBoo Logo"
                width={64}
                height={64}
                className="w-10 h-10 md:w-16 md:h-16 object-contain rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 "
              />
            </div>
            <span className="hidden lg:inline font-bold text-white">
              BOOBOO
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* 🔍 Thanh tìm kiếm - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6 relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-6 py-3 pl-12 pr-12 rounded-2xl text-gray-900
                placeholder-white/70 bg-white/90 border border-white/30
                backdrop-blur-md transition-all duration-300
                focus:outline-none focus:bg-white focus:border-blue-400
                group-hover:bg-white"
            />
          </div>

          {/* 🔍 Thanh tìm kiếm - Mobile */}
          <div className="flex md:hidden flex-1 mx-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full px-3 py-2 pl-9 pr-3 rounded-xl text-gray-900 text-sm
                placeholder-gray-500 bg-white/90 border border-white/30
                backdrop-blur-md transition-all duration-300
                focus:outline-none focus:bg-white focus:border-blue-400"
            />
          </div>

          {/* Mobile Cart & Avatar */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && mounted && (
              <Link
                href="/cart"
                onClick={(e) => {
                  setSearchQuery("");
                }}
                className="relative"
              >
                <Badge
                  count={cartCount > 99 ? "99+" : cartCount}
                  color="#ef4444"
                  offset={[0, 0]}
                  style={{
                    fontWeight: 600,
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.5)",
                    borderRadius: "12px",
                  }}
                >
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 11V7a3 3 0 016 0v4"
                    />
                  </svg>
                </Badge>
              </Link>
            )}
            {isAuthenticated && mounted && user && (
              <UserDropdown
                key={`user-${userUpdateKey}-avatar-${avatarUpdateKey}`}
                user={user}
                avatarUpdateKey={avatarUpdateKey}
                isMobile={true}
              />
            )}
            {!isAuthenticated && mounted && (
              <button
                onClick={() => setShowLogin(true)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* 🧭 Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Trang chủ */}
            <Link
              href="/"
              onClick={() => {
                setSearchQuery("");
              }}
              className="relative group px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
            >
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
              <div className="relative z-10 flex items-center space-x-2">
                <svg
                  className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Trang chủ</span>
              </div>
            </Link>
            <div>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="relative group flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
              >
                <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
                <div className="relative flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.5 7L16 4l-2 2h-4L8 4 3.5 7l2 4V20h13V11l2-4z" />
                  </svg>
                  <span>Danh mục</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
            </div>
            {/* Sản phẩm */}
            <Link
              href="/products"
              onClick={() => {
                setSearchQuery("");
              }}
              className="relative group px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
            >
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
              <div className="relative flex items-center space-x-2">
                <svg
                  className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
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
                <span>Sản phẩm</span>
              </div>
            </Link>
            {isAuthenticated && mounted && (
              <Link
                href="/cart"
                onClick={(e) => {
                  setSearchQuery("");
                }}
                className="relative group flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
              >
                <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
                <Badge
                  count={cartCount > 99 ? "99+" : cartCount}
                  color="#ef4444"
                  offset={[10, -5]}
                  style={{
                    fontWeight: 600,
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.5)",
                    borderRadius: "12px",
                  }}
                >
                  <div className="relative flex items-center space-x-2 text-white">
                    <svg
                      className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="text-base text-white">Giỏ hàng</span>
                  </div>
                </Badge>
              </Link>
            )}

            {/* 👤 Auth */}
            {mounted && isAuthenticated && user ? (
              <div className="relative flex items-center gap-3">
                <UserDropdown
                  key={`user-${userUpdateKey}-avatar-${avatarUpdateKey}`}
                  user={user}
                  avatarUpdateKey={avatarUpdateKey}
                />
              </div>
            ) : mounted && !isAuthenticated ? (
              <AccountDropdown onLoginClick={() => setShowLogin(true)} />
            ) : null}
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20 max-h-[calc(100vh-140px)] overflow-y-auto">
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                href="/"
                onClick={() => {
                  setSearchQuery("");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="font-medium">Trang chủ</span>
              </Link>

              {/* Danh mục expandable */}
              <div>
                <button
                  onClick={() =>
                    setShowMobileCategoryMenu(!showMobileCategoryMenu)
                  }
                  className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.5 7L16 4l-2 2h-4L8 4 3.5 7l2 4V20h13V11l2-4z" />
                    </svg>
                    <span className="font-medium">Danh mục</span>
                  </div>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showMobileCategoryMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Category list */}
                {showMobileCategoryMenu && (
                  <div className="mt-2 ml-4 space-y-1 border-l-2 border-white/30 pl-4">
                    {categories.map((category) => (
                      <div key={category.id}>
                        {/* Parent category */}
                        <button
                          onClick={() => {
                            if (
                              category.children &&
                              category.children.length > 0
                            ) {
                              toggleCategory(category.id);
                            } else {
                              handleCategoryClick(category.id);
                            }
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-white/90 hover:bg-white/20 rounded-lg transition-all text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            {category.iconUrl && (
                              <img
                                src={category.iconUrl}
                                alt={category.name}
                                className="w-5 h-5 object-contain"
                              />
                            )}
                            <span className="font-medium">{category.name}</span>
                          </div>
                          {category.children &&
                            category.children.length > 0 && (
                              <svg
                                className={`h-3 w-3 transition-transform duration-200 ${
                                  expandedCategories.includes(category.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                        </button>

                        {/* Child categories */}
                        {expandedCategories.includes(category.id) &&
                          category.children &&
                          category.children.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-3">
                              {category.children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => handleCategoryClick(child.id)}
                                  className="w-full text-left px-3 py-2 text-white/80 hover:bg-white/20 rounded-lg transition-all text-sm"
                                >
                                  <span className="font-normal">
                                    {child.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/products"
                onClick={() => {
                  setSearchQuery("");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all"
              >
                <svg
                  className="h-5 w-5"
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
                <span className="font-medium">Sản phẩm</span>
              </Link>
            </nav>
          </div>
        )}

        {/* Mega Menu ở dưới header */}
        <CategoryMegaMenu
          categories={categories}
          isOpen={showCategoryDropdown}
          onClose={() => setShowCategoryDropdown(false)}
        />
      </header>

      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
