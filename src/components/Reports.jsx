// src/components/Reports.jsx
import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Filter,
  Eye,
} from "lucide-react";
import { reportsApi, childrenApi } from "../lib/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Reports = () => {
  const [dailyData, setDailyData] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // Ma'lumotlarni yuklash
  const loadReports = async () => {
    try {
      setLoading(true);
      const [dailyReport, childrenData] = await Promise.all([
        reportsApi.daily(),
        childrenApi.list(),
      ]);
      setDailyData(dailyReport);
      setChildren(Array.isArray(childrenData) ? childrenData : []);
    } catch (error) {
      console.error("Hisobotlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Vaqt oralig'ini o'zgartirish
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const today = new Date();

    switch (period) {
      case "today":
        setDateRange({
          startDate: today.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        setDateRange({
          startDate: weekStart.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
        break;
      case "month":
        const monthStart = new Date(today);
        monthStart.setMonth(today.getMonth() - 1);
        setDateRange({
          startDate: monthStart.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
        break;
    }
  };

  // Excel eksport
  const exportToExcel = () => {
    if (!children.length) return;

    const data = children.map((child) => ({
      "Jeton Kodi": child.token_code || child.qr_code,
      "Sessiya ID": child._id,
      "Kirish Vaqti": child.entry_time
        ? new Date(child.entry_time).toLocaleString("uz-UZ")
        : "-",
      "Chiqish Vaqti": child.exit_time
        ? new Date(child.exit_time).toLocaleString("uz-UZ")
        : "Davom etmoqda",
      "Davomiyligi (daqiqa)":
        child.entry_time && child.exit_time
          ? Math.round(
              (new Date(child.exit_time) - new Date(child.entry_time)) /
                (1000 * 60)
            )
          : "-",
      "Tolov (som)": child.paid_amount
        ? child.paid_amount.toLocaleString()
        : "50,000",
      Holati: child.exit_time ? "Yakunlangan" : "Davom etmoqda",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hisobot");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(
      dataBlob,
      `hisobot_${dateRange.startDate}_${dateRange.endDate}.xlsx`
    );
  };

  // Statistikalar
  const stats = {
    totalSessions: children.length,
    activeSessions: children.filter((c) => !c.exit_time).length,
    completedSessions: children.filter((c) => c.exit_time).length,
    totalRevenue: children.reduce(
      (sum, c) => sum + (c.paid_amount || 50000),
      0
    ),
    averageSessionTime:
      children.filter((c) => c.exit_time && c.entry_time).length > 0
        ? children
            .filter((c) => c.exit_time && c.entry_time)
            .reduce(
              (sum, c) =>
                sum + (new Date(c.exit_time) - new Date(c.entry_time)),
              0
            ) /
          children.filter((c) => c.exit_time && c.entry_time).length /
          (1000 * 60)
        : 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1>
          <p className="text-gray-600">Moliyaviy va statistik hisobotlar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={loadReports}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Yangilash
          </button>
        </div>
      </div>

      {/* Vaqt filtri */}
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {[
              { key: "today", label: "Bugun" },
              { key: "week", label: "Hafta" },
              { key: "month", label: "Oy" },
              { key: "custom", label: "Boshqa" },
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => handlePeriodChange(period.key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {selectedPeriod === "custom" && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="px-3 py-1 border rounded text-sm"
              />
              <span>-</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="px-3 py-1 border rounded text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Statistik kartalar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Jami Sessiyalar
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSessions}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Faol Sessiyalar
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeSessions}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yakunlangan</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedSessions}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jami Tushum</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} so'm
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Qo'shimcha statistikalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* O'rtacha sessiya vaqti */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            O'rtacha Ko'rsatkichlar
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">O'rtacha sessiya vaqti</span>
              <span className="font-semibold">
                {Math.round(stats.averageSessionTime)} daqiqa
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">O'rtacha kun daromadi</span>
              <span className="font-semibold">
                {Math.round(stats.totalRevenue / 30).toLocaleString()} so'm
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Sessiya har biri</span>
              <span className="font-semibold">50,000 so'm</span>
            </div>
          </div>
        </div>

        {/* Tezkor amallar */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tezkor Amallar
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded transition-colors">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Kunlik hisobot</div>
                <div className="text-sm text-gray-500">
                  Bugungi kun statistikasi
                </div>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded transition-colors">
              <Filter className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Filtrlar</div>
                <div className="text-sm text-gray-500">Maxsus filtrlash</div>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded transition-colors">
              <Download className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">PDF hisobot</div>
                <div className="text-sm text-gray-500">
                  PDF formatida yuklash
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sessiyalar jadvali */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sessiyalar Tafsiloti
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jeton
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kirish
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chiqish
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Davomiyligi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To'lov
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holati
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children.slice(0, 10).map((child) => (
                <tr key={child._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {child.token_code || child.qr_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {child.entry_time
                      ? new Date(child.entry_time).toLocaleString("uz-UZ", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {child.exit_time
                      ? new Date(child.exit_time).toLocaleString("uz-UZ", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Davom etmoqda"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {child.entry_time && child.exit_time
                      ? `${Math.round(
                          (new Date(child.exit_time) -
                            new Date(child.entry_time)) /
                            (1000 * 60)
                        )} min`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(child.paid_amount || 50000).toLocaleString()} so'm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        child.exit_time
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {child.exit_time ? "Yakunlangan" : "Davom etmoqda"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {children.length > 10 && (
          <div className="px-6 py-4 text-center">
            <p className="text-sm text-gray-500">
              Va yana {children.length - 10} ta sessiya...
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Yuklanmoqda...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
