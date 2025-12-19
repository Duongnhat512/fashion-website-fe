import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "./providers";
import "./globals.css";
import "antd/dist/reset.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/common/ChatBot";
import { ConfigProvider } from "antd";

export const metadata: Metadata = {
  title: "Fashion Website - Your Style, Your Story",
  description: "Discover the latest fashion trends and styles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <script src="//cdn.jsdelivr.net/npm/eruda"></script>
            <script dangerouslySetInnerHTML={{ __html: "eruda.init();" }} />
          </>
        )}
      </head>
      <body className="pt-20 relative" suppressHydrationWarning>
        <ConfigProvider
          theme={{
            cssVar: true,
            hashed: false,
          }}
          warning={{
            strict: false,
          }}
        >
          <Providers>
            <Suspense fallback={<div>Loading...</div>}>
              <Header />
            </Suspense>
            <main className="relative">{children}</main>
            <Footer />
            <ChatBot />
          </Providers>
        </ConfigProvider>
      </body>
    </html>
  );
}
