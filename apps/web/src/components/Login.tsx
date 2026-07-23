"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { username, email, password }
        : { email, password };
      const data = await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      localStorage.setItem("token", data.access_token);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm space-y-6 p-10 bg-surface rounded-lg border border-line shadow-sm">
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-accent flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-ink">
            {isRegister ? "Create Account" : "Welcome back"}
          </h1>
          <p className="text-sm text-ink-3">
            {isRegister
              ? "Set up your admin account"
              : "Sign in to your account"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium mb-1.5 text-ink-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bg border border-line rounded-md text-sm text-ink placeholder:text-ink-3 focus-input transition-all"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-ink-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-bg border border-line rounded-md text-sm text-ink placeholder:text-ink-3 focus-input transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-ink-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-bg border border-line rounded-md text-sm text-ink placeholder:text-ink-3 focus-input transition-all"
              required
            />
          </div>
          {error && (
            <div className="text-xs px-3 py-2 rounded-md bg-red-soft text-red">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2.5 text-center text-white bg-accent rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
        <div className="text-center pt-1">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-ink-3 hover:text-ink-2 transition-colors"
          >
            {isRegister ? "Already have an account? " : "Need an account? "}
            <span className="text-accent font-medium">
              {isRegister ? "Sign in" : "Register"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
