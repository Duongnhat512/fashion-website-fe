"use client";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-white/5 rounded-full -ml-[300px] -mt-[300px] blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-8 md:mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div
              className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6 cursor-pointer group"
              onClick={() => router.push("/")}
            >
              <div className="relative">
                <img
                  src="/BooBoo.png"
                  alt="BooBoo Logo"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-full bg-white/10 p-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white group-hover:text-purple-100 transition-colors duration-300 tracking-tight">
                BOOBOO
              </span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-6 md:mb-8 max-w-md">
              Thời trang hiện đại, phong cách trẻ trung. Mang đến cho bạn những
              sản phẩm chất lượng cao với giá cả hợp lý nhất.
            </p>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-3 text-white/90 group hover:text-white transition-colors">
                <div className="p-2.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="font-medium">Việt Nam</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90 group hover:text-white transition-colors">
                <div className="p-2.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span className="font-medium">+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90 group hover:text-white transition-colors">
                <div className="p-2.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-300">
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
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="font-medium">contact@booboo.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white flex items-center">
              <div className="w-1 h-5 md:h-6 bg-white rounded-full mr-3"></div>
              Liên kết
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { name: "Trang chủ", path: "/" },
                { name: "Sản phẩm", path: "/products" },
                { name: "Giỏ hàng", path: "/cart" },
                { name: "Đơn hàng", path: "/orders" },
              ].map((link) => (
                <li key={link.name}>
                  <div
                    onClick={() => link.path !== "#" && router.push(link.path)}
                    className="group flex items-center space-x-3 text-white/80 hover:text-white transition-all duration-300 cursor-pointer hover:translate-x-1"
                  >
                    <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white group-hover:scale-125 transition-all duration-300"></div>
                    <span className="font-medium">{link.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white flex items-center">
              <div className="w-1 h-5 md:h-6 bg-white rounded-full mr-3"></div>
              Hỗ trợ
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                "Chính sách đổi trả",
                "Hướng dẫn mua hàng",
                "Phương thức thanh toán",
                "Chăm sóc khách hàng",
              ].map((support) => (
                <li key={support}>
                  <a
                    href="#"
                    className="group flex items-center space-x-3 text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1"
                  >
                    <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white group-hover:scale-125 transition-all duration-300"></div>
                    <span className="font-medium">{support}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="border-t border-white/20 pt-6 md:pt-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
              <span className="text-white/90 font-semibold text-xs md:text-sm uppercase tracking-wider">
                Kết nối với chúng tôi:
              </span>
              <div className="flex gap-2 md:gap-3">
                {[
                  {
                    name: "Facebook",
                    icon: "M18.77 7.46H15.5v-1.9c0-.9.6-1.1 1-1.1h2.2V2.5L15.4 2.5c-3.3 0-4 2.5-4 4.1v1.9H9v2.95h2.4V18h3.1v-7.45h2.6l.37-2.95z",
                  },
                  {
                    name: "Instagram",
                    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                  },
                  {
                    name: "Twitter",
                    icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
                  },
                  {
                    name: "YouTube",
                    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="group relative p-2 md:p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    aria-label={social.name}
                  >
                    <svg
                      className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:text-purple-600 transition-colors duration-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
              <span className="text-white/90 font-semibold text-xs md:text-sm uppercase tracking-wider">
                Thanh toán:
              </span>
              <div className="flex gap-2">
                {["VISA", "MasterCard", "Momo"].map((payment) => (
                  <div
                    key={payment}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                  >
                    <span className="text-white text-xs font-bold">
                      {payment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center border-t border-white/20 pt-6 md:pt-8">
          <p className="text-white/90 text-xs md:text-sm font-medium">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-white">BOOBOO</span>. All rights
            reserved.
            <span className="hidden sm:inline mx-2 md:mx-3">•</span>
            <span className="block sm:inline mt-2 sm:mt-0">
              Made with <span className="text-red-400 animate-pulse">❤️</span>{" "}
              in Vietnam
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
