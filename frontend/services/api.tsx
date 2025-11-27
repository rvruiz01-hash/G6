// src/services/api.js
import axios from "axios";
// Usamos un canal simple para evitar múltiples redirecciones
let isHandlingSessionExpired = false;

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`,
  withCredentials: true, // <--- ESTO ES CRUCIAL PARA ENVIAR LAS COOKIES
  headers: {
    Accept: "application/json",
  },
});

// AÑADE UN INTERCEPTOR PARA EL RESPONSE
api.interceptors.response.use(
  (response) => {
    const expiresAtHeader = response.headers["x-token-expires-at"];
    if (expiresAtHeader) {
      window.dispatchEvent(
        new CustomEvent("token-expires-at", { detail: Number(expiresAtHeader) })
      );
    }
    return response;
  },
  (error) => {
    const isSessionError =
      error.response?.status === 401 &&
      !error.config?.url?.endsWith("/auth/logout") &&
      !error.config?.url?.endsWith("/auth/refresh") &&
      !error.config?.ignoreSessionExpired; // <-- AÑADE ESTA LÍNEA CLAVE

    if (isSessionError && !isHandlingSessionExpired) {
      isHandlingSessionExpired = true;
      window.dispatchEvent(new Event("session-expired"));
    }

    return Promise.reject(error);
  }
);

export default api;
