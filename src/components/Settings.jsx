// src/components/Settings.jsx
import { useState, useEffect } from "react";
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
} from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    // Umumiy sozlamalar
    companyName: "Wunderland",
    companyPhone: "+998 90 123 45 67",
    companyAddress: "Chust shahar, O'yin markazi",

    // Narx sozlamalari
    basePrice: 50000,
    hourlyRate: 50000,
    overtimeRate: 10000,

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

  // Sozlamalarni yuklash
  useEffect(() => {
    loadSettings();
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
