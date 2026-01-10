// src/pages/admin/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function Sidebar({
  collapsed = false,
  mobile = false,
  onClose = () => {},
  onToggleCollapse = () => {},
}) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("");
  const [user, setUser] = useState(null);

  // Ambil data user
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("mn_token");
        
        // Fetch user data saja
        const userRes = await fetch(
          "https://be-mn-konveksi.vercel.app/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.data);
        }
      } catch (err) {
        console.error("Gagal fetch data sidebar:", err);
        const storedUser = JSON.parse(localStorage.getItem("mn_user") || "{}");
        setUser(storedUser);
      }
    }

    fetchData();
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "bg-gradient-to-r from-indigo-600 to-purple-600",
      inactiveColor: "text-indigo-600",
    },
    {
      id: "orders",
      to: "/admin/orders",
      label: "Pesanan",
      icon: ShoppingBag,
      color: "bg-gradient-to-r from-emerald-600 to-teal-600",
      inactiveColor: "text-emerald-600",
    },
    {
      id: "products",
      to: "/admin/products",
      label: "Produk",
      icon: Package,
      color: "bg-gradient-to-r from-amber-600 to-orange-600",
      inactiveColor: "text-amber-600",
    },
    {
      id: "users",
      to: "/admin/users",
      label: "Pengguna",
      icon: Users,
      color: "bg-gradient-to-r from-purple-600 to-pink-600",
      inactiveColor: "text-purple-600",
    },
    {
      id: "reports",
      to: "/admin/laporan",
      label: "Laporan",
      icon: BarChart3,
      color: "bg-gradient-to-r from-cyan-600 to-blue-500",
      inactiveColor: "text-cyan-600",
    },
  ];

  const secondaryItems = [
    {
      id: "settings",
      to: "/admin/settings",
      label: "Pengaturan",
      icon: Settings,
      color: "bg-gradient-to-r from-gray-600 to-gray-700",
      inactiveColor: "text-gray-600",
    },
    {
      id: "help",
      to: "/admin/help",
      label: "Bantuan",
      icon: HelpCircle,
      color: "bg-gradient-to-r from-slate-600 to-slate-700",
      inactiveColor: "text-slate-600",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }, item) => {
    const baseClass = "group flex items-center w-full rounded-lg transition-all duration-300 hover:scale-[1.02]";
    const spacing = collapsed ? "px-3 py-3 justify-center" : "px-4 py-3 gap-3";
    
    if (isActive) {
      return `${baseClass} ${spacing} ${item.color} text-white shadow-lg shadow-indigo-500/20`;
    }
    
    return `${baseClass} ${spacing} text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-300`;
  };

  return (
    <div className={`
      flex flex-col h-full
      ${mobile 
        ? "w-72 bg-gradient-to-b from-slate-900 to-gray-900 border-r border-gray-800" 
        : "bg-gradient-to-b from-slate-900 to-gray-900 border-r border-gray-800"
      }
      transition-all duration-300
      shadow-2xl
    `}>
      {/* HEADER */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="text-white" size={20} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">MN KONVEKSI</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="flex justify-center w-full">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="text-white" size={20} />
              </div>
            </div>
          )}
          
          {!mobile && (
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* MAIN MENU */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={() => {
                  setActiveMenu(item.id);
                  onClose();
                }}
                className={(isActive) => linkClass(isActive, item)}
              >
                <div className={`relative ${collapsed ? '' : 'flex items-center gap-3'}`}>
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-sm
                    ${activeMenu === item.id 
                      ? 'text-white' 
                      : `bg-gray-800 ${item.inactiveColor} group-hover:scale-110`
                    }
                  `}>
                    <Icon size={18} />
                  </div>
                  
                  {!collapsed && (
                    <>
                      <span className="flex-1 font-medium text-sm text-gray-200 group-hover:text-white">{item.label}</span>
                    </>
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* SECONDARY MENU */}
        {!collapsed && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              LAINNYA
            </p>
            <div className="space-y-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    onClick={onClose}
                    className={(isActive) => linkClass(isActive, item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gray-800 ${item.inactiveColor} flex items-center justify-center shadow-sm`}>
                        <Icon size={18} />
                      </div>
                      <span className="flex-1 font-medium text-sm text-gray-300 group-hover:text-white">{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* USER PROFILE & LOGOUT */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="text-white" size={18} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
          </div>
          
          {!collapsed && (
            <div className="flex-1">
              <div className="font-medium text-sm text-white">
                {user?.nama || user?.username || "Admin MN"}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {user?.email || "admin@mnkonveksi.com"}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`
              p-2 rounded-lg transition-all duration-300 hover:scale-110
              ${collapsed 
                ? 'w-full bg-gray-800 text-gray-400 hover:bg-red-900/30 hover:text-red-400' 
                : 'bg-gray-800 text-gray-400 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white'
              }
              shadow-sm
            `}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        {!collapsed && !mobile && (
          <div className="mt-4 px-3">
            <div className="text-xs text-gray-500 text-center">
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