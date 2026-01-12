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
   * Update user profile - MENGGUNAKAN PATH /api/users/:id
   */
  async updateProfile(data) {
    try {
      const token = localStorage.getItem("mn_token");
      const currentUser = this.getCurrentUser();
      
      if (!token || !currentUser) {
        throw new Error("Silakan login terlebih dahulu");
      }

      // Get user ID dari current user
      const userId = currentUser.id_user || currentUser.id;
      
      if (!userId) {
        throw new Error("ID pengguna tidak ditemukan");
      }

      // Format nomor HP (hapus karakter non-digit dan ubah ke format 62)
      let no_hp = data.no_hp ? data.no_hp.replace(/[^0-9]/g, "") : null;
      
      // Convert to 62 format if starts with 0 or +62
      if (no_hp) {
        if (no_hp.startsWith('0')) {
          no_hp = '62' + no_hp.substring(1);
        } else if (no_hp.startsWith('62')) {
          // Already in correct format
        } else if (no_hp.startsWith('+62')) {
          no_hp = no_hp.substring(1); // Remove +
        }
      }

      const requestData = {
        nama: data.nama,
        no_hp: no_hp,
        alamat: data.alamat || null,
      };

      // Tambahkan role hanya jika ada di current user
      if (currentUser.role) {
        requestData.role = currentUser.role;
      }

      console.log('Update profile request:', {
        url: `${API_BASE}/users/${userId}`,
        data: requestData
      });

      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);

      let json;
      const responseText = await response.text();
      
      try {
        json = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(json.message || `Gagal memperbarui profil (${response.status})`);
      }

      // Update localStorage dengan data yang baru
      if (json.data) {
        const updatedUser = { ...currentUser, ...json.data };
        localStorage.setItem("mn_user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("authChanged"));
      }

      return {
        success: true,
        data: json.data,
        message: json.message || "Profil berhasil diperbarui"
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Check for CORS error
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('CORS')) {
        console.warn('CORS error detected, trying alternative method...');
        return await this.updateProfileAlt(data);
      }
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Alternative update method menggunakan proxy atau different endpoint
   */
  async updateProfileAlt(data) {
    try {
      const token = localStorage.getItem("mn_token");
      const currentUser = this.getCurrentUser();
      
      if (!token || !currentUser) {
        throw new Error("Silakan login terlebih dahulu");
      }

      const userId = currentUser.id_user || currentUser.id;
      
      if (!userId) {
        throw new Error("ID pengguna tidak ditemukan");
      }

      // Coba endpoint berbeda atau method berbeda
      const endpoints = [
        `${API_BASE}/user/${userId}`,  // Coba singular 'user'
        `${API_BASE}/users/${userId}`, // Coba plural 'users'
        `${API_BASE}/profile/update`,  // Coba endpoint umum
      ];

      let lastError;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nama: data.nama,
              no_hp: data.no_hp ? data.no_hp.replace(/[^0-9]/g, "") : null,
              alamat: data.alamat || null,
            }),
          });

          if (response.ok) {
            const json = await response.json();
            
            // Update localStorage
            if (json.data) {
              const updatedUser = { ...currentUser, ...json.data };
              localStorage.setItem("mn_user", JSON.stringify(updatedUser));
              window.dispatchEvent(new Event("authChanged"));
            }

            return {
              success: true,
              data: json.data,
              message: "Profil berhasil diperbarui (alternative method)"
            };
          }
        } catch (error) {
          lastError = error;
          console.log(`Endpoint ${endpoint} failed:`, error.message);
          continue; // Coba endpoint berikutnya
        }
      }
      
      throw lastError || new Error("Semua endpoint gagal");
      
    } catch (error) {
      console.error("Error in updateProfileAlt:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Change password - MENGGUNAKAN PATH /api/auth/change-password
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
   * Format phone number untuk display
   */
  formatPhone(phone) {
    if (!phone) return "-";
    
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, "");
    
    if (cleaned.length >= 10) {
      // Format: 0812-3456-7890
      return cleaned.replace(/(\d{4})(\d{4})(\d{0,4})/, "$1-$2-$3");
    }
    
    return phone;
  }

  /**
   * Format phone number untuk input field (dengan +62)
   */
  formatPhoneForInput(phone) {
    if (!phone) return "";
    
    const cleaned = phone.replace(/\D/g, "");
    
    if (cleaned.startsWith('62')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '62' + cleaned.substring(1);
    } else if (cleaned.length > 0) {
      return '62' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Get user ID from current user
   */
  getUserId() {
    const user = this.getCurrentUser();
    return user?.id_user || user?.id || null;
  }
}

export default new UserService();