// src/context/AuthContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../../services/api";
import SessionModal from "../components/SessionModal";
import { useNavigate } from "react-router-dom";
import { useCheckUserActivity } from "../hooks_personalizados/useCheckUserActivity";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  // Usamos useRef en lugar de useState para evitar bucles infinitos
  const modalTimerRef = useRef(null);
  const lastActivity = useCheckUserActivity(); // este hook hace que revise si el usuario esta activo realizando actividad
  // Función de login que se usa al acceder al sistema
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { data } = response;
      console.log("datos completos :", data);
      setUser(data.user);
      console.log("Usuario seteado en contexto:", data.user);
      setExpiresAt(data.expires_at);
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };
  // Función de logout que se usa al cerrar sesión
  const logout = useCallback(async () => {
    console.log("entre logout");
    try {
      await api.post("/auth/logout", {}, { ignoreSessionExpired: true });
      console.log("Sesión cerrada en el servidor.");
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error.message);
    } finally {
      setUser(null);
      setExpiresAt(null);
      setShowModal(false);
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  // Función para mantener viva la sesión (activa el modal)
  const keepAlive = async () => {
    try {
      console.log("entre keepAlive");
      const { data, headers } = await api.post("/auth/refresh");
      const newExpires =
        data.expires_at ?? Number(headers["x-token-expires-at"]);
      if (newExpires) {
        setExpiresAt(newExpires);
      }
      setShowModal(false);
    } catch (e) {
      console.error("No se pudo renovar la sesión", e);
    }
  };

  // ✅ Verificación de sesión inicial
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const { data, headers } = await api.get("/auth/me");
        if (isMounted) {
          setUser(data);
          const headerExpires = headers["x-token-expires-at"]
            ? Number(headers["x-token-expires-at"])
            : null;
          setExpiresAt(headerExpires);
        }
      } catch (e) {
        console.log("Error en la verificación de sesión. Limpiando el estado.");
        if (isMounted) {
          setUser(null);
          setExpiresAt(null);
        }
      } finally {
        if (isMounted) {
          setIsSessionChecked(true);
        }
      }
    };
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);
  // ✅ Redirigir al login si el usuario no está autenticado
  useEffect(() => {
    if (isSessionChecked && !user) {
      navigate("/", { replace: true });
    }
  }, [isSessionChecked, user]); // navigate

  // ✅ Escuchar evento de sesión expirada y cerrar sesión
  useEffect(() => {
    console.log("1");
    const handleSessionExpired = () => {
      console.warn(
        "Sesión expirada detectada. Cerrando sesión automáticamente."
      );
      logout();
    };
    window.addEventListener("session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [logout]);

  // ✅ Mostrar modal antes de expiración y cerrar sesión al expirar
  useEffect(() => {
    console.log("2");
    if (expiresAt) {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }

      const now = Math.floor(Date.now() / 1000);
      const secondsUntilModal = expiresAt - now - 600; // tiemnpo hasta el modal (10 minutos antes)
      const secondsUntilLogout = expiresAt - now;

      // Mostrar modal 10 minutos antes
      if (secondsUntilModal > 0) {
        modalTimerRef.current = setTimeout(() => {
          setShowModal(true);
        }, secondsUntilModal * 1000);
      } else {
        setShowModal(true);
      }

      // Forzar logout cuando expire el token
      const logoutTimer = setTimeout(() => {
        console.warn("Token expirado. Cerrando sesión automáticamente.");
        logout();
      }, secondsUntilLogout * 1000);

      return () => {
        clearTimeout(modalTimerRef.current);
        clearTimeout(logoutTimer);
      };
    } else {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
        modalTimerRef.current = null;
      }
    }
  }, [expiresAt, logout]);
  // ✅ Cerrar modal si hay actividad del usuario en la pantalla
  return (
    <AuthContext.Provider
      value={{ user, login, logout, keepAlive, isSessionChecked }}
    >
      {children}
      <SessionModal
        open={showModal}
        // onClose={() => setShowModal(false)} se bloquea ya que se implementa para que se cierre la sesion al darle no
        onClose={logout}
        onKeepAlive={keepAlive}
      />
    </AuthContext.Provider>
  );
}

// prueba de la sesion auutomatica al detectar movimiento del usuario aunen prueba

/*
// src/context/AuthContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../../services/api";
import SessionModal from "../components/SessionModal";
import { useNavigate } from "react-router-dom";
import { useCheckUserActivity } from "../hooks_personalizados/useCheckUserActivity";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  // Para controlar que no se haga refresh concurrente
  const [isRefreshing, setIsRefreshing] = useState(false);

  const modalTimerRef = useRef(null);
  const lastActivity = useCheckUserActivity();

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { data } = response;
      console.log("datos completos :", data);
      setUser(data.user);
      console.log("Usuario seteado en contexto:", data.user);
      setExpiresAt(data.expires_at);
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {}, { ignoreSessionExpired: true });
      console.log("Sesión cerrada en el servidor.");
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error.message);
    } finally {
      setUser(null);
      setExpiresAt(null);
      setShowModal(false);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const keepAlive = useCallback(async () => {
    if (isRefreshing) return; // evitar refreshes simultáneos
    setIsRefreshing(true);
    try {
      const { data, headers } = await api.post("/auth/refresh");
      const newExpires =
        data.expires_at ?? Number(headers["x-token-expires-at"]);
      if (newExpires) {
        setExpiresAt(newExpires);
      }
      setShowModal(false);
    } catch (e) {
      console.error("No se pudo renovar la sesión", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Verificación de sesión inicial
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const { data, headers } = await api.get("/auth/me");
        if (isMounted) {
          setUser(data);
          const headerExpires = headers["x-token-expires-at"]
            ? Number(headers["x-token-expires-at"])
            : null;
          setExpiresAt(headerExpires);
        }
      } catch (e) {
        console.log("Error en la verificación de sesión. Limpiando el estado.");
        if (isMounted) {
          setUser(null);
          setExpiresAt(null);
        }
      } finally {
        if (isMounted) {
          setIsSessionChecked(true);
        }
      }
    };
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Redirigir al login si el usuario no está autenticado
  useEffect(() => {
    if (isSessionChecked && !user) {
      navigate("/login", { replace: true });
    }
  }, [isSessionChecked, user, navigate]);

  // Escuchar evento de sesión expirada y cerrar sesión
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn("Sesión expirada detectada. Cerrando sesión automáticamente.");
      logout();
    };
    window.addEventListener("session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [logout]);

  // Mostrar modal o refrescar token antes de expiración según actividad del usuario
  useEffect(() => {
    if (!expiresAt) return;

    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }

    const now = Math.floor(Date.now() / 1000);
    const secondsUntilModal = expiresAt - now - 240; // 4 minutos antes
    const secondsUntilLogout = expiresAt - now;

    const inactivitySeconds = (Date.now() - lastActivity) / 1000;
    console.log("variables secondsUntilModal :" + secondsUntilModal);
    console.log("variables secondsUntilLogout :" + secondsUntilLogout);
    console.log("variables inactivitySeconds :" + inactivitySeconds);
    if (secondsUntilModal > 0) {
      modalTimerRef.current = setTimeout(async () => {
        if (inactivitySeconds < 240) {
          console.log("[AUTOREFRESH] Usuario activo detectado. Token se refresca automáticamente.");
          // Usuario activo en últimos 5 minutos: refrescar token silenciosamente
          await keepAlive();
          setShowModal(false);
        } else {
          console.log("[MODAL] Usuario inactivo detectado. Mostrando modal.");
          // Usuario inactivo: mostrar modal
          setShowModal(true);
        }
      }, secondsUntilModal * 1000);
    } else {
      if (inactivitySeconds < 240) {
        keepAlive();
        setShowModal(false);
      } else {
        setShowModal(true);
      }
    }

    const logoutTimer = setTimeout(() => {
      console.warn("Token expirado. Cerrando sesión automáticamente.");
      logout();
    }, secondsUntilLogout * 1000);

    return () => {
      clearTimeout(modalTimerRef.current);
      clearTimeout(logoutTimer);
    };
  }, [expiresAt, lastActivity, logout, keepAlive]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, keepAlive, isSessionChecked }}
    >
      {children}
      <SessionModal
        open={showModal}
        onClose={logout}       // Al dar "No" cierra sesión y modal
        onKeepAlive={keepAlive} // Al dar "Sí" refresca token y oculta modal
      />
    </AuthContext.Provider>
  );
}

*/
