

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xl">B</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">BOOBOO</h3>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-3 max-w-md">
              Thời trang hiện đại, phong cách trẻ trung. Mang đến cho bạn những
              sản phẩm chất lượng cao với giá cả hợp lý.
            </p>
            <div className="flex items-center space-x-2 text-white/70">
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
              <span>Việt Nam</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Liên kết</h4>
            <ul className="space-y-1">
              {["Trang chủ", "Sản phẩm", "Về chúng tôi", "Liên hệ"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="group flex items-center space-x-2 text-white/70 hover:text-white transition-all duration-300"
                    >
                      <svg
                        className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
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
                      <span>{link}</span>
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Hỗ trợ</h4>
            <ul className="space-y-1">
              {[
                "Chính sách đổi trả",
                "Hướng dẫn mua hàng",
                "Phương thức thanh toán",
                "Chăm sóc khách hàng",
              ].map((support) => (
                <li key={support}>
                  <a
                    href="#"
                    className="group flex items-center space-x-2 text-white/70 hover:text-white transition-all duration-300"
                  >
                    <svg
                      className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
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
                    <span>{support}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="border-t border-white/20 pt-4 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Contact Info */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2 text-white/80">
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
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
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
                <span>contact@booboo.vn</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-white/70 font-medium">
                Theo dõi chúng tôi:
              </span>
              <div className="flex space-x-3">
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
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="group relative p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="h-5 w-5 text-white group-hover:text-purple-200 transition-colors duration-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center border-t border-white/20 pt-3">
          <p className="text-white/70 text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white">BOOBOO</span>. All rights
            reserved.
            <span className="mx-2">|</span>
            Made with <span className="text-red-400">❤️</span> in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
