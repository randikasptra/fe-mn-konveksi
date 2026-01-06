import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ===============================
 * 🔧 DEV CONFIG
 * ===============================
 * true  = login backend DIMATIKAN (bypass)
 * false = login backend NORMAL
 */
const DISABLE_LOGIN = false;

/**
 * props:
 * - open: boolean
 * - onClose: function
 * - role: "user" | "admin"
 * - onOpenRegister: function
 */
export default function LoginModal({
  open,
  onClose,
  role = "user",
  onOpenRegister,
}) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // =====================================
    // 🚧 DEV MODE (LOGIN DIMATIKAN)
    // =====================================
    if (DISABLE_LOGIN) {
      localStorage.setItem(
        "mn_user",
        JSON.stringify({
          id: 0,
          email: "dev@local.test",
          role: "admin",
        })
      );
      localStorage.setItem("mn_token", "dev-token");

      // trigger refresh header / sidebar
      window.dispatchEvent(new Event("authChanged"));

      onClose?.();
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // =====================================
    // 🔐 LOGIN NORMAL (BACKEND)
    // =====================================
    if (!email || !password) {
      setError("Isi email dan password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "https://be-mn-konveksi.vercel.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Login gagal");
      }

      if (!result.token || !result.data) {
        throw new Error("Response login tidak valid");
      }

      localStorage.setItem("mn_token", result.token);
      localStorage.setItem("mn_user", JSON.stringify(result.data));

      window.dispatchEvent(new Event("authChanged"));

      const userRole = (result.data.role || role)
        .toString()
        .toLowerCase();

      onClose?.();

      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo() {
    if (role === "admin") {
      setEmail("admin@konveksi.test");
      setPassword("password123");
    } else {
      setEmail("user@konveksi.test");
      setPassword("password123");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black"
        >
          <span className="text-lg font-bold">×</span>
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-center">Masuk</h2>
          <p className="text-xs text-center text-gray-500 mt-2">
            Detail kata sandi adalah hal sensitif
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* EMAIL */}
            <div className="flex items-center border rounded-full px-3 py-2 gap-3">
              <input
                className="w-full outline-none text-sm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat email"
                required
                disabled={DISABLE_LOGIN}
              />
            </div>

            {/* PASSWORD */}
            <div className="flex items-center border rounded-full px-3 py-2 gap-3">
              <input
                className="w-full outline-none text-sm"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi"
                required
                disabled={DISABLE_LOGIN}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="text-gray-500 text-xs"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-full py-3 text-white font-semibold ${
                isLoading
                  ? "bg-gray-400"
                  : "bg-gray-700 hover:opacity-95"
              }`}
            >
              {DISABLE_LOGIN
                ? "Masuk (Dev Mode)"
                : isLoading
                ? "Memproses..."
                : "Masuk"}
            </button>
          </form>

          {error && (
            <div className="mt-3 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* REGISTER */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                onClose?.();
                onOpenRegister?.();
              }}
              className="mt-3 w-full rounded-full py-3 border"
            >
              Buat Akun
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            <button onClick={fillDemo} className="underline">
              Isi demo creds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
