import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import userService from "../../services/userService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const result = await userService.getProfile();

      if (!result.success) {
        throw new Error(result.message);
      }

      setUser(result.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(error.message || "Gagal memuat profil");

      if (error.message.includes("login") || error.message.includes("token")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    if (window.confirm("Yakin ingin keluar dari akun Anda?")) {
      await userService.logout();
      toast.success("Berhasil logout");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:account-alert"
            className="text-gray-400 text-6xl mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Data Tidak Ditemukan
          </h3>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="mdi:arrow-left" className="text-2xl text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          </div>
          <p className="text-gray-600 ml-14">
            Kelola informasi profil dan keamanan akun Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sticky top-8">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-5xl font-bold text-indigo-600">
                      {user.nama?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full border-4 border-white flex items-center justify-center">
                    <Icon icon="mdi:check" className="text-white text-lg" />
                  </div>
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.nama}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-xl mb-4">
                  <Icon icon="mdi:account-circle" />
                  <span className="font-medium text-sm">{user.role}</span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <Icon
                      icon="mdi:package-variant"
                      className="text-3xl text-indigo-500 mx-auto mb-2"
                    />
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-xs text-gray-500">Total Pesanan</p>
                  </div>
                  <div className="text-center">
                    <Icon
                      icon="mdi:clock-outline"
                      className="text-3xl text-amber-500 mx-auto mb-2"
                    />
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-xs text-gray-500">Dalam Proses</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => navigate("/pesanan-saya")}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:package-variant" />
                    Lihat Pesanan Saya
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:logout" />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="mdi:account-details"
                      className="text-indigo-600 text-2xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Informasi Pribadi
                    </h3>
                    <p className="text-sm text-gray-500">
                      Data diri Anda yang terdaftar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                  <Icon icon="mdi:pencil" />
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <InfoRow
                  icon="mdi:account"
                  label="Nama Lengkap"
                  value={user.nama}
                />
                <InfoRow icon="mdi:email" label="Email" value={user.email} />
                <InfoRow
                  icon="mdi:phone"
                  label="No. WhatsApp"
                  value={userService.formatPhone(user.no_hp)}
                />
                <InfoRow
                  icon="mdi:map-marker"
                  label="Alamat"
                  value={user.alamat || "-"}
                  multiline
                />
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="mdi:shield-lock"
                      className="text-emerald-600 text-2xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Keamanan Akun
                    </h3>
                    <p className="text-sm text-gray-500">
                      Kelola password dan keamanan
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:lock" className="text-gray-400 text-2xl" />
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-500">••••••••</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Ubah
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:check-circle"
                      className="text-emerald-600 text-2xl"
                    />
                    <div>
                      <p className="font-medium text-emerald-900">
                        Email Terverifikasi
                      </p>
                      <p className="text-sm text-emerald-600">
                        Akun Anda sudah aman
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Akses Cepat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickLinkCard
                  icon="mdi:package-variant"
                  title="Pesanan Saya"
                  description="Lihat riwayat pesanan"
                  onClick={() => navigate("/pesanan-saya")}
                  color="indigo"
                />
                <QuickLinkCard
                  icon="mdi:shopping"
                  title="Produk"
                  description="Jelajahi katalog produk"
                  onClick={() => navigate("/produk")}
                  color="purple"
                />
                <QuickLinkCard
                  icon="mdi:whatsapp"
                  title="Hubungi Kami"
                  description="Chat via WhatsApp"
                  onClick={() =>
                    window.open("https://wa.me/6281234567890", "_blank")
                  }
                  color="emerald"
                />
                <QuickLinkCard
                  icon="mdi:help-circle"
                  title="Bantuan"
                  description="FAQ & Panduan"
                  onClick={() => navigate("/bantuan")}
                  color="amber"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadProfile();
          }}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false);
          }}
        />
      )}
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function InfoRow({ icon, label, value, multiline }) {
  return (
    <div
      className={`flex ${
        multiline ? "items-start" : "items-center"
      } justify-between py-4 border-b border-gray-100 last:border-0`}
    >
      <div className="flex items-center gap-3">
        <Icon icon={icon} className="text-gray-400 text-xl" />
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span
        className={`text-gray-900 font-semibold ${
          multiline ? "max-w-xs text-right" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function QuickLinkCard({ icon, title, description, onClick, color }) {
  const colorClasses = {
    indigo:
      "from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200",
    purple:
      "from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200",
    emerald:
      "from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-200",
    amber:
      "from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200",
  };

  const iconColors = {
    indigo: "text-indigo-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 bg-gradient-to-r ${colorClasses[color]} rounded-xl border transition-all text-left group`}
    >
      <Icon
        icon={icon}
        className={`${iconColors[color]} text-3xl mb-3 group-hover:scale-110 transition-transform`}
      />
      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

/* ================= EDIT PROFILE MODAL ================= */

function EditProfileModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nama: user.nama || "",
    no_hp: user.no_hp ? userService.formatPhoneForInput(user.no_hp) : "",
    alamat: user.alamat || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!form.nama.trim()) {
      newErrors.nama = "Nama wajib diisi";
    }
    
    // Phone validation (optional)
    if (form.no_hp && form.no_hp.trim() !== "") {
      const cleanedPhone = form.no_hp.replace(/[^0-9]/g, "");
      if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
        newErrors.no_hp = "Nomor HP harus 10-15 digit";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await userService.updateProfile(form);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success(result.message || "Profil berhasil diperbarui");
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    const formatted = value.replace(/[^0-9]/g, '');
    setForm({ ...form, no_hp: formatted });
    if (errors.no_hp) setErrors({ ...errors, no_hp: null });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-3xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Edit Profil</h2>
              <p className="text-indigo-100">Perbarui informasi pribadi Anda</p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => {
                setForm({ ...form, nama: e.target.value });
                if (errors.nama) setErrors({ ...errors, nama: null });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                errors.nama ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.nama && (
              <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. WhatsApp (opsional)
            </label>
            <div className="flex items-center">
              <div className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl">
                +62
              </div>
              <input
                type="text"
                value={form.no_hp}
                onChange={handlePhoneChange}
                className={`flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                  errors.no_hp ? 'border-red-300' : ''
                }`}
                placeholder="81234567890"
              />
            </div>
            {errors.no_hp ? (
              <p className="mt-1 text-sm text-red-600">{errors.no_hp}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Contoh: 81234567890 (tanpa 0 di depan)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat (opsional)
            </label>
            <textarea
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              placeholder="Masukkan alamat lengkap"
              rows={4}
            />
            <p className="mt-1 text-sm text-gray-500">
              Alamat akan digunakan untuk pengiriman pesanan
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= CHANGE PASSWORD MODAL ================= */

function ChangePasswordModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      toast.error("Semua field wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await userService.changePassword(
        form.old_password,
        form.new_password,
        form.confirm_password
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success(result.message);
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Gagal mengubah password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ubah Password</h2>
              <p className="text-emerald-100">
                Perbarui password untuk keamanan akun
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Lama *
            </label>
            <input
              type="password"
              value={form.old_password}
              onChange={(e) =>
                setForm({ ...form, old_password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Masukkan password lama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Baru *
            </label>
            <input
              type="password"
              value={form.new_password}
              onChange={(e) =>
                setForm({ ...form, new_password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password Baru *
            </label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm({ ...form, confirm_password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Ulangi password baru"
            />
          </div>

          {form.new_password &&
            form.confirm_password &&
            form.new_password === form.confirm_password && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <Icon icon="mdi:check-circle" />
                <span>Password cocok</span>
              </div>
            )}

          <div className="flex gap-4 pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ubah Password"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}