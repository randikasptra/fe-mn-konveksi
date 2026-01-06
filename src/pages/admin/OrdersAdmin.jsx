import React, { useEffect, useState } from "react";
import {
  MdInventory,
  MdPendingActions,
  MdHourglassBottom,
  MdFactory,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

/* ================= STATUS CONFIG ================= */
const STATUS_META = {
  DIBUAT: {
    label: "Menunggu Konfirmasi",
    color: "bg-gray-100 text-gray-700",
    icon: <MdInventory />,
  },
  MENUNGGU_DP: {
    label: "Menunggu DP",
    color: "bg-yellow-100 text-yellow-700",
    icon: <MdPendingActions />,
  },
  MENUNGGU_PELUNASAN: {
    label: "Menunggu Pelunasan",
    color: "bg-orange-100 text-orange-700",
    icon: <MdHourglassBottom />,
  },
  DIPROSES: {
    label: "Sedang Diproduksi",
    color: "bg-blue-100 text-blue-700",
    icon: <MdFactory />,
  },
  SELESAI: {
    label: "Selesai",
    color: "bg-green-100 text-green-700",
    icon: <MdCheckCircle />,
  },
  PENDING_PAYMENT: {
    label: "Pembayaran Diproses",
    color: "bg-orange-100 text-orange-700",
    icon: <MdHourglassBottom />,
  },
};

/* ================= STATUS BADGE ================= */
function StatusBadge({ status }) {
  const s = STATUS_META[status];
  if (!s) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${s.color}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

/* ================= MAIN ================= */
export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function loadOrders() {
    const token = localStorage.getItem("mn_token");
    const res = await fetch(`${API_BASE}/pesanan`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();

    if (res.ok) {
      const data = json.data || [];
      setOrders(data);

      // 🔁 SINKRONKAN SELECTED (INI KUNCI UTAMANYA)
      if (selected) {
        const updated = data.find(
          (o) => o.id_pesanan === selected.id_pesanan
        );
        if (updated) setSelected(updated);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    const i = setInterval(loadOrders, 5000);
    return () => clearInterval(i);
  }, []);

  function hasPendingPayment(order) {
    return order.transaksi?.some(
      (t) => t.midtrans_status === "pending"
    );
  }

  async function updateStatus(order, status) {
    try {
      setUpdating(true);
      const token = localStorage.getItem("mn_token");
      await fetch(`${API_BASE}/pesanan/${order.id_pesanan}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status_pesanan: status }),
      });
      setSelected(null);
      loadOrders();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Manajemen Pesanan
        </h2>
        <p className="text-sm text-gray-500">
          Status pesanan & pembayaran diperbarui otomatis
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 text-left">Produk</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="py-12 text-center text-gray-400">
                  Memuat pesanan...
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const pending = hasPendingPayment(o);
                const status = pending
                  ? "PENDING_PAYMENT"
                  : o.status_pesanan;

                return (
                  <tr
                    key={o.id_pesanan}
                    onClick={() => setSelected(o)}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            o.produk?.foto ||
                            "https://via.placeholder.com/60"
                          }
                          className="w-14 h-14 rounded-xl object-cover border"
                        />
                        <div>
                          <div className="font-medium">
                            {o.produk?.nama_produk}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID #{o.id_pesanan}
                          </div>

                          {pending && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                              <MdErrorOutline />
                              Pembayaran sedang diproses
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {o.qty}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL */}
      {selected && (
        <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex gap-4">
            <img
              src={
                selected.produk?.foto ||
                "https://via.placeholder.com/96"
              }
              className="w-24 h-24 rounded-xl object-cover border"
            />
            <div>
              <h3 className="font-semibold text-lg">
                {selected.produk?.nama_produk}
              </h3>
              <p className="text-sm text-gray-500">
                Qty: {selected.qty}
              </p>
              <div className="mt-2">
                <StatusBadge
                  status={
                    hasPendingPayment(selected)
                      ? "PENDING_PAYMENT"
                      : selected.status_pesanan
                  }
                />
              </div>
            </div>
          </div>

          {/* ACTION */}
          {!hasPendingPayment(selected) && (
            <div className="flex gap-3">
              {selected.status_pesanan === "DIBUAT" && (
                <PrimaryButton
                  loading={updating}
                  onClick={() =>
                    updateStatus(selected, "MENUNGGU_DP")
                  }
                >
                  Setujui & Minta DP
                </PrimaryButton>
              )}

              {selected.status_pesanan ===
                "MENUNGGU_PELUNASAN" && (
                <PrimaryButton
                  loading={updating}
                  onClick={() =>
                    updateStatus(selected, "DIPROSES")
                  }
                >
                  Mulai Produksi
                </PrimaryButton>
              )}

              {selected.status_pesanan === "DIPROSES" && (
                <PrimaryButton
                  loading={updating}
                  onClick={() =>
                    updateStatus(selected, "SELESAI")
                  }
                >
                  Tandai Selesai
                </PrimaryButton>
              )}
            </div>
          )}

          {hasPendingPayment(selected) && (
            <div className="text-sm text-orange-600 flex items-center gap-1">
              <MdHourglassBottom />
              Menunggu pembayaran user selesai
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= BUTTON ================= */
function PrimaryButton({ children, onClick, loading }) {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className="
        px-5 py-2.5 rounded-xl
        bg-gray-900 text-white text-sm
        hover:bg-gray-800
        disabled:opacity-50
      "
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}
