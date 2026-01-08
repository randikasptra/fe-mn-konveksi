// src/services/userService.js
const API_BASE = "https://be-mn-konveksi.vercel.app/api";

class UserService {
  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const token = localStorage.getItem("mn_token");
      if (!token) {
        throw new Error("Silakan login terlebih dahulu");
      }

      const response = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal memuat profil");
      }

      return {
        success: true,
        data: json.data
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data) {
    try {
      const token = localStorage.getItem("mn_token");
      if (!token) {
        throw new Error("Silakan login terlebih dahulu");
      }

      // Format nomor HP (hapus karakter non-digit)
      const no_hp = data.no_hp ? data.no_hp.replace(/[^0-9]/g, "") : null;

      const response = await fetch(`${API_BASE}/auth/update-profile`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: data.nama,
          no_hp,
          alamat: data.alamat || null,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal memperbarui profil");
      }

      // Update localStorage
      if (json.data) {
        localStorage.setItem("mn_user", JSON.stringify(json.data));
        window.dispatchEvent(new Event("authChanged"));
      }

      return {
        success: true,
        data: json.data,
        message: "Profil berhasil diperbarui"
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const token = localStorage.getItem("mn_token");
      if (!token) {
        throw new Error("Silakan login terlebih dahulu");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Password baru dan konfirmasi tidak sama");
      }

      if (newPassword.length < 6) {
        throw new Error("Password minimal 6 karakter");
      }

      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal mengubah password");
      }

      return {
        success: true,
        message: "Password berhasil diubah"
      };
    } catch (error) {
      console.error("Error changing password:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      const token = localStorage.getItem("mn_token");
      
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear localStorage regardless
      localStorage.removeItem("mn_token");
      localStorage.removeItem("mn_user");
      window.dispatchEvent(new Event("authChanged"));
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem("mn_user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const token = localStorage.getItem("mn_token");
    const user = localStorage.getItem("mn_user");
    return !!(token && user);
  }

  /**
   * Format phone number
   */
  formatPhone(phone) {
    if (!phone) return "-";
    
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, "");
    
    // Format: 0812-3456-7890
    if (cleaned.length === 12 || cleaned.length === 13) {
      return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    }
    
    return phone;
  }
}

export default new UserService();