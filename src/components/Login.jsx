// src/components/Login.jsx
import { useState, useEffect } from "react";
import { Lock, User, Eye, EyeOff, Moon, Sun } from "lucide-react";

const Login = ({ onLogin, darkMode, toggleDarkMode }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Default login ma'lumotlari
  const [defaultLogin, setDefaultLogin] = useState({
    username: "dream",
    password: "20250830",
  });

  // Component yuklanganda login ma'lumotlarini olish
  useEffect(() => {
    try {
      const savedLogin = localStorage.getItem("loginSettings");
      if (savedLogin) {
        setDefaultLogin(JSON.parse(savedLogin));
      }
    } catch (error) {
      console.error("Login ma'lumotlarini yuklashda xatolik:", error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simple frontend authentication
      if (
        credentials.username === defaultLogin.username &&
        credentials.password === defaultLogin.password
      ) {
        // Login muvaffaqiyatli
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("loginTime", Date.now().toString());
        onLogin(true);
      } else {
        setError("Login yoki parol noto'g'ri");
      }
    } catch (err) {
      setError("Login jarayonida xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
    if (error) setError("");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900"
          : "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600"
      }`}
    >
      <div
        className={`rounded-xl shadow-2xl p-8 w-full max-w-md ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
      >
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              darkMode
                ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}
          >
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1
            className={`text-2xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Dream Land CRM
          </h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Tizimga kirish uchun login qiling
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`border px-4 py-3 rounded-lg mb-6 ${
              darkMode
                ? "bg-red-900/50 border-red-800 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Foydalanuvchi nomi
            </label>
            <div className="relative">
              <User
                className={`absolute left-3 top-3 w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-transparent"
                }`}
                placeholder="Login kiriting"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Parol
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-3 w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-transparent"
                }`}
                placeholder="Parolni kiriting"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-3 transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg transition-all font-medium ${
              darkMode
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-400 text-white'
            }`}
          >
            {loading ? "Kirish..." : "Tizimga Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
