const API_BASE = "https://be-mn-konveksi.vercel.app/api";

class UserService {
  // =========================
  // AUTH / PROFILE
  // =========================

  async getProfile() {
    try {
      const token = localStorage.getItem("mn_token");
      if (!token) throw new Error("Silakan login terlebih dahulu");

      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      return { success: true, data: json.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // =========================
  // ADMIN - USER MANAGEMENT
  // =========================

  async getAllUsers() {
    try {
      const token = localStorage.getItem("mn_token");

      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      return { success: true, data: json.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async getUserDetail(id) {
    try {
      const token = localStorage.getItem("mn_token");

      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      return { success: true, data: json.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async updateUser(id, data) {
    try {
      const token = localStorage.getItem("mn_token");
      if (!token) throw new Error("Unauthorized");

      const payload = {
        nama: data.nama,
        no_hp: data.no_hp?.replace(/\D/g, "") || null,
        alamat: data.alamat || null,
        role: data.role,
      };

      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      return {
        success: true,
        message: "User berhasil diperbarui",
        data: json.data,
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // =========================
  // PASSWORD
  // =========================

  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const token = localStorage.getItem("mn_token");

      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      return { success: true, message: "Password berhasil diubah" };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // =========================
  // SESSION
  // =========================

  logout() {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
    window.dispatchEvent(new Event("authChanged"));
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("mn_user"));
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    return !!localStorage.getItem("mn_token");
  }
}

export default new UserService();
