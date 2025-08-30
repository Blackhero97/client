// src/lib/api.js
import axios from "axios";

/* ======================
   Base URL (Vite .env)
   ====================== */
// Agar VITE_API_BASE_URL berilgan bo'lsa (masalan dev/proxy uchun), shuni olamiz.
// Aks holda bir domenli arxitektura uchun "/api" dan foydalanamiz.
const rawBase = import.meta.env?.VITE_API_BASE_URL || "";
const baseURL = rawBase ? `${rawBase.replace(/\/+$/, "")}/api` : "/api";

/* ======================
   Public (no-auth) paths
   ====================== */
// Ushbu yo'llarga Authorization header qo'shmaymiz:
const PUBLIC_PATHS = [
  /^\/children\/scan\//, // GET /children/scan/:token
  // kerak bo'lsa boshqa public endpointlarni ham qo'shing:
  // /^\/auth\/login$/,
];

/* ======================
   Axios instance
   ====================== */
const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: false, // cookie kerak bo'lsa true qiling va CORS ni moslang
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* ======================
   Token helperlar
   ====================== */
export function setAuthToken(token) {
  if (token) localStorage.setItem("token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("token");
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

/* ======================
   REQUEST: Authorization
   ====================== */
api.interceptors.request.use((config) => {
  try {
    // config.url instansiyaga nisbatan bo'ladi — boshida "/" bo'lishini ta'minlaymiz
    const path = (config.url || "").startsWith("/")
      ? config.url
      : `/${config.url || ""}`;

    // Public path bo'lsa — Authorization qo'shmaymiz
    const isPublic = PUBLIC_PATHS.some((re) => re.test(path));

    if (!isPublic) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  } catch {
    return config;
  }
});

/* ======================
   RESPONSE: 401 + retry
   ====================== */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Serverdan javob keldi (4xx/5xx)
    if (error?.response) {
      if (error.response.status === 401) {
        clearAuthToken();
        // ixtiyoriy: sahifaga yo'naltirish
        // window.location.href = "/login";
        alert("Jeton yaroqsiz yoki muddati tugagan. Iltimos, qayta kiring.");
      }
      return Promise.reject(error);
    }

    // Network xato: 2 martagacha retry
    const cfg = error.config || {};
    cfg.__retryCount = (cfg.__retryCount || 0) + 1;
    if (cfg.__retryCount <= 2) {
      const backoff = 400 * cfg.__retryCount; // 400ms, 800ms
      await new Promise((r) => setTimeout(r, backoff));
      return api(cfg);
    }

    return Promise.reject(error);
  }
);

/* ======================
   dataOf helper
   ====================== */
const dataOf = (p) => p.then((r) => r.data);

/* ======================
   Auth API
   ====================== */
export const authApi = {
  // { email, password } -> { token }
  login: (payload) => dataOf(api.post(`/auth/login`, payload)),
  me: () => dataOf(api.get(`/auth/me`)),
  // ixtiyoriy logout helper (faqat frontdagi tokenni tozalaydi)
  logout: async () => {
    clearAuthToken();
    return { ok: true };
  },
};

/* ======================
   Children / Sessions
   ====================== */
export const childrenApi = {
  list: () => dataOf(api.get(`/children`)),
  byQr: (qrToken) =>
    dataOf(api.get(`/children/qr/${encodeURIComponent(qrToken)}`)),
  byCode: (code) =>
    dataOf(api.get(`/children/by-code/${encodeURIComponent(code)}`)),

  // CHECK-IN / CHECK-OUT toggle — public endpoint
  // ❗ Preflight bo'lmasligi uchun maxsus header yubormaymiz.
  //   Keshni chetlash uchun _ts (cache buster) yetarli.
  scan: (qrToken) =>
    dataOf(
      api.get(`/children/scan/${encodeURIComponent(qrToken)}`, {
        params: { _ts: Date.now() }, // cache buster
        // Agar 4xx/5xx ni .then ichida ushlamoqchi bo'lsangiz:
        // validateStatus: (s) => s >= 200 && s < 500,
      })
    ),

  checkout: (id, extraMinutes = 0) =>
    dataOf(api.put(`/children/checkout/${id}`, { extraMinutes })),
  extend: (id, minutes = 60) =>
    dataOf(api.put(`/children/extend/${id}`, { minutes })),
  historyByToken: (qrToken) =>
    dataOf(api.get(`/children/history/${encodeURIComponent(qrToken)}`)),
  reprint: (id) => dataOf(api.post(`/children/${id}/reprint`)),
};

/* ======================
   Reports
   ====================== */
export const reportsApi = {
  daily: () => dataOf(api.get(`/reports/daily`)),
};

/* ======================
   Jetons / Tokens
   ====================== */
export const jetonsApi = {
  // Barcha jetonlarni olish
  list: () => dataOf(api.get(`/jetons`)),
  // Jeton yaratish
  create: (jetonData) => dataOf(api.post(`/jetons`, jetonData)),
  // Jeton yangilash
  update: (id, jetonData) => dataOf(api.put(`/jetons/${id}`, jetonData)),
  // Jeton o'chirish
  delete: (id) => dataOf(api.delete(`/jetons/${id}`)),
  // Bitta jeton olish
  getById: (id) => dataOf(api.get(`/jetons/${id}`)),
  // Jeton kodini validatsiya qilish (barcode scan uchun)
  validate: (code) => dataOf(api.post(`/jetons/validate`, { code })),
};

/* ======================
   System Management
   ====================== */
export const systemApi = {
  // Barcha ma'lumotlarni o'chirish (adminlar uchun)
  clearAllData: () => dataOf(api.delete(`/system/clear-all`)),
  // Children ma'lumotlarini o'chirish
  clearChildren: () => dataOf(api.delete(`/system/clear-children`)),
  // History ma'lumotlarini o'chirish
  clearHistory: () => dataOf(api.delete(`/system/clear-history`)),
  // Jetonlarni o'chirish
  clearJetons: () => dataOf(api.delete(`/system/clear-jetons`)),
  // Database statistikasi
  getStats: () => dataOf(api.get(`/system/stats`)),
};

console.log("API baseURL:", baseURL);
export default api;
