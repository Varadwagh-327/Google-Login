"use client";

/**
 * LoginPage (app/login/page.tsx)
 *
 * Step-by-step:
 * 1) Strongly type window.google & window.handleCredentialResponse to avoid `any`.
 * 2) Load Google Identity Services script on mount, initialize and render the button.
 * 3) Provide a fallback email/password POST (replace with your actual API endpoint).
 * 4) Save token to localStorage and redirect to "/HomePage" on success.
 * 5) Clean up script and global handler on unmount.
 *
 * Notes:
 * - Make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set in your .env (and available to Next).
 * - Install runtime deps: `npm i framer-motion react-icons`
 * - Install dev types if you use TypeScript: `npm i -D @types/react @types/react-dom`
 */

import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* -------------------------
   Strong types for the global Google object & handler
   (prevents `@typescript-eslint/no-explicit-any` errors)
   ------------------------- */
declare global {
  interface Window {
    // Minimal typing for the Google Identity Services object we use
    google?: {
      accounts?: {
        id?: {
          // initialize accepts a config with client_id and callback
          initialize?: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
            // other fields are ignored here
          }) => void;
          // renderButton attaches the button to a container element
          renderButton?: (
            element: HTMLElement | null,
            options?: {
              theme?: "outline" | "filled_blue" | "filled_black" | string;
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | string;
              text?: "signin_with" | "continue_with" | string;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
    // Our callback handler type
    handleCredentialResponse?: (response: { credential: string }) => void;
  }
}

/* -------------------------
   Component
   ------------------------- */
export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  /* -------------------------
     Google Login setup
     - Sets window.handleCredentialResponse
     - Loads GIS script
     - Initializes and renders button when script loaded
     - Cleans up on unmount
     ------------------------- */
  useEffect(() => {
    // Handler that will be called by Google's library
    window.handleCredentialResponse = async (response: { credential: string }) => {
      try {
        // POST token to your backend (replace endpoint with your API)
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });
        const data = await res.json();

        if (data.token) {
          // Save token AND redirect
          localStorage.setItem("token", data.token);
          router.push("/HomePage");
        } else {
          console.error("No token returned from /api/auth", data);
        }
      } catch (err) {
        console.error("Google login failed:", err);
      }
    };

    // Create script element
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // When the script loads, initialize and render the button
    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
      // ensure google identity API is available
      if (window.google?.accounts?.id?.initialize && window.google?.accounts?.id?.renderButton) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleCredentialResponse!,
        });

        const container = document.getElementById("googleSignIn");
        window.google.accounts.id.renderButton(container, { theme: "outline", size: "large", shape: "pill" });
      } else {
        console.warn("Google Identity Services API not available on window.google.accounts.id");
      }
    };

    // Cleanup on unmount: remove handler and script
    return () => {
      try {
        delete window.handleCredentialResponse;
      } catch {
        /* ignore */
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [router]);

  /* -------------------------
     Email/Password submit handler
     Replace the POST URL with your real API endpoint
     ------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://your-api.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/HomePage");
      } else {
        console.error("Login endpoint returned no token", data);
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
     UI (kept same as your design)
     ------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back 👋</h1>
          <p className="text-gray-600 mt-2">Login to access your dashboard</p>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <hr className="flex-1 border-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google Sign-in container (GIS will replace this with a button) */}
        <div className="flex justify-center">
          <div
            id="googleSignIn"
            className="flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer bg-white shadow-sm hover:shadow-md transition"
            role="button"
            aria-label="Sign in with Google"
          >
            <FcGoogle size={22} />
            <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
