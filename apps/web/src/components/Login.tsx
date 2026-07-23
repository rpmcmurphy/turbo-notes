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
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 border border-stone-200 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-center text-stone-800">
          {isRegister ? "Create Admin Account" : "Login"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
            required
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 text-center text-white bg-stone-800 hover:bg-stone-700 transition-colors rounded-md text-sm font-medium"
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-xs text-stone-500 hover:text-stone-700"
        >
          {isRegister
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
}
