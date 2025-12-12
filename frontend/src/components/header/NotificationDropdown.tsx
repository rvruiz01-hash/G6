import { useState, useEffect, useContext } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link, useNavigate, useLocation } from "react-router";
import { useDropdown } from "../../context/DropdownContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../../services/api";

interface Notification {
  id: number;
  feedback_id: number;
  type: string;
  message: string;
  data: any;
  read: boolean;
  read_at: string | null;
  created_at: string;
  feedback: {
    id: number;
    title: string;
    type: string;
  };
}

interface NotificationDropdownProps {
  basePath?: string;
}

export default function NotificationDropdown({
  basePath = "/dashboard",
}: NotificationDropdownProps) {
  const { openDropdown, setOpenDropdown } = useDropdown();
  const isOpen = openDropdown === "notifications";
  const navigate = useNavigate();
  const location = useLocation();

  // 🎯 Obtener usuario del AuthContext (igual que UserDropdown)
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("AuthContext no está disponible");
  }
  const { user } = auth;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);

  // 🎯 Detectar automáticamente basePath desde la URL actual
  const detectedBasePath = location.pathname.startsWith("/dashboard")
    ? "/dashboard"
    : "";
  const finalBasePath = basePath || detectedBasePath;

  // 🎯 Determinar si es admin por el nombre del usuario
  const isAdmin = user?.name === "Admin";

  // 🎯 Actualizar contador cada 15 segundos
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  // 🎯 Cargar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      setNotifying(false);
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      const newCount = response.data.unread_count;

      setNotifying(newCount > 0);

      if (newCount > unreadCount && unreadCount > 0) {
        console.log("🔔 Nueva notificación recibida!");
      }

      setUnreadCount(newCount);
    } catch (error) {
      console.error("Error al obtener contador:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications?per_page=15");
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída
    if (!notification.read) {
      try {
        await api.post(`/notifications/${notification.id}/read`);
        fetchUnreadCount();
        fetchNotifications();
      } catch (error) {
        console.error("Error al marcar como leída:", error);
      }
    }

    closeDropdown();

    // 🎯 Navegar según el rol del usuario
    // Agregar timestamp para forzar que sea una URL única cada vez
    const timestamp = Date.now();
    if (isAdmin) {
      navigate(
        `${finalBasePath}/admin/feedback?selected=${notification.feedback_id}&t=${timestamp}`
      );
    } else {
      navigate(
        `${finalBasePath}/mis-reportes?selected=${notification.feedback_id}&t=${timestamp}`
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  function toggleDropdown() {
    setOpenDropdown(isOpen ? null : "notifications");
  }

  function closeDropdown() {
    setOpenDropdown(null);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_message":
        return "💬";
      case "status_changed":
        return "🔄";
      case "assigned":
        return "📌";
      case "resolved":
        return "✅";
      case "reopened":
        return "🔄";
      case "new_feedback":
        return "📋";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_message":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "status_changed":
        return "bg-orange-100 dark:bg-orange-900/20";
      case "assigned":
        return "bg-purple-100 dark:bg-purple-900/20";
      case "resolved":
        return "bg-green-100 dark:bg-green-900/20";
      case "reopened":
        return "bg-yellow-100 dark:bg-yellow-900/20";
      case "new_feedback":
        return "bg-indigo-100 dark:bg-indigo-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Justo ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        title="Notificaciones"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 z-20">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <img
          src="../../public/svg/notify.svg"
          alt="Notificaciones"
          className="w-6 h-6 group-hover:opacity-80"
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"})
              </span>
            )}
          </h5>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium mr-2"
                title="Marcar todas como leídas"
              >
                Marcar leídas
              </button>
            )}

            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm font-medium">No tienes notificaciones</p>
              <p className="text-xs mt-1">
                Te avisaremos cuando haya novedades
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notification)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <span
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </span>

                  <span className="flex-1 block">
                    <span className="mb-1.5 block text-theme-sm text-gray-700 dark:text-gray-300">
                      {notification.message}
                    </span>

                    {notification.feedback && (
                      <span className="block mb-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {notification.feedback.type === "error" ? "🐛" : "💡"}{" "}
                        <span className="font-medium">
                          {notification.feedback.title}
                        </span>
                      </span>
                    )}

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>
                        {notification.type === "new_feedback"
                          ? "Reporte"
                          : "Feedback"}
                      </span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatTime(notification.created_at)}</span>
                    </span>
                  </span>

                  {!notification.read && (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    </span>
                  )}
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        {notifications.length > 0 && (
          <Link
            to={
              isAdmin
                ? `${finalBasePath}/admin/feedback`
                : `${finalBasePath}/mis-reportes`
            }
            onClick={closeDropdown}
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Ver Todos los Reportes
          </Link>
        )}
      </Dropdown>
    </div>
  );
}
