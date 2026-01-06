// src/hooks/useAdminAuth.js
import { useMutation } from "@tanstack/react-query";

const API_URL = "https://be-mn-konveksi.vercel.app/api";

async function loginFn({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login gagal");
  }

  // SIMPAN TOKEN BACKEND ASLI
  localStorage.setItem("mn_token", data.token);
  localStorage.setItem("mn_user", JSON.stringify(data.user));

  return data;
}

export default function useAdminAuth() {
  const m = useMutation({
    mutationFn: loginFn,
  });

  function logout() {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
  }

  function isAuthenticated() {
    return !!localStorage.getItem("mn_token");
  }

  function isAdmin() {
    const user = JSON.parse(localStorage.getItem("mn_user") || "{}");
    return user.role === "ADMIN";
  }

  return {
    login: m.mutate,
    loginAsync: m.mutateAsync,
    isLoading: m.isLoading,
    isError: m.isError,
    error: m.error,
    logout,
    isAuthenticated,
    isAdmin,
  };
}
