// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Asume que tienes un contexto de autenticación

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth(); // Obtiene el estado de autenticación del contexto

  if (!isAuthenticated) {
    // Si no está autenticado, redirige al inicio de sesión
    return <Navigate to="/signin" replace />;
  }

  // Si está autenticado, permite el acceso a las rutas anidadas
  return <Outlet />;
}
