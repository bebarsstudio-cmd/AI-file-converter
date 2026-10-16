"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, Sparkles } from "lucide-react";
import {
  getAuthErrorCode,
  getAuthErrorMessage,
  sendPasswordReset,
} from "@/lib/firebase/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      // Never reveal whether an account exists for an email address.
      if (getAuthErrorCode(err) === "auth/user-not-found") {
        setSent(true);
        return;
      }
      console.error("Password reset error:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="animate-in-up glass rounded-2xl p-8 w-full max-w-md ring-glow transition-all">
        {sent ? (
          <div className="text-center">
            <MailCheck className="text-purple-400 mx-auto mb-4" size={44} />
            <h1 className="text-2xl font-bold text-white mb-3">Check your inbox</h1>
            <p className="text-gray-400 text-sm mb-6">
              If an account exists for{" "}
              <span className="text-gray-200">{email}</span>, we&apos;ve sent you
              a link to reset your password.
            </p>
            <Link
              href="/auth/login"
              className="btn-gradient inline-block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-purple-900/20"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="text-purple-400" size={24} />
              <h1 className="text-3xl font-bold text-white">Reset Password</h1>
            </div>
            <p className="text-center text-gray-400 text-sm mb-8">
              Enter your email and we&apos;ll send you a reset link
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Remembered it?{" "}
              <Link
                href="/auth/login"
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
