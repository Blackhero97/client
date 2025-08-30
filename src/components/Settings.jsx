// src/components/Settings.jsx
import { useState, useEffect } from "react";
import { systemApi } from "../lib/api.js";
import Swal from "sweetalert2";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Bell,
  DollarSign,
  Clock,
  Users,
  Database,
  Shield,
  Printer,
  Wifi,
  Monitor,
  Volume2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

const Settings = ({ onLogout, darkMode }) => {
  const [settings, setSettings] = useState({
    // Umumiy sozlamalar
    companyName: "Dream Land",
    companyPhone: "+998 90 123 45 67",
    companyAddress: "Chust shahar, O'yin markazi",

    // Narx sozlamalari
    basePrice: 30000, // 30,000 so'm
    hourlyRate: 30000,
    overtimeRate: 5000, // 10 daqiqaga 5000, ya'ni 1 daqiqaga 500

    // Vaqt sozlamalari
    defaultSessionTime: 60, // daqiqada
    warningTime: 10, // tugashdan necha daqiqa oldin ogohlantirish
    graceTime: 5, // qo'shimcha vaqt (daqiqada)

    // Audio sozlamalar
    soundEnabled: true,
    warningSound: true,
    volume: 80,

    // Printer sozlamalar
    printerEnabled: true,
    printerWidth: "58mm",
    autoPrint: false,

    // Sistema sozlamalari
    autoBackup: true,
    backupInterval: 24, // soatda
    logLevel: "info",

    // Xavfsizlik
    sessionTimeout: 30, // daqiqada
    maxAttempts: 5,
    lockoutTime: 15, // daqiqada
  });

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Server Management state
  const [serverStats, setServerStats] = useState(null);
  const [clearing, setClearing] = useState(false);
  
  // Login Settings state
  const [loginSettings, setLoginSettings] = useState({
    username: "dream",
    password: "20250830",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Sozlamalarni yuklash
  useEffect(() => {
    loadSettings();
    loadLoginSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("crmSettings");
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Sozlamalarni yuklashda xatolik:", error);
    }
  };

  const loadLoginSettings = () => {
    try {
      const savedLogin = localStorage.getItem("loginSettings");
      if (savedLogin) {
        setLoginSettings(JSON.parse(savedLogin));
      }
    } catch (error) {
      console.error("Login sozlamalarini yuklashda xatolik:", error);
    }
  };

  const saveLoginSettings = () => {
    try {
      localStorage.setItem("loginSettings", JSON.stringify(loginSettings));
      alert("Login ma'lumotlari saqlandi. Keyingi kirishda yangi ma'lumotlar ishlatiladi.");
    } catch (error) {
      console.error("Login sozlamalarini saqlashda xatolik:", error);
      alert("Login sozlamalarini saqlashda xatolik yuz berdi");
    }
  };

  // Sozlamalarni saqlash
  const saveSettings = async () => {
    try {
      setSaving(true);
      localStorage.setItem("crmSettings", JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Sozlamalarni saqlashda xatolik:", error);
      alert("Sozlamalarni saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  // Sozlamalarni qayta tiklash
  const resetSettings = () => {
    if (
      confirm(
        "Hamma sozlamalarni dastlabki holatga qaytarishni tasdiqlaysizmi?"
      )
    ) {
      localStorage.removeItem("crmSettings");
      window.location.reload();
    }
  };

  // Server Management funksiyalari
  const loadServerStats = async () => {
    try {
      const stats = await systemApi.getStats();
      setServerStats(stats);
    } catch (error) {
      console.error("Server statistikasini yuklashda xatolik:", error);
    }
  };

  const clearServerData = async (type) => {
    const confirmMessages = {
      'all': 'Barcha ma\'lumotlarni o\'chirishni tasdiqlaysizmi? Bu amal QAYTARIB BO\'LMAYDI!',
      'children': 'Children ma\'lumotlarini o\'chirishni tasdiqlaysizmi?',
      'history': 'History ma\'lumotlarini o\'chirishni tasdiqlaysizmi?', 
      'jetons': 'Barcha jetonlarni o\'chirishni tasdiqlaysizmi?'
    };

    const titles = {
      'all': 'Barcha ma\'lumotlarni o\'chirish',
      'children': 'Bolalar ma\'lumotlarini o\'chirish',
      'history': 'Tarix ma\'lumotlarini o\'chirish',
      'jetons': 'Jetonlar ma\'lumotlarini o\'chirish'
    };

    const result = await Swal.fire({
      title: titles[type],
      text: confirmMessages[type],
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ha, o\'chir',
      cancelButtonText: 'Bekor qilish',
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#f9fafb' : '#111827',
    });

    if (!result.isConfirmed) return;

    try {
      setClearing(true);
      let apiResult;
      
      switch (type) {
        case 'all':
          apiResult = await systemApi.clearAllData();
          break;
        case 'children':
          apiResult = await systemApi.clearChildren();
          break;
        case 'history':
          apiResult = await systemApi.clearHistory();
          break;
        case 'jetons':
          apiResult = await systemApi.clearJetons();
          break;
      }

      Swal.fire({
        title: 'Muvaffaqiyatli!',
        text: apiResult.message,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#f9fafb' : '#111827',
      });
      
      loadServerStats(); // Statistikani yangilash
    } catch (error) {
      console.error("Ma'lumotlarni o'chirishda xatolik:", error);
      Swal.fire({
        title: 'Xatolik!',
        text: "Ma'lumotlarni o'chirishda xatolik yuz berdi",
        icon: 'error',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#f9fafb' : '#111827',
      });
    } finally {
      setClearing(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const tabs = [
    { id: "general", name: "Umumiy", icon: SettingsIcon },
    { id: "pricing", name: "Narxlar", icon: DollarSign },
    { id: "time", name: "Vaqt", icon: Clock },
    { id: "audio", name: "Audio", icon: Volume2 },
    { id: "printer", name: "Printer", icon: Printer },
    { id: "system", name: "Sistema", icon: Database },
    { id: "server", name: "Server", icon: RefreshCw },
    { id: "security", name: "Xavfsizlik", icon: Shield },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
          <p className="text-gray-600">Sistema sozlamalarini boshqaring</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetSettings}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Qayta tiklash
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saqlanmoqda..." : saved ? "Saqlandi!" : "Saqlash"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Umumiy sozlamalar */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Umumiy Sozlamalar
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kompaniya nomi
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) =>
                        handleChange("companyName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon raqami
                    </label>
                    <input
                      type="text"
                      value={settings.companyPhone}
                      onChange={(e) =>
                        handleChange("companyPhone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manzil
                    </label>
                    <input
                      type="text"
                      value={settings.companyAddress}
                      onChange={(e) =>
                        handleChange("companyAddress", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Narx sozlamalari */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Narx Sozlamalari
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asosiy narx (1 soat)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.basePrice}
                        onChange={(e) =>
                          handleChange("basePrice", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        so'm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soatlik tarif
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.hourlyRate}
                        onChange={(e) =>
                          handleChange("hourlyRate", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        so'm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qo'shimcha vaqt narxi (daqiqada)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.overtimeRate}
                        onChange={(e) =>
                          handleChange("overtimeRate", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        so'm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vaqt sozlamalari */}
            {activeTab === "time" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Vaqt Sozlamalari
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standart sessiya vaqti
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.defaultSessionTime}
                        onChange={(e) =>
                          handleChange(
                            "defaultSessionTime",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        daq
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ogohlantirish vaqti
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.warningTime}
                        onChange={(e) =>
                          handleChange("warningTime", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        daq
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qo'shimcha imkoniyat vaqti
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.graceTime}
                        onChange={(e) =>
                          handleChange("graceTime", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        daq
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audio sozlamalar */}
            {activeTab === "audio" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Audio Sozlamalari
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Ovoz yoqilgan
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tizim tovushlarini yoqish/o'chirish
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) =>
                          handleChange("soundEnabled", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Ogohlantirish ovozi
                      </h3>
                      <p className="text-sm text-gray-500">
                        Vaqt tugayotganda ovoz chiqarish
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.warningSound}
                        onChange={(e) =>
                          handleChange("warningSound", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ovoz balandligi: {settings.volume}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.volume}
                      onChange={(e) =>
                        handleChange("volume", parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Printer sozlamalar */}
            {activeTab === "printer" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Printer Sozlamalari
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Printer yoqilgan
                      </h3>
                      <p className="text-sm text-gray-500">
                        Chek chop etish imkoniyati
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.printerEnabled}
                        onChange={(e) =>
                          handleChange("printerEnabled", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Printer kengligi
                    </label>
                    <select
                      value={settings.printerWidth}
                      onChange={(e) =>
                        handleChange("printerWidth", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="58mm">58mm (POS printer)</option>
                      <option value="80mm">80mm (POS printer)</option>
                      <option value="A4">A4 (Oddiy printer)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Avtomatik chop etish
                      </h3>
                      <p className="text-sm text-gray-500">
                        Sessiya tugagach avtomatik chek chiqarish
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoPrint}
                        onChange={(e) =>
                          handleChange("autoPrint", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sistema sozlamalar */}
            {activeTab === "system" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sistema Sozlamalari
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Avtomatik zaxiralash
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ma'lumotlarni avtomatik saqlash
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) =>
                          handleChange("autoBackup", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zaxiralash oralig'i
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.backupInterval}
                        onChange={(e) =>
                          handleChange(
                            "backupInterval",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        soat
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Log darajasi
                    </label>
                    <select
                      value={settings.logLevel}
                      onChange={(e) => handleChange("logLevel", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Server Management */}
            {activeTab === "server" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Server Boshqaruvi
                  </h2>
                  <button
                    onClick={loadServerStats}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Yangilash
                  </button>
                </div>

                {/* Server Statistikasi */}
                {serverStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {serverStats.children}
                      </div>
                      <div className="text-sm text-gray-600">Children</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {serverStats.activeChildren}
                      </div>
                      <div className="text-sm text-gray-600">Ichkarida</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {serverStats.history}
                      </div>
                      <div className="text-sm text-gray-600">History</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {serverStats.jetons}
                      </div>
                      <div className="text-sm text-gray-600">Jetonlar</div>
                    </div>
                  </div>
                )}

                {/* Server Tozalash Tugmalari */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">
                    ⚠️ Xavfli Amallar
                  </h3>
                  <p className="text-red-700 text-sm mb-4">
                    Quyidagi amallar qaytarib bo'lmaydi. Ehtiyot bilan ishlating!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => clearServerData('children')}
                      disabled={clearing}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-md transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Children Tozalash
                    </button>
                    
                    <button
                      onClick={() => clearServerData('history')}
                      disabled={clearing}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      History Tozalash
                    </button>
                    
                    <button
                      onClick={() => clearServerData('jetons')}
                      disabled={clearing}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-md transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      Jetonlar Tozalash
                    </button>
                    
                    <button
                      onClick={() => clearServerData('all')}
                      disabled={clearing}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-md transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {clearing ? "Tozalanmoqda..." : "BARCHASI"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Xavfsizlik sozlamalar */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Xavfsizlik Sozlamalari
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sessiya tugash vaqti
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          handleChange(
                            "sessionTimeout",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        daq
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimal urinishlar soni
                    </label>
                    <input
                      type="number"
                      value={settings.maxAttempts}
                      onChange={(e) =>
                        handleChange("maxAttempts", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bloklanish vaqti
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.lockoutTime}
                        onChange={(e) =>
                          handleChange("lockoutTime", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        daq
                      </span>
                    </div>
                  </div>
                </div>

                {/* Login Settings */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                    🔐 Login Ma'lumotlari
                  </h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    Tizimga kirish uchun foydalanuvchi nomi va parolni o'zgartiring
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foydalanuvchi nomi
                      </label>
                      <input
                        type="text"
                        value={loginSettings.username}
                        onChange={(e) =>
                          setLoginSettings({
                            ...loginSettings,
                            username: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Login nomi"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parol
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginSettings.password}
                          onChange={(e) =>
                            setLoginSettings({
                              ...loginSettings,
                              password: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Yangi parol"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={saveLoginSettings}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Login Ma'lumotlarini Saqlash
                    </button>
                    
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                    >
                      Tizimdan Chiqish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
