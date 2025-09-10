"use client";

import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

declare global {
  interface Window {
    google?: any;
    handleCredentialResponse?: (response: { credential: string }) => void;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    window.handleCredentialResponse = async (response: { credential: string }) => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json();

        if (data.token) {
          localStorage.setItem("token", data.token);
          router.push("/HomePage");
        } else {
          console.error("No token returned from backend", data);
        }
      } catch (err) {
        console.error("Google login failed:", err);
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
      if (!clientId) console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing!");

      if (window.google?.accounts?.id?.initialize && window.google?.accounts?.id?.renderButton) {
        window.google.accounts.id.initialize({
          client_id: clientId, // ✅ Frontend must use NEXT_PUBLIC_GOOGLE_CLIENT_ID
          callback: window.handleCredentialResponse!,
        });

        const container = document.getElementById("googleSignIn");
        window.google.accounts.id.renderButton(container, { theme: "outline", size: "large", shape: "pill" });
      }
    };

    return () => {
      delete window.handleCredentialResponse;
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Email/password login (replace with your real endpoint)
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/HomePage");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-6">
      <motion.div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back 👋</h1>
          <p className="text-gray-600 mt-2">Login to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border px-4 py-3" />
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border px-4 py-3" />
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium">{loading ? "Signing in..." : "Sign In"}</button>
        </form>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <div className="flex justify-center">
          <div id="googleSignIn" className="flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer bg-white shadow-sm">
            <FcGoogle size={22} />
            <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
