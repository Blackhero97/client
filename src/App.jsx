import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ChildPage from "./components/ChildPage";
import JetonManagement from "./components/JetonManagement";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Swal from "sweetalert2";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode holatini yuklash
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Authentication holatini tekshirish
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const authStatus = localStorage.getItem("isAuthenticated");
      const loginTime = localStorage.getItem("loginTime");
      
      if (authStatus === "true" && loginTime) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const sessionTimeout = 8 * 60 * 60 * 1000; // 8 soat
        
        if (now - loginTimestamp < sessionTimeout) {
          setIsAuthenticated(true);
        } else {
          // Session tugagan
          logout();
        }
      }
    } catch (error) {
      console.error("Authentication tekshirishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (success) => {
    setIsAuthenticated(success);
  };

  const logout = async () => {
    const result = await Swal.fire({
      title: 'Chiqishni tasdiqlang',
      text: "Haqiqatan ham tizimdan chiqmoqchimisiz?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ha, chiqish',
      cancelButtonText: 'Bekor qilish',
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#f9fafb' : '#111827',
    });

    if (result.isConfirmed) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("loginTime");
      setIsAuthenticated(false);
      
      Swal.fire({
        title: 'Chiqildi!',
        text: 'Tizimdan muvaffaqiyatli chiqildi',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#f9fafb' : '#111827',
      });
    }
  };

  // Loading holatida
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Agar authenticate bo'lmagan bo'lsa, login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  // Authenticate bo'lgan foydalanuvchilar uchun main app
  return (
    <div className={darkMode ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          {/* Layout bilan o'ralgan routes */}
          <Route path="/" element={<Layout onLogout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
            <Route index element={<Dashboard darkMode={darkMode} />} />
            <Route path="jetons" element={<JetonManagement darkMode={darkMode} />} />
            <Route path="settings" element={<Settings onLogout={logout} darkMode={darkMode} />} />
            <Route path="reports" element={<Reports darkMode={darkMode} />} />
          </Route>

          {/* Layout siz routes */}
          <Route path="/child/:qr_code" element={<ChildPage darkMode={darkMode} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
