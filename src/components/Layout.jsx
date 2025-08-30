// src/components/Layout.jsx
import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  QrCode,
  Settings,
  Menu,
  X,
  Home,
  Receipt,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

const Layout = ({ onLogout, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location.pathname === "/",
    },
    {
      name: "Jeton Boshqaruvi",
      href: "/jetons",
      icon: QrCode,
      current: location.pathname === "/jetons",
    },
    {
      name: "Sozlamalar",
      href: "/settings", 
      icon: Settings,
      current: location.pathname === "/settings",
    },
    {
      name: "Hisobotlar",
      href: "/reports",
      icon: Receipt,
      current: location.pathname === "/reports",
    },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={closeSidebar}>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white'}
      `}
      >
        <div className={`flex items-center justify-between h-16 px-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className={`ml-2 text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Dream Land
            </span>
          </div>
          <button
            onClick={closeSidebar}
            className={`lg:hidden p-1 rounded-md transition-colors ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3 flex-1">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    item.current
                      ? darkMode
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${
                      item.current
                        ? "text-white"
                        : darkMode
                          ? "text-gray-400 group-hover:text-gray-300"
                          : "text-gray-500 group-hover:text-blue-600"
                    }
                  `}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Yorug' rejim
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Qorong'u rejim
              </>
            )}
          </button>

          {/* User Info */}
          <div className={`rounded-lg p-4 ${
            darkMode ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-indigo-600' : 'bg-blue-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      darkMode ? 'text-white' : 'text-blue-600'
                    }`}>
                      DL
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Admin
                  </p>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Tizim boshqaruvchisi
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`shadow-sm border-b lg:hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-md transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {navigation.find((item) => item.current)?.name || "Dream Land CRM"}
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-auto ${
          darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
