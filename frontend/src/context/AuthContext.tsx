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
import type { JSX } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  photo: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  keepAlive: () => void;
  isSessionChecked: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSessionChecked, setIsSessionChecked] = useState<boolean>(false);

  const modalTimerRef = useRef<number | null>(null); // Tipo adecuado para el navegador

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Respuesta de login:", response);
      const { data } = response;
      console.log(data.user);
      setUser(data.user);
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
      if (error instanceof Error) {
        console.error("Error al cerrar sesión en el servidor:", error.message);
      } else {
        console.error("Error desconocido al cerrar sesión", error);
      }
    } finally {
      setUser(null);
      setExpiresAt(null);
      setShowModal(false);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const keepAlive = async () => {
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
    }
  };

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const { data, headers } = await api.get("/auth/me", {
          ignoreSessionExpired: true,
        });
        if (isMounted) {
          setUser(data);
          const headerExpires = headers["x-token-expires-at"]
            ? Number(headers["x-token-expires-at"])
            : null;
          setExpiresAt(headerExpires);
        }
      } catch (e) {
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

  useEffect(() => {
    if (isSessionChecked && !user && window.location.pathname !== "/") {
      navigate("/login", { replace: true });
    }
  }, [isSessionChecked, user, navigate]);

  useEffect(() => {
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

  useEffect(() => {
    if (expiresAt) {
      // Limpiar el temporizador anterior si existe
      if (modalTimerRef.current !== null) {
        clearTimeout(modalTimerRef.current);
      }

      const now = Math.floor(Date.now() / 1000);
      const secondsUntilModal = expiresAt - now - 600; // tiempo hasta el modal (10 minutos antes)
      console.log(
        "expiresAt:",
        expiresAt,
        "now:",
        now,
        "secondsUntilModal:",
        secondsUntilModal
      );
      const secondsUntilLogout = expiresAt - now;

      // Mostrar modal 10 minutos antes
      if (secondsUntilModal > 0) {
        // Asignación de timeout con type assertion para evitar el error
        modalTimerRef.current = setTimeout(() => {
          console.log("Modal triggered");
          setShowModal(true);
        }, secondsUntilModal * 1000) as unknown as number; // Type assertion
      } else {
        console.log("Showing modal immediately");
        setShowModal(true);
      }

      const logoutTimer = setTimeout(() => {
        console.warn("Token expirado. Cerrando sesión automáticamente.");
        logout();
      }, secondsUntilLogout * 1000);

      return () => {
        // Asegúrate de que modalTimerRef.current sea un número antes de usar clearTimeout
        if (modalTimerRef.current !== null) {
          console.log("Clearing modal timer");
          clearTimeout(modalTimerRef.current);
        }
        clearTimeout(logoutTimer);
      };
    } else {
      // Limpiar cualquier temporizador cuando expiresAt sea nulo
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
        modalTimerRef.current = null;
      }
    }
  }, [expiresAt, logout]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, keepAlive, isSessionChecked }}
    >
      {children}
      <SessionModal open={showModal} onClose={logout} onKeepAlive={keepAlive} />
    </AuthContext.Provider>
  );
}
