// src/components/Login.jsx
import { useState, useEffect } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";

const Login = ({ onLogin }) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dream Land CRM
          </h1>
          <p className="text-gray-600">Tizimga kirish uchun login qiling</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foydalanuvchi nomi
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Login kiriting"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parol
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Parolni kiriting"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-md transition-colors font-medium"
          >
            {loading ? "Kirish..." : "Tizimga Kirish"}
          </button>
        </form>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 text-center">
            <strong>Joriy login ma'lumotlar:</strong>
            <br />
            Login:{" "}
            <code className="bg-gray-200 px-1 rounded">
              {defaultLogin.username}
            </code>
            <br />
            Parol:{" "}
            <code className="bg-gray-200 px-1 rounded">
              {defaultLogin.password}
            </code>
            <br />
            <span className="text-xs text-gray-500 mt-2 block">
              Sozlamalar bo'limidan o'zgartirishingiz mumkin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
