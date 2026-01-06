import React, { useEffect, useState } from "react";
import {
  MdPayment,
  MdCheckCircle,
  MdFactory,
  MdInfoOutline,
  MdHourglassBottom,
} from "react-icons/md";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

/* ================= UTIL ================= */
const formatIDR = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(v || 0);

function getJenisPembayaran(status) {
  if (status === "MENUNGGU_DP") return "DP";
  if (status === "MENUNGGU_PELUNASAN") return "PELUNASAN";
  return null;
}

function getPendingTransaksi(order) {
  return order.transaksi?.find(
    (t) => t.midtrans_status === "pending"
  );
}

/* ================= STATUS BADGE ================= */
function StatusBadge({ status }) {
  const map = {
    DIBUAT: "bg-gray-100 text-gray-700",
    MENUNGGU_DP: "bg-yellow-100 text-yellow-700",
    MENUNGGU_PELUNASAN: "bg-orange-100 text-orange-700",
    DIPROSES: "bg-blue-100 text-blue-700",
    SELESAI: "bg-green-100 text-green-700",
    PENDING_PAYMENT: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

/* ================= INFO BOX ================= */
function InfoBox({ color, children }) {
  const map = {
    gray: "bg-gray-50 text-gray-600",
    yellow: "bg-yellow-50 text-yellow-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div
      className={`flex items-start gap-2 text-xs px-3 py-3 rounded-lg ${map[color]}`}
    >
      <MdInfoOutline className="mt-0.5" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

/* ================= INFO PEMBAYARAN ================= */
function InfoPembayaran({ order }) {
  const pending = getPendingTransaksi(order);

  // 🔴 PRIORITAS: PEMBAYARAN PENDING
  if (pending) {
    return (
      <InfoBox color="orange">
        <div className="flex items-center gap-1 font-medium">
          <MdHourglassBottom />
          Pembayaran tertunda
        </div>
        <div>
          Produk: <b>{order.produk?.nama_produk}</b>
        </div>
        <div>Qty: {order.qty}</div>
        <div>
          Nominal: <b>{formatIDR(pending.jumlah)}</b>
        </div>
        <div className="text-[11px]">
          Klik <b>Lanjutkan Pembayaran</b> untuk menyelesaikan
        </div>
      </InfoBox>
    );
  }

  if (order.status_pesanan === "DIBUAT") {
    return (
      <InfoBox color="gray">
        Menunggu konfirmasi admin
      </InfoBox>
    );
  }

  if (order.status_pesanan === "MENUNGGU_DP") {
    return (
      <InfoBox color="yellow">
        <div>DP 50%</div>
        <div>
          <b>{formatIDR(order.dp_wajib)}</b>
        </div>
        <div className="text-[11px]">
          Total {formatIDR(order.total_harga)}
        </div>
      </InfoBox>
    );
  }

  if (order.status_pesanan === "MENUNGGU_PELUNASAN") {
    return (
      <InfoBox color="orange">
        <div>Pelunasan</div>
        <div>
          <b>
            {formatIDR(
              order.total_harga - order.dp_wajib
            )}
          </b>
        </div>
        <div className="text-[11px]">
          Total {formatIDR(order.total_harga)}
        </div>
      </InfoBox>
    );
  }

  if (order.status_pesanan === "DIPROSES") {
    return (
      <InfoBox color="blue">
        <MdFactory /> Sedang diproduksi
      </InfoBox>
    );
  }

  if (order.status_pesanan === "SELESAI") {
    return (
      <InfoBox color="green">
        <MdCheckCircle /> Selesai & lunas
      </InfoBox>
    );
  }

  return null;
}

/* ================= MAIN ================= */
export default function PesananSaya() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  async function loadOrders() {
    const token = localStorage.getItem("mn_token");
    const res = await fetch(`${API_BASE}/pesanan/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) setOrders(json.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    const i = setInterval(loadOrders, 5000);
    return () => clearInterval(i);
  }, []);

  /* ================= SNAP HANDLER ================= */
  function openSnap(snapToken) {
    window.snap.pay(snapToken, {
      onSuccess: function () {
        // 🎉 animasi sukses midtrans tampil
        // ❌ tidak redirect ke example.com
        // ✅ popup otomatis tertutup
        loadOrders();
      },
      onPending: function () {
        // tetap pending
      },
      onError: function (result) {
        console.error("Midtrans error:", result);
        alert("Pembayaran gagal, silakan coba lagi");
      },
      onClose: function () {
        // user menutup popup
      },
    });
  }

  /* ================= HANDLE PAYMENT ================= */
  async function handlePay(order) {
    const pending = getPendingTransaksi(order);

    // ✅ RESUME PEMBAYARAN
    if (pending?.snap_token) {
      openSnap(pending.snap_token);
      return;
    }

    // ❌ pending tapi token hilang
    if (pending && !pending.snap_token) {
      alert(
        "Pembayaran sebelumnya masih diproses.\nSilakan hubungi admin."
      );
      return;
    }

    // ⛔ CREATE BARU HANYA JIKA AMAN
    const jenis = getJenisPembayaran(order.status_pesanan);
    if (!jenis) return;

    try {
      setProcessingId(order.id_pesanan);

      const token = localStorage.getItem("mn_token");
      const res = await fetch(`${API_BASE}/transaksi/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_pesanan: order.id_pesanan,
          jenis_pembayaran: jenis,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      openSnap(json.data.snap_token);
    } catch (err) {
      console.error(err);
      await loadOrders();
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">
        Memuat pesanan...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Pesanan Saya</h1>

      {orders.map((o) => {
        const pending = getPendingTransaksi(o);
        const canPay =
          pending || getJenisPembayaran(o.status_pesanan);

        return (
          <div
            key={o.id_pesanan}
            className="bg-white border rounded-2xl p-6 shadow-sm space-y-4"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-lg">
                  {o.produk?.nama_produk}
                </div>
                <div className="text-sm text-gray-500">
                  Qty: {o.qty}
                </div>
              </div>

              <StatusBadge
                status={
                  pending
                    ? "PENDING_PAYMENT"
                    : o.status_pesanan
                }
              />
            </div>

            {/* INFO */}
            <InfoPembayaran order={o} />

            {/* ACTION */}
            {canPay && (
              <div className="flex justify-end">
                <button
                  disabled={processingId === o.id_pesanan}
                  onClick={() => handlePay(o)}
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2 text-sm
                    rounded-full bg-black text-white
                    disabled:opacity-50
                  "
                >
                  <MdPayment />
                  {pending
                    ? "Lanjutkan Pembayaran"
                    : getJenisPembayaran(o.status_pesanan) ===
                      "DP"
                    ? "Bayar DP"
                    : "Bayar Pelunasan"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
