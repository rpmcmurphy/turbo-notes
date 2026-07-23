"use client";

import { useState, useEffect } from "react";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuth(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
  };

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}