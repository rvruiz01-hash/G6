// App.tsx
import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import PublicHome from "./pages/PublicHome";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppRoutes from "./AppRoutes"; // centraliza las rutas del dashboard

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<SignIn />} />

        {/* Rutas del Dashboard */}
        <Route path="/dashboard/*" element={<AppLayout />}>
          <Route path="*" element={<AppRoutes />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
