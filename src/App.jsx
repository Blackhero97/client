import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ChildPage from "./components/ChildPage";
import JetonManagement from "./components/JetonManagement";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout bilan o'ralgan routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jetons" element={<JetonManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Layout siz routes */}
        <Route path="/child/:qr_code" element={<ChildPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
