// src/pages/admin/UsersAdmin.jsx
import React, { useEffect, useState } from "react";
import userService from "../../services/userService";
import { useToast } from "../../App";
import {
  FiEdit,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiPlus,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import {
  MapPin,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    customers: 0,
    active: 0,
  });

  const toast = useToast();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_hp: "",
    alamat: "",
    role: "CUSTOMER",
    password: "",
    confirmPassword: "",
  });

  const [editFormData, setEditFormData] = useState({
    nama: "",
    email: "",
    no_hp: "",
    alamat: "",
    role: "CUSTOMER",
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await userService.getAllUsers();

    if (result.success) {
      setUsers(result.data);
    } else {
      toast.error(result.message || "Gagal memuat data pengguna");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    // Calculate stats from users data
    if (users.length > 0) {
      const total = users.length;
      const admins = users.filter((u) => u.role === "ADMIN").length;
      const customers = users.filter((u) => u.role === "CUSTOMER").length;
      const active = users.filter((u) => u.status === "ACTIVE").length;

      setStats({ total, admins, customers, active });
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      nama: user.nama || "",
      email: user.email || "",
      no_hp: user.no_hp || "",
      alamat: user.alamat || "",
      role: user.role || "CUSTOMER",
    });
    setIsModalOpen(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    // Navigate to user detail page or show detail modal
    toast.info(`Melihat detail ${user.nama}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    const loadingId = toast.loading("Menghapus pengguna...");
    const result = await userService.deleteUser(userToDelete.id_user);

    toast.dismiss(loadingId);

    if (result.success) {
      toast.success(`Pengguna ${userToDelete.nama} berhasil dihapus`);
      setUsers((prev) =>
        prev.filter((u) => u.id_user !== userToDelete.id_user)
      );
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchStats();
    } else {
      toast.error(result.message || "Gagal menghapus pengguna");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const loadingId = toast.loading("Menyimpan perubahan...");
    const result = await userService.updateUser(
      selectedUser.id_user,
      editFormData
    );

    toast.dismiss(loadingId);

    if (result.success) {
      toast.success("Perubahan berhasil disimpan");
      setUsers((prev) =>
        prev.map((u) =>
          u.id_user === selectedUser.id_user ? { ...u, ...editFormData } : u
        )
      );
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchStats();
    } else {
      toast.error(result.message || "Gagal menyimpan perubahan");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    const loadingId = toast.loading("Membuat pengguna baru...");
    const result = await userService.createUser({
      nama: formData.nama,
      email: formData.email,
      password: formData.password,
      no_hp: formData.no_hp,
      alamat: formData.alamat,
      role: formData.role,
    });

    toast.dismiss(loadingId);

    if (result.success) {
      toast.success("Pengguna baru berhasil dibuat");
      setUsers((prev) => [...prev, result.data]);
      setIsAddModalOpen(false);
      setFormData({
        nama: "",
        email: "",
        no_hp: "",
        alamat: "",
        role: "CUSTOMER",
        password: "",
        confirmPassword: "",
      });
      fetchStats();
    } else {
      toast.error(result.message || "Gagal membuat pengguna baru");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      // ❌ SEMBUNYIKAN ADMIN
      if (user.role === "ADMIN") return false;

      const matchesSearch =
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.no_hp && user.no_hp.includes(searchTerm));

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CUSTOMER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-red-100 text-red-800 border-red-200";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return "-";
    return phone.replace(/(\d{4})(\d{4})(\d{0,4})/, "$1-$2-$3");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Pengguna
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola data pengguna dan akses sistem
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            <FiPlus className="w-5 h-5" />
            Tambah Pengguna
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pengguna</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Semua akun terdaftar
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pelanggan</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.customers}
                </p>
                <p className="text-xs text-gray-400 mt-1">Pengguna customer</p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pengguna Aktif</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.active}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-xs text-gray-400">Sedang aktif</p>
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white group-hover:scale-110 transition">
                <FiUser className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama, email, atau nomor HP..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400 w-4 h-4" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[140px]"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Semua Role</option>
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="SUSPENDED">Ditangguhkan</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              {filteredUsers.length} dari {users.length} pengguna
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  No
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  <button
                    onClick={() => handleSort("nama")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Pengguna
                    {sortBy === "nama" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  <button
                    onClick={() => handleSort("role")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Role/Status
                    {sortBy === "role" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Bergabung
                    {sortBy === "created_at" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiUser className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">
                        Tidak ada data pengguna
                      </p>
                      {(searchTerm ||
                        roleFilter !== "ALL" ||
                        statusFilter !== "ALL") && (
                        <p className="text-gray-400 mt-1">
                          Coba ubah filter pencarian
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id_user}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {index + 1}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-indigo-600">
                            {user.nama?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.nama}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMail className="mr-2 text-gray-400 w-4 h-4" />
                          {user.email}
                        </div>
                        {user.no_hp && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiPhone className="mr-2 text-gray-400 w-4 h-4" />
                            {formatPhone(user.no_hp)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                            user.role
                          )}`}
                        >
                          <FiShield className="w-3 h-3" />
                          {user.role}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            user.status || "ACTIVE"
                          )}`}
                        >
                          {user.status || "ACTIVE"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="mr-2 text-gray-400 w-4 h-4" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 py-5 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Edit Pengguna
                  </h3>
                  <p className="text-sm text-gray-600">{selectedUser?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  value={editFormData.nama}
                  onChange={handleEditChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  disabled
                  className="w-full border rounded-lg px-4 py-2.5 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={editFormData.no_hp}
                  onChange={handleEditChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <textarea
                  name="alamat"
                  value={editFormData.alamat}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 py-5 border-b flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Tambah Pengguna Baru
                  </h3>
                  <p className="text-sm text-gray-600">
                    Buat akun pengguna baru
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleAddChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleAddChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleAddChange}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Konfirmasi Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleAddChange}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleAddChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleAddChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleAddChange}
                  rows="3"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Buat Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 py-5 border-b flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Konfirmasi Hapus
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Apakah Anda yakin ingin menghapus pengguna{" "}
                <strong>{userToDelete.nama}</strong> ({userToDelete.email})?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Semua data terkait pengguna ini akan dihapus secara permanen.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  className="px-5 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Hapus Pengguna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
