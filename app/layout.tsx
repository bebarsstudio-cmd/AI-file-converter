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
        {/* Backdrop layers — drifting, color-cycling glow blobs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="animate-hue absolute inset-0">
            <div className="animate-blob-a absolute -top-32 left-1/4 h-[34rem] w-[34rem] rounded-full bg-purple-600/25 blur-[120px]" />
            <div className="animate-blob-b absolute -bottom-40 right-1/4 h-[34rem] w-[34rem] rounded-full bg-blue-600/25 blur-[120px]" />
            <div className="animate-blob-c absolute top-1/3 -right-24 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/20 blur-[110px]" />
            <div className="animate-blob-b absolute -left-24 bottom-1/4 h-[24rem] w-[24rem] rounded-full bg-cyan-400/15 blur-[110px]" />
          </div>
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