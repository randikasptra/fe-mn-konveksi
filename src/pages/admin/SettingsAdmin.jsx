// src/pages/admin/SettingsAdmin.jsx
import React, { useState, useEffect } from "react";
import { useToast } from "../../App";
import userService from "../../services/userService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Shield,
  Globe,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const SettingsAdmin = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);

  // Profile data
  const [profileData, setProfileData] = useState({
    nama: "",
    email: "",
    no_hp: "",
    alamat: "",
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    order_updates: true,
    payment_reminders: true,
    marketing_emails: false,
    push_notifications: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    two_factor_auth: false,
    session_timeout: 60, // minutes
    login_alerts: true,
  });

  // Show password states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const currentUser = JSON.parse(localStorage.getItem("mn_user") || "{}");
    setUser(currentUser);
    setProfileData({
      nama: currentUser.nama || "",
      email: currentUser.email || "",
      no_hp: currentUser.no_hp || "",
      alamat: currentUser.alamat || "",
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSecurityChange = (key, value) => {
    setSecurity((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.nama.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    setLoading(true);
    const loadingId = toast.loading("Menyimpan perubahan...");

    try {
      const result = await userService.updateProfile(profileData);
      toast.dismiss(loadingId);

      if (result.success) {
        toast.success("Profil berhasil diperbarui");
        // Update localStorage
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("mn_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        toast.error(result.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    const loadingId = toast.loading("Mengubah password...");

    try {
      const result = await userService.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.confirm_password
      );
      toast.dismiss(loadingId);

      if (result.success) {
        toast.success("Password berhasil diubah");
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        toast.error(result.message || "Gagal mengubah password");
      }
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("Terjadi kesalahan saat mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = async () => {
    const loadingId = toast.loading("Menyimpan pengaturan notifikasi...");

    // Simpan ke localStorage atau API
    setTimeout(() => {
      toast.dismiss(loadingId);
      toast.success("Pengaturan notifikasi disimpan");
    }, 1000);
  };

  const handleSecuritySubmit = async () => {
    const loadingId = toast.loading("Menyimpan pengaturan keamanan...");

    // Simpan ke localStorage atau API
    setTimeout(() => {
      toast.dismiss(loadingId);
      toast.success("Pengaturan keamanan disimpan");
    }, 1000);
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "general", label: "Umum", icon: Globe },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Admin</h1>
          <p className="text-gray-600 mt-1">
            Kelola pengaturan akun dan preferensi Anda
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-6">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* User Info Card */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.nama?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.nama || "Admin"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email || "-"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {user?.role || "ADMIN"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Informasi Profil
                    </h2>
                    <p className="text-gray-600">
                      Perbarui informasi profil dan kontak Anda
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          name="nama"
                          value={profileData.nama}
                          onChange={handleProfileChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Alamat Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">
                          Email tidak dapat diubah. Hubungi administrator untuk
                          perubahan email.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Nomor Telepon
                        </label>
                        <input
                          type="tel"
                          name="no_hp"
                          value={profileData.no_hp}
                          onChange={handleProfileChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          placeholder="0812-3456-7890"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Alamat
                        </label>
                        <textarea
                          name="alamat"
                          value={profileData.alamat}
                          onChange={handleProfileChange}
                          rows="3"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                          placeholder="Masukkan alamat lengkap..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Ubah Password
                    </h2>
                    <p className="text-gray-600">Perbarui password akun Anda</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? "text" : "password"}
                          name="old_password"
                          value={passwordData.old_password}
                          onChange={handlePasswordChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showOldPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition pr-12"
                          required
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Minimal 6 karakter
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Konfirmasi Password Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Tips Keamanan Password:
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Minimal 6 karakter
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Kombinasi huruf dan angka
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Hindari informasi pribadi
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          Jangan gunakan password yang sama untuk banyak akun
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <Lock className="w-5 h-5" />
                      {loading ? "Mengubah..." : "Ubah Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Pengaturan Notifikasi
                    </h2>
                    <p className="text-gray-600">
                      Kelola preferensi notifikasi Anda
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Email Notifications
                    </h3>
                    {[
                      {
                        key: "email_notifications",
                        label: "Email Notifications",
                        description: "Terima notifikasi penting via email",
                      },
                      {
                        key: "order_updates",
                        label: "Pembaruan Pesanan",
                        description: "Notifikasi status pesanan baru",
                      },
                      {
                        key: "payment_reminders",
                        label: "Pengingat Pembayaran",
                        description:
                          "Pengingat untuk pembayaran yang jatuh tempo",
                      },
                      {
                        key: "marketing_emails",
                        label: "Email Marketing",
                        description: "Promo dan penawaran khusus",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(item.key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications[item.key]
                              ? "bg-indigo-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications[item.key]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Push Notifications
                    </h3>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          Push Notifications
                        </p>
                        <p className="text-sm text-gray-500">
                          Notifikasi langsung di browser Anda
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleNotificationChange("push_notifications")
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.push_notifications
                            ? "bg-indigo-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.push_notifications
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleNotificationsSubmit}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Pengaturan Keamanan
                    </h2>
                    <p className="text-gray-600">Kelola keamanan akun Anda</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Autentikasi
                    </h3>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            Two-Factor Authentication (2FA)
                          </p>
                          <p className="text-sm text-gray-500">
                            Tambahkan lapisan keamanan ekstra ke akun Anda
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleSecurityChange(
                              "two_factor_auth",
                              !security.two_factor_auth
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            security.two_factor_auth
                              ? "bg-purple-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              security.two_factor_auth
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      {security.two_factor_auth && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            2FA akan mengirimkan kode verifikasi ke email Anda
                            setiap kali login dari perangkat baru.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Sesi Login
                    </h3>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            Login Alerts
                          </p>
                          <p className="text-sm text-gray-500">
                            Dapatkan notifikasi saat ada login baru
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleSecurityChange(
                              "login_alerts",
                              !security.login_alerts
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            security.login_alerts
                              ? "bg-purple-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              security.login_alerts
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Session Timeout (menit)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="15"
                            max="240"
                            step="15"
                            value={security.session_timeout}
                            onChange={(e) =>
                              handleSecurityChange(
                                "session_timeout",
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                            {security.session_timeout} menit
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Waktu sebelum sesi login berakhir karena tidak aktif
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">
                          Tips Keamanan Akun
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                          <li>• Jangan berikan password kepada siapapun</li>
                          <li>• Selalu logout dari perangkat publik</li>
                          <li>• Gunakan password yang kuat dan unik</li>
                          <li>• Perbarui password secara berkala</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleSecuritySubmit}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Globe className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Pengaturan Umum
                    </h2>
                    <p className="text-gray-600">
                      Pengaturan sistem dan preferensi
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Bahasa & Region
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Bahasa
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                          <option value="id">Bahasa Indonesia</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Zona Waktu
                        </label>
                        <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                          <option value="Asia/Jakarta">WIB (Jakarta)</option>
                          <option value="Asia/Makassar">WITA (Makassar)</option>
                          <option value="Asia/Jayapura">WIT (Jayapura)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Tampilan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Mode Tema
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: "light", label: "Terang" },
                            { id: "dark", label: "Gelap" },
                            { id: "auto", label: "Otomatis" },
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                            >
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Density
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: "comfortable", label: "Nyaman" },
                            { id: "compact", label: "Padat" },
                          ].map((density) => (
                            <button
                              key={density.id}
                              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                            >
                              {density.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Informasi Sistem
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Versi Aplikasi</p>
                        <p className="font-medium">1.0.0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Terakhir Update</p>
                        <p className="font-medium">
                          {new Date().toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Browser</p>
                        <p className="font-medium">
                          {navigator.userAgent.split(" ")[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Online</p>
                        <p className="font-medium text-green-600">
                          ● Terhubung
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Reset ke Default
                  </button>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
                    <Save className="w-5 h-5" />
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAdmin;
