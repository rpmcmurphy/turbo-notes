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
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-xs space-y-6">
        <h1 className="text-lg font-medium text-center text-ink">
          {isRegister ? "Create Admin Account" : "Login"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border-b border-stone-300 focus:outline-none focus:border-ink text-sm"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border-b border-stone-300 focus:outline-none focus:border-ink text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border-b border-stone-300 focus:outline-none focus:border-ink text-sm"
            required
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 text-center text-stone-600 hover:text-ink transition-colors"
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-xs text-stone-400 hover:text-stone-600"
        >
          {isRegister
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
}
