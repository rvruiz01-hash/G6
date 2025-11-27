// src/components/Routes.jsx

import { Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Home from "../Pages/Home.jsx";
import Login from "../pages/LoginAntrior(bigote).jsx";
import Postulate from "../Pages/Postulate.jsx";
import PrivateRoute from "./PrivateRoute.jsx";

export default function RoutesComponent() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas privadas protegidas por PrivateRoute */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/consultar-asistencia"
          element={
            <div>
              <h1>Consultar Asistencia</h1>
            </div>
          }
        />
        <Route path="/postulate" element={<Postulate />} />
        <Route
          path="/activar-cuenta"
          element={
            <div>
              <h1>Activar Cuenta</h1>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
