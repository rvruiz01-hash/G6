// src/pages/Admin/FeedbackManagement.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import api from "../../../services/api";
import FeedbackChat from "../../components/FeedbackChat";

interface Feedback {
  id: number;
  module: string;
  url: string;
  type: "error" | "improvement";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  steps_to_reproduce: string | null;
  expected_behavior: string;
  actual_behavior: string;
  frequency: "always" | "sometimes" | "once" | null;
  affected_users: string;
  additional_info: string | null;
  screenshots: string[] | null;
  status: "pending" | "in_progress" | "resolved" | "rejected" | "reopened";
  user_agent: string;
  rejected_notes: string | null;

  // 🎯 CAMPOS DE RESOLUCIÓN
  resolved_by: number | null;
  resolved_at: string | null;
  resolution_description: string | null;
  resolution_version: string | null;
  time_to_resolve: number | null;

  // 🎯 ESTADÍSTICAS
  messages_count: number;

  created_at: string;
  updated_at: string;

  // Relaciones
  user: {
    id: number;
    name: string;
    email: string;
  };
  resolver?: {
    id: number;
    name: string;
    email: string;
  };
  assignedUser?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Statistics {
  total: number;
  by_status: {
    pending: number;
    in_progress: number;
    resolved: number;
    rejected: number;
  };
  by_type: {
    errors: number;
    improvements: number;
  };
  by_priority: {
    high: number;
    medium: number;
    low: number;
  };
  recent: Feedback[];
}

export default function FeedbackManagement() {
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
    module: "",
  });

  // 🎯 Estado para el formulario de resolución
  const [resolutionForm, setResolutionForm] = useState({
    resolution_description: "",
    resolution_version: "",
  });
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  // 🎯 Estado para el formulario de rechazo
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    fetchStatistics();
    fetchCurrentUser();
  }, [filters]);

  // 🎯 Detectar parámetro 'selected' en la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedId = params.get("selected");

    if (selectedId && feedbacks.length > 0) {
      const feedback = feedbacks.find((f) => f.id === parseInt(selectedId));
      if (feedback) {
        setSelectedFeedback(feedback);
      }
    }
  }, [location.search, feedbacks.length]); // 🎯 Usar feedbacks.length en lugar de feedbacks completo

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me"); // Endpoint para obtener usuario actual
      setCurrentUserId(response.data.id);
      setIsAdmin(response.data.is_admin || false);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.module) params.append("module", filters.module);

      const response = await api.get(`/feedback?${params}`);
      setFeedbacks(response.data.data);
    } catch (error) {
      console.error("Error al obtener feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/feedback/statistics");
      setStatistics(response.data);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  };

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const payload: any = { status };

      if (notes) {
        payload.rejected_notes = notes;
      }

      // Si se está resolviendo y hay datos del formulario de resolución
      if (status === "resolved" && resolutionForm.resolution_description) {
        payload.resolution_description = resolutionForm.resolution_description;
        payload.resolution_version = resolutionForm.resolution_version;
      }

      await api.put(`/feedback/${id}`, payload);

      fetchFeedbacks();
      fetchStatistics();
      setSelectedFeedback(null);
      setShowResolutionForm(false);
      setResolutionForm({
        resolution_description: "",
        resolution_version: "",
      });
    } catch (error) {
      console.error("Error al actualizar feedback:", error);
      alert("Error al actualizar el feedback");
    }
  };

  const handleResolveClick = () => {
    setShowResolutionForm(true);
  };

  const handleResolutionSubmit = () => {
    if (!resolutionForm.resolution_description.trim()) {
      alert("La descripción de la solución es obligatoria");
      return;
    }
    if (selectedFeedback) {
      updateStatus(selectedFeedback.id, "resolved");
    }
  };

  const handleRejectClick = () => {
    setShowRejectionForm(true);
  };

  const handleRejectionSubmit = () => {
    if (!rejectionReason.trim()) {
      alert("La razón del rechazo es obligatoria");
      return;
    }
    if (selectedFeedback) {
      updateStatus(selectedFeedback.id, "rejected", rejectionReason);
      setRejectionReason("");
      setShowRejectionForm(false);
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "error" ? "🐛" : "💡";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        📋 Gestión de Feedback
      </h1>

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Total de Reportes
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
              {statistics.total}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              Pendientes
            </div>
            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">
              {statistics.by_status.pending}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">
              Errores Reportados
            </div>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
              {statistics.by_type.errors}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">
              Resueltos
            </div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
              {statistics.by_status.resolved}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="rejected">Rechazado</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
          >
            <option value="">Todos los tipos</option>
            <option value="error">🐛 Errores</option>
            <option value="improvement">💡 Mejoras</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
          >
            <option value="">Todas las prioridades</option>
            <option value="high">🔴 Alta</option>
            <option value="medium">🟡 Media</option>
            <option value="low">🟢 Baja</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por módulo..."
            value={filters.module}
            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Lista de Feedback */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No hay reportes con los filtros seleccionados
            </p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedFeedback(feedback)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(feedback.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {feedback.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {feedback.module}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Por: {feedback.user.name} •{" "}
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      feedback.priority
                    )}`}
                  >
                    {feedback.priority === "high"
                      ? "🔴 Alta"
                      : feedback.priority === "medium"
                      ? "🟡 Media"
                      : "🟢 Baja"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      feedback.status
                    )}`}
                  >
                    {feedback.status === "pending"
                      ? "Pendiente"
                      : feedback.status === "in_progress"
                      ? "En Progreso"
                      : feedback.status === "resolved"
                      ? "Resuelto"
                      : "Rechazado"}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {feedback.description}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>URL: {feedback.url}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFeedback(feedback);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver detalles →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalles */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[101]">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-t-xl z-[102]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {getTypeIcon(selectedFeedback.type)} Detalles del Feedback
                </h2>
                <button
                  onClick={() => {
                    setSelectedFeedback(null);
                    // 🎯 Bug 1: Limpiar parámetro 'selected' de la URL
                    const newUrl = window.location.pathname;
                    window.history.pushState({}, "", newUrl);
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Info del Usuario */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  👤 Información del Usuario
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Nombre:</strong> {selectedFeedback.user.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> {selectedFeedback.user.email}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedFeedback.created_at).toLocaleString()}
                </p>
              </div>

              {/* Título */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  📋 Título
                </h3>
                <p className="text-lg text-gray-900 dark:text-white font-medium">
                  {selectedFeedback.title}
                </p>
              </div>

              {/* Descripción General */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  📝 Descripción General
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedFeedback.description}
                </p>
              </div>

              {/* Campos específicos para ERRORES */}
              {selectedFeedback.type === "error" && (
                <>
                  {/* Pasos para reproducir */}
                  {selectedFeedback.steps_to_reproduce && (
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                        🔄 Pasos para Reproducir
                      </h3>
                      <p className="text-red-800 dark:text-red-400 whitespace-pre-wrap">
                        {selectedFeedback.steps_to_reproduce}
                      </p>
                    </div>
                  )}

                  {/* Comportamientos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                        ✅ Comportamiento Esperado
                      </h3>
                      <p className="text-green-800 dark:text-green-400 whitespace-pre-wrap">
                        {selectedFeedback.expected_behavior}
                      </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                        ❌ Comportamiento Real
                      </h3>
                      <p className="text-orange-800 dark:text-orange-400 whitespace-pre-wrap">
                        {selectedFeedback.actual_behavior}
                      </p>
                    </div>
                  </div>

                  {/* Frecuencia */}
                  {selectedFeedback.frequency && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                        🔁 Frecuencia
                      </h3>
                      <p className="text-yellow-800 dark:text-yellow-400">
                        {selectedFeedback.frequency === "always" &&
                          "🔴 Siempre - Cada vez que se intenta"}
                        {selectedFeedback.frequency === "sometimes" &&
                          "🟡 A veces - Ocurre aleatoriamente"}
                        {selectedFeedback.frequency === "once" &&
                          "🟢 Una vez - Solo ocurrió una vez"}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Campos específicos para MEJORAS */}
              {selectedFeedback.type === "improvement" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      💎 Beneficio Esperado
                    </h3>
                    <p className="text-blue-800 dark:text-blue-400 whitespace-pre-wrap">
                      {selectedFeedback.expected_behavior}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                      📍 Situación Actual
                    </h3>
                    <p className="text-purple-800 dark:text-purple-400 whitespace-pre-wrap">
                      {selectedFeedback.actual_behavior}
                    </p>
                  </div>
                </div>
              )}

              {/* Usuarios Afectados */}
              <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                  👥{" "}
                  {selectedFeedback.type === "error"
                    ? "Usuarios Afectados"
                    : "Usuarios Beneficiados"}
                </h3>
                <p className="text-indigo-800 dark:text-indigo-400">
                  {selectedFeedback.affected_users}
                </p>
              </div>

              {/* Información Adicional */}
              {selectedFeedback.additional_info && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    📎 Información Adicional
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedFeedback.additional_info}
                  </p>
                </div>
              )}

              {/* 🎯 CAPTURAS DE PANTALLA */}
              {selectedFeedback.screenshots &&
                selectedFeedback.screenshots.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">
                      📸 Capturas de Pantalla (
                      {selectedFeedback.screenshots.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedFeedback.screenshots.map((screenshot, index) => {
                        const imageUrl = `${
                          import.meta.env.VITE_API_URL ||
                          "http://localhost:8000"
                        }/storage/${screenshot}`;
                        const extension =
                          screenshot.split(".").pop()?.toLowerCase() || "";
                        const isImage = [
                          "jpg",
                          "jpeg",
                          "png",
                          "gif",
                          "webp",
                        ].includes(extension);
                        const isPdf = extension === "pdf";

                        return (
                          <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-700 cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:shadow-lg transition-all"
                            onClick={() => window.open(imageUrl, "_blank")}
                          >
                            <div className="w-full h-48 flex flex-col items-center justify-center p-6">
                              {isImage ? (
                                <svg
                                  className="w-20 h-20 text-purple-400 dark:text-purple-300 mb-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              ) : isPdf ? (
                                <svg
                                  className="w-20 h-20 text-red-400 dark:text-red-300 mb-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-20 h-20 text-gray-400 dark:text-gray-300 mb-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              )}
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                Captura {index + 1}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                {extension}
                              </p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white text-center">
                                <svg
                                  className="w-12 h-12 mx-auto mb-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                <p className="text-sm font-medium">
                                  Click para abrir
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      💡 Click en cualquier archivo para abrirlo en una nueva
                      pestaña
                    </p>
                  </div>
                )}

              {/* Información Técnica */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🔧 Información Técnica
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Módulo:</strong> {selectedFeedback.module}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>URL:</strong> {selectedFeedback.url}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                  <strong>User Agent:</strong> {selectedFeedback.user_agent}
                </p>
              </div>

              {/* Notas del Admin */}
              {selectedFeedback.rejected_notes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    💬 Notas del Administrador
                  </h3>
                  <p className="text-blue-800 dark:text-blue-400">
                    {selectedFeedback.rejected_notes}
                  </p>
                </div>
              )}

              {/* 🎯 INFORMACIÓN DE RESOLUCIÓN (si está resuelto) */}
              {selectedFeedback.status === "resolved" &&
                selectedFeedback.resolution_description && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-700">
                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                      ✅ Información de Resolución
                    </h3>

                    <div className="space-y-3">
                      {selectedFeedback.resolver && (
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            👤 Resuelto por:
                          </span>
                          <p className="text-green-700 dark:text-green-400">
                            {selectedFeedback.resolver.name}
                          </p>
                        </div>
                      )}

                      {selectedFeedback.resolved_at && (
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            📅 Fecha de resolución:
                          </span>
                          <p className="text-green-700 dark:text-green-400">
                            {new Date(
                              selectedFeedback.resolved_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {selectedFeedback.time_to_resolve && (
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            ⏱️ Tiempo de resolución:
                          </span>
                          <p className="text-green-700 dark:text-green-400">
                            {Math.floor(selectedFeedback.time_to_resolve / 60)}{" "}
                            horas {selectedFeedback.time_to_resolve % 60}{" "}
                            minutos
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          📝 Descripción de la solución:
                        </span>
                        <p className="text-green-700 dark:text-green-400 whitespace-pre-wrap mt-1">
                          {selectedFeedback.resolution_description}
                        </p>
                      </div>

                      {selectedFeedback.resolution_version && (
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            🏷️ Versión implementada:
                          </span>
                          <p className="text-green-700 dark:text-green-400">
                            {selectedFeedback.resolution_version}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* 🎯 CHAT DE SOPORTE */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  💬 Chat de Soporte
                </h3>
                <FeedbackChat
                  feedbackId={selectedFeedback.id}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                />
              </div>

              {/* 🎯 FORMULARIO DE RESOLUCIÓN */}
              {selectedFeedback.status !== "resolved" && showResolutionForm && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    ✅ Marcar como Resuelto
                  </h3>

                  <div className="space-y-4 bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción de la solución{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={resolutionForm.resolution_description}
                        onChange={(e) =>
                          setResolutionForm({
                            ...resolutionForm,
                            resolution_description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder="Describe cómo se solucionó el problema..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Versión implementada
                      </label>
                      <input
                        type="text"
                        value={resolutionForm.resolution_version}
                        onChange={(e) =>
                          setResolutionForm({
                            ...resolutionForm,
                            resolution_version: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: v2.1.5"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowResolutionForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleResolutionSubmit}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        ✅ Confirmar Resolución
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎯 FORMULARIO DE RECHAZO */}
              {selectedFeedback.status !== "rejected" && showRejectionForm && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    ❌ Rechazar Reporte
                  </h3>

                  <div className="space-y-4 bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Razón del rechazo{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="Explica por qué se rechaza este reporte..."
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowRejectionForm(false);
                          setRejectionReason("");
                        }}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRejectionSubmit}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        ❌ Confirmar Rechazo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedFeedback.status !== "in_progress" &&
                  selectedFeedback.status !== "resolved" && (
                    <button
                      onClick={() =>
                        updateStatus(selectedFeedback.id, "in_progress")
                      }
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      📌 Marcar en Progreso
                    </button>
                  )}
                {selectedFeedback.status !== "resolved" &&
                  !showResolutionForm &&
                  !showRejectionForm && (
                    <button
                      onClick={handleResolveClick}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      ✅ Resolver
                    </button>
                  )}
                {selectedFeedback.status !== "rejected" &&
                  selectedFeedback.status !== "resolved" &&
                  !showResolutionForm &&
                  !showRejectionForm && (
                    <button
                      onClick={handleRejectClick}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ❌ Rechazar
                    </button>
                  )}
                {selectedFeedback.status === "resolved" && (
                  <button
                    onClick={() =>
                      updateStatus(selectedFeedback.id, "reopened")
                    }
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    🔄 Reabrir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
