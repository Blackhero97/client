import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "", // masalan: https://server-798u.onrender.com
  // Agar cookie/JWT kerak bo‘lsa: withCredentials: true
});

export default function ChildForm({ onAdded }) {
  const [form, setForm] = useState({
    name: "",
    parent_name: "",
    paid_hours: "",
  });
  const [qrCode, setQrCode] = useState(null);

  // QR kod o'zgarganda avtomatik print qilish
  useEffect(() => {
    if (qrCode) {
      setTimeout(() => {
        window.print();
      }, 500); // 0.5 sekund kutib, print oynasini chaqirish
    }
  }, [qrCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // payloadni tayyorlash: paid_hours bo‘sh bo‘lsa yubormaymiz, bo‘lsa number
    const payload = {
      name: form.name.trim(),
      parent_name: form.parent_name.trim(),
      ...(form.paid_hours !== "" && { paid_hours: Number(form.paid_hours) }),
    };

    try {
      const res = await api.post("/api/children", payload);

      setForm({ name: "", parent_name: "", paid_hours: "" });
      setQrCode(res?.data?.qr_code || null);

      Swal.fire({
        icon: "success",
        title: "✅ Bola qo‘shildi!",
        text: `${res?.data?.name || "Yangi bola"} muvaffaqiyatli qo‘shildi.`,
        timer: 2000,
        showConfirmButton: false,
      });

      onAdded?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Bola qo‘shishda muammo yuz berdi.";
      Swal.fire({
        icon: "error",
        title: "Xatolik!",
        text: msg,
      });
      // console.error(err); // zarurat bo‘lsa log
    }
  };

  const origin =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "";

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        ➕ Yangi bola qo‘shish
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Bola ismi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bola ismi
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Masalan: Ali"
            className="w-full border border-gray-300 rounded-lg shadow-sm p-3 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              hover:border-indigo-400 transition"
            required
          />
        </div>

        {/* Ota-ona ismi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ota-ona ismi
          </label>
          <input
            type="text"
            name="parent_name"
            value={form.parent_name}
            onChange={handleChange}
            placeholder="Masalan: Akmal aka"
            className="w-full border border-gray-300 rounded-lg shadow-sm p-3 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              hover:border-indigo-400 transition"
            required
          />
        </div>

        {/* Oldindan to‘langan soat (ixtiyoriy) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Oldindan to‘langan soat (ixtiyoriy)
          </label>
          <input
            type="number"
            name="paid_hours"
            value={form.paid_hours}
            onChange={handleChange}
            placeholder="Masalan: 2"
            min="0"
            className="w-full border border-gray-300 rounded-lg shadow-sm p-3 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
              hover:border-indigo-400 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold 
            hover:bg-indigo-700 active:scale-[0.98] transition shadow-md"
        >
          Qo‘shish
        </button>
      </form>

      {/* QR Code */}
      {qrCode && (
        <div className="mt-8 p-6 bg-gray-50 border rounded-xl text-center">
          <p className="mb-3 font-medium text-gray-700">
            📱 Ushbu QR code ota-onaga yuboring:
          </p>
          <QRCodeCanvas
            value={`${origin}/child/${qrCode}`}
            size={160}
            className="p-3 bg-white rounded-lg shadow border"
          />
          <p className="text-sm mt-3 text-gray-600 break-all">
            {origin}/child/{qrCode}
          </p>
        </div>
      )}
    </div>
  );
}
