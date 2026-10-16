import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI File Converter",
  description: "Transform your projects with AI. Convert, refactor, and preserve what matters.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen bg-[#07070c] text-gray-100`}>
        {/* Backdrop layers */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 right-1/4 w-[32rem] h-[32rem] bg-blue-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}