"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  // null = still checking; true/false = whether /public/logo.png exists.
  const [hasLogo, setHasLogo] = useState<boolean | null>(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/workspace", label: "Workspace" },
    { href: "/create", label: "Create App" },
    { href: "/about", label: "About" },
  ];

  const displayName =
    profile?.name || user?.displayName || user?.email?.split("@")[0] || "Account";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // Show the generated logo once it's dropped into /public/logo.png.
  useEffect(() => {
    let cancelled = false;
    fetch("/logo.png", { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setHasLogo(res.ok);
      })
      .catch(() => {
        if (!cancelled) setHasLogo(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: navigation */}
          <div className="flex items-center gap-6 justify-self-start">
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Center: logo */}
          <div className="justify-self-center">
            <Link href="/" className="flex items-center gap-2 group">
              {hasLogo ? (
                <Image
                  src="/logo.png"
                  alt="AI File Converter"
                  width={200}
                  height={64}
                  className="h-10 w-auto"
                  preload
                />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="text-lg font-bold text-white hidden sm:block">
                    AI File Converter
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Right: account */}
          <div className="flex items-center justify-self-end">
            <div className="hidden md:flex items-center gap-6">
              {loading ? (
                <div className="w-24 h-8 rounded-lg bg-white/5 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                      {avatarInitial}
                    </div>
                    <span className="text-sm font-medium text-gray-200 max-w-[10rem] truncate">
                      {displayName}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-900/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-white transition-colors text-base font-medium py-2"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/5">
              {loading ? (
                <div className="w-full h-10 rounded-lg bg-white/5 animate-pulse" />
              ) : user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                      {avatarInitial}
                    </div>
                    <span className="text-sm font-medium text-gray-200 truncate">
                      {displayName}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-gray-300 hover:text-white transition-colors text-base font-medium py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="block text-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-purple-900/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
