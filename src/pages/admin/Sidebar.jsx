// src/pages/admin/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiBarChart2,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

export default function Sidebar({
  collapsed = false,
  mobile = false,
  onClose = () => {},
  onLogout = () => {},
}) {
  const items = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
    {
      to: "/admin/orders",
      label: "Pesanan",
      icon: <FiShoppingCart />,
    },
    { to: "/admin/products", label: "Produk", icon: <FiBox /> },
    { to: "/admin/laporan", label: "Laporan", icon: <FiBarChart2 /> },
  ];

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition ${
      isActive
        ? "bg-blue-600/90 text-white"
        : "text-slate-200 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div
      className={`flex flex-col h-full ${
        mobile
          ? "w-full bg-slate-900 text-white"
          : "bg-gradient-to-b from-slate-900 to-slate-800 text-white"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center px-4 h-16 border-b border-slate-800 gap-3">
        <div className="flex items-center justify-center rounded-md w-12 h-12 bg-white/10">
          <FiBox className="text-white" size={18} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold">MN Konveksi</span>
            <span className="text-xs text-slate-300">Admin Panel</span>
          </div>
        )}
      </div>

      {/* MENU */}
      <nav className={`flex-1 overflow-auto px-2 py-4 ${mobile ? "pb-6" : ""}`}>
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.to}>
              <NavLink
                to={it.to}
                className={linkClass}
                onClick={onClose}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-md text-slate-300">
                  {it.icon}
                </span>

                {!collapsed && (
                  <>
                    <span className="flex-1">{it.label}</span>
                    {it.badge && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                        {it.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white/8 rounded-full w-10 h-10">
            <FiUser />
          </div>

          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium">Admin</div>
              <div className="text-xs text-slate-300">
                admin@mnkonveksi.com
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="p-2 rounded-md hover:bg-white/5 text-slate-200"
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>

        {!collapsed && !mobile && (
          <div className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} MN Konveksi. All rights reserved.
          </div>
        )}
      </div>
    </div>
  );
}
