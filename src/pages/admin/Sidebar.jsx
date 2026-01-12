// src/components/admin/AdminSidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import Logo from "../../assets/LOGO-MN.png";

export default function AdminSidebar({
  collapsed = false,
  mobile = false,
  onClose = () => {},
  onToggleCollapse = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("mn_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Gradient utama yang sama dengan hero section user
  const primaryGradient =
    "bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900";

  const menuItems = [
    {
      id: "dashboard",
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: "mdi:view-dashboard",
      activeColor: "from-indigo-500 to-purple-500",
    },
    {
      id: "orders",
      to: "/admin/orders",
      label: "Pesanan",
      icon: "mdi:shopping-outline",
      activeColor: "from-emerald-500 to-teal-500",
    },
    {
      id: "products",
      to: "/admin/products",
      label: "Produk",
      icon: "mdi:tshirt-crew",
      activeColor: "from-amber-500 to-orange-500",
    },
    {
      id: "users",
      to: "/admin/users",
      label: "Pengguna",
      icon: "mdi:account-group",
      activeColor: "from-pink-500 to-rose-500",
    },
    {
      id: "reports",
      to: "/admin/laporan",
      label: "Laporan",
      icon: "mdi:chart-bar",
      activeColor: "from-cyan-500 to-blue-500",
    },
    {
      id: "settings",
      to: "/admin/settings",
      label: "Pengaturan",
      icon: "mdi:cog",
      activeColor: "from-gray-600 to-slate-600",
    },
  ];

  const secondaryItems = [
    {
      id: "logout",
      action: () => {
        localStorage.removeItem("mn_token");
        localStorage.removeItem("mn_user");
        navigate("/admin/login");
      },
      label: "Keluar",
      icon: "mdi:logout",
    },
  ];

  return (
    <div
      className={`
        flex flex-col h-full ${primaryGradient}
        ${mobile ? "w-72 shadow-2xl" : collapsed ? "w-20" : "w-64"}
        transition-all duration-300
        border-r border-white/10
      `}
    >
      {/* HEADER */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="relative">
              <img
                src={Logo}
                alt="MN Konveksi Logo"
                className="w-10 h-10 object-contain filter brightness-0 invert"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-bold text-white">MN KONVEKSI</h1>
                <p className="text-xs text-gray-300">Admin Panel</p>
              </div>
            )}
          </div>

          {!mobile && (
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-300 hover:text-white"
            >
              <Icon
                icon={collapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
                className="text-xl"
              />
            </button>
          )}
        </div>
      </div>

      {/* MAIN MENU */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              location.pathname.startsWith(`${item.to}/`);

            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={onClose}
                className={`
                  group flex items-center w-full rounded-xl transition-all duration-300
                  ${collapsed ? "px-3 py-3 justify-center" : "px-4 py-3 gap-3"}
                  ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg`
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <div
                  className={`
                  w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-gray-300 group-hover:bg-white/10 group-hover:text-white"
                  }
                `}
                >
                  <Icon icon={item.icon} className="text-xl" />
                </div>

                {!collapsed && (
                  <>
                    <span className="flex-1 font-medium text-sm">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* DIVIDER */}
        {!collapsed && (
          <div className="my-6 px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        )}

        {/* SECONDARY MENU */}
        <div className="space-y-2">
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) item.action();
                else if (item.to) navigate(item.to);
                onClose();
              }}
              className={`
                group flex items-center w-full rounded-xl transition-all duration-300
                ${collapsed ? "px-3 py-3 justify-center" : "px-4 py-3 gap-3"}
                text-gray-300 hover:bg-white/10 hover:text-white
              `}
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                <Icon icon={item.icon} className="text-xl" />
              </div>

              {!collapsed && (
                <span className="flex-1 font-medium text-sm text-left">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* USER PROFILE */}
      <div className="px-3 py-4 border-t border-white/10">
        <div
          className={`
          flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors
          ${collapsed ? "justify-center" : ""}
        `}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
              {user?.nama?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
          </div>

          {!collapsed && (
            <div className="flex-1">
              <div className="font-medium text-sm text-white">
                {user?.nama || user?.username || "Admin MN"}
              </div>
              <div className="text-xs text-gray-300 truncate">
                {user?.email || "admin@mnkonveksi.com"}
              </div>
            </div>
          )}
        </div>

        {!collapsed && !mobile && (
          <div className="mt-4 px-3">
            <div className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} MN Konveksi
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">
              v2.0.1 • Premium Edition
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
