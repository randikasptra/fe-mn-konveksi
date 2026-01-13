// src/services/pesananService.js
const API_BASE = "https://be-mn-konveksi.vercel.app/api";

class PesananService {
    // =========================
    // CUSTOMER
    // =========================

    // CREATE PESANAN
    async createPesanan(payload) {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Silakan login terlebih dahulu");

            const res = await fetch(`${API_BASE}/pesanan`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            return { success: true, data: json.data };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    // GET PESANAN USER
    async getPesananUser() {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/pesanan/me`, {
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

    // SUMMARY DASHBOARD USER
    async getPesananSummaryUser() {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/pesanan/me/summary`, {
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

    // GET DETAIL PESANAN
    async getDetailPesanan(id) {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/pesanan/${id}`, {
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

    // DELETE PESANAN (USER / ADMIN)
    async deletePesanan(id) {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/pesanan/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            return { success: true, message: json.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    // =========================
    // ADMIN
    // =========================

    // GET ALL PESANAN
    async getAllPesanan() {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/pesanan`, {
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

    // UPDATE STATUS PESANAN
    async updateStatusPesanan(id, status_pesanan) {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/pesanan/${id}/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status_pesanan }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            return {
                success: true,
                message: json.message || "Status pesanan diperbarui",
                data: json.data,
            };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    // SUMMARY DASHBOARD ADMIN
    async getPesananSummaryAdmin() {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Unauthorized");

            const res = await fetch(`${API_BASE}/pesanan/admin/summary`, {
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
}

export default new PesananService();
