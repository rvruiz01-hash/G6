// src/components/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute() {
  const { user, isSessionChecked } = useContext(AuthContext);

  if (!isSessionChecked) {
    return null; // o un spinner de carga
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
