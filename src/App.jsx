import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ChildPage from "./components/ChildPage";
import JetonManagement from "./components/JetonManagement";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTime");
    setIsAuthenticated(false);
  };

  // Loading holatida
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Agar authenticate bo'lmagan bo'lsa, login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Authenticate bo'lgan foydalanuvchilar uchun main app
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout bilan o'ralgan routes */}
        <Route path="/" element={<Layout onLogout={logout} />}>
          <Route index element={<Dashboard />} />
          <Route path="jetons" element={<JetonManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings onLogout={logout} />} />
        </Route>

        {/* Layout siz routes */}
        <Route path="/child/:qr_code" element={<ChildPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
