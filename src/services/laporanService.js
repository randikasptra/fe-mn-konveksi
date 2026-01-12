const API_BASE = "https://be-mn-konveksi.vercel.app/api";

class LaporanService {
    // =====================
    // REQUEST JSON
    // =====================
    async request(url) {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Silakan login admin");

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await response.json();

            if (!response.ok || json.success === false) {
                throw new Error(json.message || "Gagal memuat laporan");
            }

            return {
                success: true,
                data: json.result, // ✅ FIX
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // =====================
    // LAPORAN JSON (TAMPILAN)
    // =====================
    getLaporanPesananJson({ from, to, status }) {
        if (!from || !to) {
            return {
                success: false,
                message: "Tanggal from dan to wajib diisi",
            };
        }

        const query = new URLSearchParams({
            from,
            to,
            ...(status && { status }),
            format: "json",
        }).toString();

        return this.request(
            `${API_BASE}/laporan/pesanan/cetak?${query}`
        );
    }

    // =====================
    // CETAK FILE (PDF / EXCEL)
    // =====================
    async cetakLaporanPesanan({ from, to, status, format }) {
        try {
            const token = localStorage.getItem("mn_token");
            if (!token) throw new Error("Silakan login admin");

            const query = new URLSearchParams({
                from,
                to,
                ...(status && { status }), // 🔥 INI KUNCI
                format, // pdf | excel
            }).toString();

            const response = await fetch(
                `${API_BASE}/laporan/pesanan/cetak?${query}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error("Gagal export laporan");
            }

            const blob = await response.blob();
            return { success: true, data: blob };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }


    // =====================
    // DOWNLOAD HELPER
    // =====================
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

export default new LaporanService();
