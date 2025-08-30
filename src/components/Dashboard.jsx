// src/components/Dashboard.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, DollarSign, Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import ScannerListener from "../components/ScannerListener";
import { childrenApi, jetonsApi } from "../lib/api";
import { useReactToPrint } from "react-to-print";

// Jetonlar ro'yxati
const ALLOWED_JETONS = [
  "JET-AB1000-5678",
  "JET-BC1001-1234",
  "JET-CD1002-8765",
  "JET-DE1003-4321",
  "JET-EF1004-3456",
  "JET-FG1005-6543",
  "JET-GH1006-7890",
  "JET-HI1007-0987",
  "JET-IJ1008-2345",
  "JET-JK1009-5432",
  "JET-KL1010-6789",
  "JET-LM1011-9876",
  "JET-MN1012-1357",
  "JET-NO1013-7531",
  "JET-OP1014-2468",
  "JET-PQ1015-8642",
  "JET-QR1016-3579",
  "JET-RS1017-9753",
  "JET-ST1018-4682",
  "JET-TU1019-2864",
  "JET-UV1020-1593",
  "JET-VW1021-3915",
  "JET-WX1022-2604",
  "JET-XY1023-4062",
  "JET-YZ1024-5213",
  "JET-ZA1025-3125",
  "JET-AB1026-6781",
  "JET-BC1027-1876",
  "JET-CD1028-2341",
  "JET-DE1029-1432",
  "JET-EF1030-5674",
  "JET-FG1031-4765",
  "JET-GH1032-7891",
  "JET-HI1033-1987",
  "JET-IJ1034-2453",
  "JET-JK1035-3542",
  "JET-KL1036-6798",
  "JET-LM1037-9867",
  "JET-MN1038-1375",
  "JET-NO1039-7532",
  "JET-OP1040-2469",
  "JET-PQ1041-8643",
  "JET-QR1042-3571",
  "JET-RS1043-9751",
  "JET-ST1044-4683",
  "JET-TU1045-2865",
  "JET-UV1046-1594",
  "JET-VW1047-3916",
  "JET-WX1048-2605",
  "JET-XY1049-4063",
  "JET-YZ1050-5214",
];

export default function Dashboard({ darkMode }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const receiptRef = useRef();
  const itemsPerPage = 10;
  // Sozlamalarni yuklash
  const [settings, setSettings] = useState({
    basePrice: 30000,
    hourlyRate: 30000,
    overtimeRate: 5000,
  });

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("crmSettings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({
            basePrice: parsed.basePrice || 30000,
            hourlyRate: parsed.hourlyRate || 30000,
            overtimeRate: parsed.overtimeRate || 5000,
          });
        }
      } catch (error) {
        console.error("Sozlamalarni yuklashda xatolik:", error);
      }
    };
    loadSettings();
  }, []);

  const baseCost = settings.basePrice;
  const [currentPage, setCurrentPage] = useState(1);
  const [lastCode, setLastCode] = useState("");

  // Qidiruv + filtr
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | inside | done

  // 🔔 Beep
  const [audioEnabled, setAudioEnabled] = useState(false);
  const beepRef = useRef(null);
  const beepedRef = useRef(new Set());

  // Countdownlar
  const [countdowns, setCountdowns] = useState({});

  // Beep audio init
  useEffect(() => {
    const audio = new Audio("/beep.mp3");
    audio.preload = "auto";
    audio.volume = 1.0;
    beepRef.current = audio;
  }, []);

  const enableSound = async () => {
    try {
      if (!beepRef.current) return;
      beepRef.current.currentTime = 0;
      await beepRef.current.play();
      beepRef.current.pause();
      beepRef.current.currentTime = 0;
      setAudioEnabled(true);
    } catch (e) {
      alert("Ovozga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.");
    }
  };

  // Fetch
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const data = await childrenApi.list();
      // Agar data array bo'lmasa, bo'sh array qo'yamiz
      const childrenArray = Array.isArray(data) ? data : [];
      setChildren(childrenArray);
    } catch (err) {
      console.error(err);
      // Xatolik bo'lsa ham bo'sh array qo'yamiz
      setChildren([]);
    }
  };

  // Skan
  const handleScan = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    try {
      setLastCode(cleanCode);

      // Avval jeton bazada bor-yo'qligini tekshirish
      console.log("Jeton tekshirilmoqda:", cleanCode);
      const jetonResult = await jetonsApi.validate(cleanCode);

      if (!jetonResult.valid) {
        alert(
          `❌ Noma'lum jeton!\n\nKod: ${cleanCode}\n\nBu jeton bizning bazamizda mavjud emas.`
        );
        return;
      }

      // Jeton bazada mavjud bo'lsa, sessionga qo'shish
      console.log("Jeton bazada topildi:", jetonResult.jeton);

      const res = await childrenApi.scan(cleanCode);
      await fetchChildren();

      if (res?.action === "checkin") {
        alert(
          `✅ Kirish rasmiylashtirildi!\n\n` +
            `Jeton: ${cleanCode}\n` +
            `Bola: ${jetonResult.jeton.child_name || "Noma'lum"}\n` +
            `Vaqt: 1 soat oldindan`
        );
      } else if (res?.action === "checkout") {
        const r = res.receipt;
        const extra = r?.extra_minutes || 0;
        const total = r?.total?.toLocaleString("uz-UZ") || "";
        alert(
          `✅ Chiqish rasmiylashtirildi!\n\n` +
            `Jeton: ${cleanCode}\n` +
            `Bola: ${jetonResult.jeton.child_name || "Noma'lum"}\n` +
            `Qo'shimcha: ${extra} daqiqa\n` +
            `Jami: ${total} so'm`
        );
      } else {
        alert("Jeton bo'yicha amal bajarilmadi.");
      }
    } catch (e) {
      console.error("Skan xatoligi:", e);
      if (e?.response?.status === 404) {
        alert(
          `❌ Noma'lum jeton!\n\nKod: ${cleanCode}\n\nBu jeton bizning bazamizda mavjud emas.`
        );
      } else {
        alert(
          e?.response?.data?.error ||
            "Jeton bo'yicha amal bajarilmadi. Server logini tekshiring."
        );
      }
    }
  };

  // Pagination va filterlash
  const filteredChildren = useMemo(() => {
    let result = children;

    // Qidiruv filtri - jeton nomi bo'yicha qidirish
    if (q) {
      result = result.filter((child) => {
        const searchText = q.toLowerCase();
        const tokenCode = (child.token_code || "").toLowerCase();
        const qrCode = (child.qr_code || "").toLowerCase();
        const jetonName = (child.jeton_name || "").toLowerCase();
        const id = (child._id || "").toLowerCase();
        
        return tokenCode.includes(searchText) || 
               qrCode.includes(searchText) || 
               jetonName.includes(searchText) ||
               id.includes(searchText);
      });
    }

    // Holat filtri
    if (filter === "inside") {
      result = result.filter((child) => !child.exit_time);
    } else if (filter === "done") {
      result = result.filter((child) => child.exit_time);
    }

    return result;
  }, [children, q, filter]);

  const totalPages = Math.ceil(filteredChildren.length / itemsPerPage) || 1;
  const paginatedChildren = filteredChildren.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Chek va checkout tugmasi faqat setSelectedChild(child) chaqiradi
  const handleCheckClick = (child) => setSelectedChild(child);
  const checkout = async (id) => {
    const child = children.find((c) => c._id === id);
    setSelectedChild(child);
  };

  // Extend funksiyasi qo'shildi
  const extend = async (id, minutes) => {
    try {
      await childrenApi.extend(id, minutes);
      await fetchChildren();
      alert(`${minutes} daqiqa qo'shildi!`);
    } catch (e) {
      alert("Vaqt qo'shishda xatolik!");
    }
  };

  // Printni useEffect orqali chaqiramiz
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "Chek",
    removeAfterPrint: true,
  });

  useEffect(() => {
    if (selectedChild) {
      const timer = setTimeout(() => {
        if (receiptRef.current) {
          handlePrint();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedChild, handlePrint]);

  // Misol uchun children ro'yxatini to'ldirish (real loyihada fetchChildren ishlatilsin)
  useEffect(() => {
    setChildren([
      {
        _id: "892AB6",
        token_code: "4780080520556",
        entry_time: "2025-08-30T05:14:00.020Z",
        exit_time: "",
        paid_amount: settings.basePrice,
      },
      {
        _id: "98b423fc-8fd3-4a0e-ba97-4f106d6caad6",
        token_code: "4780080520557",
        entry_time: "2025-08-30T05:00:00.020Z",
        exit_time: "2025-08-30T06:00:00.020Z",
        paid_amount: settings.basePrice,
      },
    ]);
  }, []);

  const exportToExcel = () => {
    if (!children.length) return;
    const data = children.map((child) => ({
      Token: child.token_code || "-",
      "Sessiya ID": child._id,
      Kirish: child.entry_time
        ? new Date(child.entry_time).toLocaleString()
        : "-",
      Chiqish: child.exit_time
        ? new Date(child.exit_time).toLocaleString()
        : "-",
      "To'lov": child.paid_amount
        ? child.paid_amount.toLocaleString()
        : baseCost.toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sessiyalar");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, `sessiyalar_${new Date().toLocaleDateString()}.xlsx`);
  };

  useEffect(() => {
    const newCountdowns = {};
    children.forEach((child) => {
      if (!child.exit_time && child.entry_time) {
        const entry = new Date(child.entry_time);
        const now = new Date();
        const paidUntil = new Date(entry.getTime() + 60 * 60 * 1000);
        const diffMs = paidUntil - now;
        if (diffMs > 0) {
          const totalMinutes = Math.floor(diffMs / (1000 * 60));
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          const s = Math.floor((diffMs % (1000 * 60)) / 1000);
          newCountdowns[child._id] = `${h} soat ${m} daqiqa ${s} soniya`;
        } else {
          newCountdowns[child._id] = "⏳ Vaqt tugadi!";
        }
      } else {
        newCountdowns[child._id] = "Chiqib ketgan";
      }
    });
    setCountdowns(newCountdowns);
  }, [children]);

  const printRef = useRef();

  const handlePrintJetonlar = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "", "width=600,height=800");
    win.document.write(`
      <html>
        <head>
          <title>Jetonlar ro'yhati</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            ul { font-size: 18px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // Sessiyalarni tozalash funksiyasi
  const clearSessions = async () => {
    if (!window.confirm("Barcha sessiyalarni o'chirishni tasdiqlaysizmi?"))
      return;
    try {
      await childrenApi.clear();
      await fetchChildren();
      alert("Barcha sessiyalar tozalandi!");
    } catch (e) {
      alert("Sessiyalarni tozalashda xatolik!");
    }
  };

  return (
    <div className={`p-6 space-y-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      <ScannerListener onScan={handleScan} />

      {/* Statistik kartalar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`shadow-xl rounded-2xl p-6 flex items-center gap-4 hover:scale-105 transition-transform duration-300 border-t-4 border-blue-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`p-3 rounded-full ${
            darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
          }`}>
            <Users className={`w-8 h-8 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Jami sessiyalar</p>
            <h2 className={`text-3xl font-extrabold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {children.length}
            </h2>
          </div>
        </div>

        <div className={`shadow-xl rounded-2xl p-6 flex items-center gap-4 hover:scale-105 transition-transform duration-300 border-t-4 border-green-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`p-3 rounded-full ${
            darkMode ? 'bg-green-900/50' : 'bg-green-100'
          }`}>
            <Calendar className={`w-8 h-8 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Hozir ichkarida</p>
            <h2 className={`text-3xl font-extrabold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {
                children.filter((c) => !c.exit_time)
                  .length /* Ichkarida qolganlar soni */
              }
            </h2>
          </div>
        </div>

        <div className={`shadow-xl rounded-2xl p-6 flex items-center gap-4 hover:scale-105 transition-transform duration-300 border-t-4 border-purple-500 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`p-3 rounded-full ${
            darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
          }`}>
            <DollarSign className={`w-8 h-8 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Umumiy tushum</p>
            <h2 className={`text-3xl font-extrabold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {children
                .reduce(
                  (sum, c) =>
                    sum +
                    (c.paid_amount
                      ? c.paid_amount
                      : !c.exit_time
                      ? baseCost
                      : 0),
                  0
                )
                .toLocaleString()}
              {" so'm"}
            </h2>
          </div>
        </div>
      </div>

      {/* Jadval + boshqaruvlar */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            👦 Sessiyalar ro'yxati
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-2 rounded-lg border bg-gray-50 text-sm">
              Oxirgi skan: <b>{lastCode || "—"}</b>
            </span>

            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="🔎 Jeton nomi / kodi qidirish"
              className="px-3 py-2 border rounded-lg"
            />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">Hamma</option>
              <option value="inside">Ichkarida</option>
              <option value="done">Tugagan</option>
            </select>

            <button
              onClick={
                audioEnabled ? () => setAudioEnabled(false) : enableSound
              }
              className={`px-3 py-2 rounded-lg text-white shadow transition ${
                audioEnabled
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
              title="2 daqiqa qolganda beep"
            >
              🔔 {audioEnabled ? "Ovoz ON" : "Ovoz OFF"}
            </button>

            <button
              onClick={exportToExcel}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
            >
              📥 Excelga saqlash
            </button>
          </div>
        </div>

        <table className="min-w-full table-auto text-left border-collapse">
          <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700">
            <tr>
              <th className="p-3 text-sm font-semibold">Jeton Nomi</th>
              <th className="p-3 text-sm font-semibold">Kirish</th>
              <th className="p-3 text-sm font-semibold">Chiqish</th>
              <th className="p-3 text-sm font-semibold">To'lov (so'm)</th>
              <th className="p-3 text-sm font-semibold">Amal</th>
            </tr>
          </thead>

          <tbody>
            {paginatedChildren.map((child, idx) => {
              const isOverdue =
                !child.exit_time && countdowns[child._id] === "⏳ Vaqt tugadi!";
              return (
                <tr
                  key={child._id}
                  className={`transition hover:shadow-md ${
                    isOverdue
                      ? "bg-red-50"
                      : idx % 2 === 0
                      ? "bg-gray-50"
                      : "bg-white"
                  }`}
                >
                  <td className="p-3 font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-600">
                        {child.jeton_name || `Jeton ${child.token_code?.slice(-4)}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {child.token_code || child.qr_code || child._id.slice(-8)}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 text-green-600 font-semibold">
                    {child.entry_time
                      ? new Date(child.entry_time).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="p-3 text-red-500 font-semibold">
                    {child.exit_time
                      ? new Date(child.exit_time).toLocaleTimeString()
                      : "🚸 Hali ichkarida"}
                  </td>

                  <td className="p-3 text-center font-medium">
                    {!child.exit_time
                      ? child.paid_amount
                        ? child.paid_amount.toLocaleString()
                        : baseCost.toLocaleString()
                      : child.paid_amount?.toLocaleString() || 0}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {!child.exit_time ? (
                        <>
                          <button
                            onClick={() => extend(child._id, 30)}
                            className="px-2 py-1 text-xs bg-amber-500 text-white rounded"
                            title="30 daqiqa qo'shish"
                          >
                            +30m
                          </button>
                          <button
                            onClick={() => extend(child._id, 60)}
                            className="px-2 py-1 text-xs bg-amber-600 text-white rounded"
                            title="1 soat qo'shish"
                          >
                            +60m
                          </button>
                          <button
                            onClick={() => checkout(child._id)}
                            className="px-2 py-1 text-xs bg-rose-600 text-white rounded"
                            title="Checkout (yakunlash)"
                          >
                            Checkout
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCheckClick(child)}
                            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                            title="Chekni chop etish"
                          >
                            Chek
                          </button>
                          <Link
                            to={`/child/${child.qr_code}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-600 transition text-xs"
                          >
                            Ko'rish
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg border ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 58mm POS Printer uchun chek bloki */}
      <div
        ref={receiptRef}
        className="print-receipt"
        style={{ display: "none" }}
      >
        {selectedChild ? (
          <div
            style={{
              width: "58mm",
              fontFamily: "monospace",
              fontSize: "12px",
              lineHeight: "1.2",
              padding: "2mm",
              margin: "0",
              color: "#000",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                DREAM LAND
              </div>
              <div style={{ fontSize: "10px" }}>Bolalar O'yin Markazi</div>
              <div style={{ fontSize: "10px" }}>Tel: +998 90 123 45 67</div>
              <div
                style={{ borderTop: "1px dashed #000", margin: "5px 0" }}
              ></div>
            </div>

            {/* Session Info */}
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sessiya ID:</span>
                <span>{selectedChild._id.slice(-8).toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Jeton:</span>
                <span>{selectedChild.token_code || selectedChild.qr_code}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Kirish:</span>
                <span>
                  {selectedChild.entry_time
                    ? new Date(selectedChild.entry_time).toLocaleString(
                        "uz-UZ",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "-"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Chiqish:</span>
                <span>
                  {selectedChild.exit_time
                    ? new Date(selectedChild.exit_time).toLocaleString(
                        "uz-UZ",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Davom etmoqda"}
                </span>
              </div>
              <div
                style={{ borderTop: "1px dashed #000", margin: "5px 0" }}
              ></div>
            </div>

            {/* Payment Details */}
            <div style={{ marginBottom: "8px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Baza narxi (1 soat):</span>
                <span>{baseCost.toLocaleString()} so'm</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Qo'shimcha:</span>
                <span>0 so'm</span>
              </div>
              <div
                style={{ borderTop: "1px dashed #000", margin: "5px 0" }}
              ></div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                <span>JAMI:</span>
                <span>
                  {(selectedChild.paid_amount || baseCost).toLocaleString()}{" "}
                  so'm
                </span>
              </div>
              <div
                style={{ borderTop: "1px dashed #000", margin: "5px 0" }}
              ></div>
            </div>

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                lineHeight: "1.3",
              }}
            >
              <div>Chop etildi: {new Date().toLocaleString("uz-UZ")}</div>
              <div style={{ margin: "6px 0", fontWeight: "bold" }}>
                Xaridingiz uchun rahmat!
              </div>
              <div>Bizni tanlaganingiz uchun minnatdormiz</div>
              <div style={{ marginTop: "6px", fontSize: "8px" }}>
                Chekni saqlab qoling!
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
