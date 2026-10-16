"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthErrorMessage, signUpWithEmail } from "@/lib/firebase/auth";
import { ArrowLeftRight, Check, Sparkles, User, Users, Wand2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usageMode, setUsageMode] = useState<"solo" | "team" | null>(null);
  const [purpose, setPurpose] = useState<"convert" | "create" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUpWithEmail(
        name,
        email,
        password,
        usageMode && purpose ? { usageMode, purpose } : undefined
      );

      // Redirect to workspace
      router.push("/workspace");
    } catch (err) {
      console.error("Signup error:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const optionClass = (selected: boolean) =>
    `relative flex w-full flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200 ${
      selected
        ? "border-purple-500/60 bg-purple-500/10 shadow-[0_0_24px_-6px_rgba(168,85,247,0.6)]"
        : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
    }`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="glass rounded-2xl p-8 w-full max-w-md ring-glow transition-all animate-in-up">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="text-purple-400" size={24} />
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 outline-none focus:border-purple-500/50 transition-colors"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 outline-none focus:border-purple-500/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 outline-none focus:border-purple-500/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Are you working by yourself or with a team?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUsageMode("solo")}
                className={optionClass(usageMode === "solo")}
              >
                {usageMode === "solo" && (
                  <Check size={13} className="absolute right-2 top-2 text-purple-300" />
                )}
                <User size={20} className={usageMode === "solo" ? "text-purple-300" : "text-gray-500"} />
                <span className="text-sm font-medium text-white">Just me</span>
                <span className="text-[11px] text-gray-500">Solo projects</span>
              </button>
              <button
                type="button"
                onClick={() => setUsageMode("team")}
                className={optionClass(usageMode === "team")}
              >
                {usageMode === "team" && (
                  <Check size={13} className="absolute right-2 top-2 text-purple-300" />
                )}
                <Users size={20} className={usageMode === "team" ? "text-purple-300" : "text-gray-500"} />
                <span className="text-sm font-medium text-white">With a team</span>
                <span className="text-[11px] text-gray-500">Shared projects</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What do you want to use it for?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPurpose("convert")}
                className={optionClass(purpose === "convert")}
              >
                {purpose === "convert" && (
                  <Check size={13} className="absolute right-2 top-2 text-purple-300" />
                )}
                <ArrowLeftRight size={20} className={purpose === "convert" ? "text-purple-300" : "text-gray-500"} />
                <span className="text-sm font-medium text-white">Converting</span>
                <span className="text-[11px] text-gray-500">Existing projects</span>
              </button>
              <button
                type="button"
                onClick={() => setPurpose("create")}
                className={optionClass(purpose === "create")}
              >
                {purpose === "create" && (
                  <Check size={13} className="absolute right-2 top-2 text-purple-300" />
                )}
                <Wand2 size={20} className={purpose === "create" ? "text-purple-300" : "text-gray-500"} />
                <span className="text-sm font-medium text-white">Creating</span>
                <span className="text-[11px] text-gray-500">New apps</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !usageMode || !purpose}
            className="btn-gradient w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}