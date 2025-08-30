// src/components/JetonManagement.jsx
import { useState, useEffect, useRef } from "react";
import { jetonsApi } from "../lib/api.js";
import { useReactToPrint } from "react-to-print";
import JsBarcode from "jsbarcode";
import ScannerListener from "./ScannerListener";

const JetonManagement = () => {
  const [jetons, setJetons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJeton, setEditingJeton] = useState(null);
  const [printJeton, setPrintJeton] = useState(null); // Chek chiqaradigan jeton
  const [scanMode, setScanMode] = useState(false); // Skan rejimi
  const [lastScannedJeton, setLastScannedJeton] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    tariff: "standard", // standard yoki vip
    price: 30000, // default standard narx
    duration: 60, // daqiqa, vip uchun 0
    overtimePrice: 500, // 1 daqiqaga
    isActive: true,
  });

  const receiptRef = useRef();
  const barcodeRef = useRef();

  // Jetonlarni yuklash
  const loadJetons = async () => {
    try {
      setLoading(true);
      const data = await jetonsApi.list();
      setJetons(data);
    } catch (error) {
      console.error("Jetonlarni yuklashda xatolik:", error);
      alert("Jetonlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Barcode yaratish
  const generateBarcode = (code) => {
    if (barcodeRef.current && code) {
      try {
        JsBarcode(barcodeRef.current, code, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 0,
        });
      } catch (error) {
        console.error("Barcode yaratishda xatolik:", error);
      }
    }
  };

  // Avtomatik jeton kodi generatsiya qilish
  const generateJetonCode = () => {
    const prefix = "JET";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  // Jeton skan qilish
  const handleJetonScan = async (code) => {
    // Agar form ochiq bo'lsa, scan qilingan kodni formga qo'yamiz
    if (showForm) {
      setFormData({ ...formData, code: code.trim() });
      return;
    }

    // Aks holda validation qilamiz
    try {
      const result = await jetonsApi.validate(code);
      setLastScannedJeton(result.jeton);

      if (result.valid) {
        alert(
          `✅ JETON YAROQLI!\n\n` +
            `📋 Kod: ${result.jeton.code}\n` +
            `🏷️ Nom: ${result.jeton.name || "Noma'lum"}\n` +
            `📊 Ishlatilgan: ${result.jeton.usageCount} marta\n` +
            `⚡ Status: ${result.jeton.isActive ? "Faol" : "Nofaol"}\n` +
            `📅 Oxirgi ishlatilgan: ${
              result.jeton.lastUsed
                ? new Date(result.jeton.lastUsed).toLocaleString("uz-UZ")
                : "Hech qachon"
            }`
        );
      }

      // Jetonlar ro'yxatini yangilash (usage count yangilangani uchun)
      loadJetons();
    } catch (error) {
      console.error("Jeton skan qilishda xatolik:", error);
      const errorMsg = error.response?.data?.error || error.message;

      // Maxsus xabarlar
      if (error.response?.status === 404) {
        alert(
          `❌ NOMA'LUM JETON!\n\n` +
            `📋 Skan qilingan kod: ${code}\n\n` +
            `⚠️ Bu jeton bizning tizimda mavjud emas.\n` +
            `Faqat bizning o'yin markazining jetonflarini ishlatish mumkin.\n\n` +
            `📞 Yordam uchun: +998 90 123 45 67`
        );
      } else if (error.response?.status === 400) {
        alert(
          `⚠️ JETON NOFAOL!\n\n` +
            `📋 Kod: ${code}\n\n` +
            `Bu jeton nofaol holatda yoki muddati tugagan.\n` +
            `Iltimos, yangi jeton oling yoki administrator bilan bog'laning.`
        );
      } else {
        alert(
          `❌ XATOLIK!\n\n` +
            `Jeton tekshirishda xatolik yuz berdi:\n${errorMsg}\n\n` +
            `Qaytadan urining yoki administrator bilan bog'laning.`
        );
      }

      setLastScannedJeton(null);
    }
  };

  // Chek chiqarish
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: "Jeton Cheki",
    removeAfterPrint: true,
  });

  // Chekni chiqarish uchun useEffect
  useEffect(() => {
    if (printJeton) {
      // Barcode yaratish
      generateBarcode(printJeton.code);

      const timer = setTimeout(() => {
        if (receiptRef.current) {
          handlePrint();
          setPrintJeton(null); // Chekni chop etgandan keyin tozalash
        }
      }, 500); // Barcode yaratilishi uchun biroz kutish
      return () => clearTimeout(timer);
    }
  }, [printJeton, handlePrint]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedJeton;
      if (editingJeton) {
        // Yangilash
        await jetonsApi.update(editingJeton._id, formData);
        savedJeton = { ...editingJeton, ...formData };
      } else {
        // Yangi yaratish
        savedJeton = await jetonsApi.create(formData);
        // Yangi jeton uchun chek chiqarish
        setPrintJeton(savedJeton);
      }

      // Form ni tozalash va yopish
      setFormData({
        code: "",
        name: "",
        tariff: "standard",
        price: 30000,
        duration: 60,
        overtimePrice: 500,
        isActive: true,
      });
      setShowForm(false);
      setEditingJeton(null);

      // Listni yangilash
      loadJetons();
    } catch (error) {
      console.error("Jeton saqlashda xatolik:", error);
      alert(
        "Jeton saqlashda xatolik yuz berdi: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Tahrirlash
  const handleEdit = (jeton) => {
    setEditingJeton(jeton);
    setFormData({
      code: jeton.code,
      name: jeton.name || "",
      isActive: jeton.isActive,
    });
    setShowForm(true);
  };

  // O'chirish
  const handleDelete = async (id) => {
    if (!confirm("Jetonni o'chirishga ishonchingiz komilmi?")) return;

    try {
      await jetonsApi.delete(id);
      loadJetons();
    } catch (error) {
      console.error("Jeton o'chirishda xatolik:", error);
      alert("Jeton o'chirishda xatolik yuz berdi");
    }
  };

  // Status o'zgartirish
  const handleToggleStatus = async (jeton) => {
    try {
      await jetonsApi.update(jeton._id, {
        ...jeton,
        isActive: !jeton.isActive,
      });
      loadJetons();
    } catch (error) {
      console.error("Status o'zgartirishda xatolik:", error);
      alert("Status o'zgartirishda xatolik yuz berdi");
    }
  };

  // Sahifa yuklanganda jetonlarni olish
  useEffect(() => {
    loadJetons();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jeton Boshqaruvi</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setScanMode(!scanMode)}
            className={`px-4 py-2 rounded-md transition-colors ${
              scanMode
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            {scanMode ? "📱 Skan Rejimi (ON)" : "🔍 Jeton Skanini Yoqish"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            {showForm ? "Yopish" : "Yangi Jeton"}
          </button>
        </div>
      </div>

      {/* Skan rejimi haqida ma'lumot */}
      {scanMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-500 text-2xl">�</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Jeton Skan Rejimi Yoqilgan
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  • Bizning tizimda 50 ta yaroqli jeton bor (JET-2025-001 dan
                  JET-2025-050 gacha)
                </p>
                <p>
                  • Jeton kodini skan qiling yoki klaviaturadan kiriting va
                  Enter bosing
                </p>
                <p>
                  • Faqat bizning jetonlarimiz taniladi, boshqa jetonlar rad
                  etiladi
                </p>
                {lastScannedJeton && (
                  <div className="mt-3 p-3 bg-white rounded border border-green-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-green-800">
                          ✅ Oxirgi muvaffaqiyatli skan:
                        </strong>
                        <div className="text-green-600 font-mono text-lg">
                          {lastScannedJeton.code}
                        </div>
                        <div className="text-xs text-green-500">
                          {lastScannedJeton.usageCount} marta ishlatilgan •
                          Oxirgi:{" "}
                          {lastScannedJeton.lastUsed
                            ? new Date(
                                lastScannedJeton.lastUsed
                              ).toLocaleString("uz-UZ")
                            : "Hech qachon"}
                        </div>
                      </div>
                      <div className="text-2xl">✅</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingJeton ? "Jetonni Tahrirlash" : "Yangi Jeton Qo'shish"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jeton Kodi *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masalan: JET-12345678-001"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, code: generateJetonCode() })
                    }
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
                    title="Avtomatik kod yaratish"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jeton Nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jeton 1, Jeton 2, ..."
                />
              </div>

              {/* Tarif tizimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarif *
                </label>
                <select
                  value={formData.tariff}
                  onChange={(e) => {
                    const tariff = e.target.value;
                    setFormData({
                      ...formData,
                      tariff,
                      price: tariff === "vip" ? 50000 : 30000,
                      duration: tariff === "vip" ? 0 : 60,
                      overtimePrice: tariff === "vip" ? 0 : 500,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="standard">
                    Standard (1 soat - 30,000 so'm)
                  </option>
                  <option value="vip">
                    VIP (Cheklanmagan - 50,000 so'm)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Narxi (so'm) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30000"
                  required
                  min="0"
                />
              </div>

              {formData.tariff === "standard" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vaqt limiti (daqiqa) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="60"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qo'shimcha narx (1 daqiqaga) *
                    </label>
                    <input
                      type="number"
                      value={formData.overtimePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtimePrice: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="500"
                      required
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      10 daqiqaga 5000 so'm = 1 daqiqaga 500 so'm
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Faol
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                {editingJeton ? "Yangilash" : "Saqlash"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingJeton(null);
                  setFormData({
                    code: "",
                    name: "",
                    tariff: "standard",
                    price: 30000,
                    duration: 60,
                    overtimePrice: 500,
                    isActive: true,
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jadval */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Jetonlar Ro'yxati ({jetons.length} ta)
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : jetons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Hech qanday jeton topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jeton Nomi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ishlatildi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oxirgi ishlatilgan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yaratildi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jetons.map((jeton) => (
                  <tr key={jeton._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {jeton.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {jeton.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(jeton)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          jeton.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } transition-colors`}
                      >
                        {jeton.isActive ? "Faol" : "Nofaol"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {jeton.usageCount || 0} marta
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {jeton.lastUsed ? (
                        <span className="text-green-600">
                          {new Date(jeton.lastUsed).toLocaleString("uz-UZ")}
                        </span>
                      ) : (
                        <span className="text-gray-400">Hech qachon</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(jeton.createdAt).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setPrintJeton(jeton)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                      >
                        Chek
                      </button>
                      <button
                        onClick={() => handleEdit(jeton)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(jeton._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yashirin chek komponenti */}
      {printJeton && (
        <div style={{ display: "none" }}>
          <div
            ref={receiptRef}
            style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                🎮 Bolalar O'yin Markazi
              </h2>
              <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                Jeton Ma'lumotlari
              </p>
            </div>

            <div
              style={{
                marginBottom: "20px",
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <strong>Jeton Kodi:</strong>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#2563eb",
                    border: "2px solid #2563eb",
                    padding: "10px",
                    textAlign: "center",
                    marginTop: "5px",
                    borderRadius: "5px",
                  }}
                >
                  {printJeton.code}
                </div>
              </div>

              {/* Barcode */}
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <svg ref={barcodeRef} style={{ maxWidth: "100%" }}></svg>
              </div>

              {printJeton.child_name && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Bola Ismi:</strong> {printJeton.child_name}
                </div>
              )}

              {printJeton.parent_phone && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>Ota-ona Tel.:</strong> {printJeton.parent_phone}
                </div>
              )}

              <div style={{ marginBottom: "10px" }}>
                <strong>Status:</strong>{" "}
                {printJeton.isActive ? "Faol" : "Nofaol"}
              </div>

              <div>
                <strong>Yaratildi:</strong> {new Date().toLocaleString("uz-UZ")}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#666",
                marginTop: "20px",
              }}
            >
              <p style={{ margin: "5px 0" }}>📞 Aloqa: +998 90 123 45 67</p>
              <p style={{ margin: "5px 0" }}>
                📍 Manzil: Chust shahar, O'yin markazi
              </p>
              <p style={{ margin: "5px 0" }}>⏰ Ish vaqti: 09:00 - 21:00</p>
              <hr
                style={{
                  margin: "15px 0",
                  border: "none",
                  borderTop: "1px dashed #ccc",
                }}
              />
              <p style={{ margin: "0", fontSize: "10px" }}>
                Chekni saqlang! Jeton yo'qolganda kerak bo'ladi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scanner listener */}
      {scanMode && <ScannerListener onScan={handleJetonScan} />}
    </div>
  );
};

export default JetonManagement;
