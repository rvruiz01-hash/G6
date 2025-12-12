// src/pages/User/MyFeedback.tsx
// import React, { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import FeedbackChat from "../../components/FeedbackChat";

interface Feedback {
  id: number;
  module: string;
  title: string;
  type: "error" | "improvement";
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "resolved" | "rejected" | "reopened";
  created_at: string;
  resolved_at: string | null;
  messages_count: number;
  resolver?: {
    name: string;
  };
}

export default function MyFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  useEffect(() => {
    fetchMyFeedbacks();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setCurrentUserId(response.data.id);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  const fetchMyFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/feedback/my");
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error al obtener mis reportes:", error);
    } finally {
      setLoading(false);
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
      case "reopened":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Progreso";
      case "resolved":
        return "Resuelto";
      case "rejected":
        return "Rechazado";
      case "reopened":
        return "Reabierto";
      default:
        return status;
    }
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        📋 Mis Reportes
      </h1>

      {/* Lista de reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listado */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Cargando...
              </p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No has creado ningún reporte aún
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Usa el botón de feedback en cualquier módulo para reportar un
                problema
              </p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => setSelectedFeedback(feedback)}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedFeedback?.id === feedback.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feedback.type === "error" ? "🐛" : "💡"} {feedback.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feedback.module}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      feedback.status
                    )}`}
                  >
                    {getStatusLabel(feedback.status)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                      feedback.priority
                    )}`}
                  >
                    {feedback.priority === "high"
                      ? "🔴 Alta"
                      : feedback.priority === "medium"
                      ? "🟡 Media"
                      : "🟢 Baja"}
                  </span>
                  <span>
                    📅 {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                  {feedback.messages_count > 0 && (
                    <span className="flex items-center gap-1">
                      💬 {feedback.messages_count}
                    </span>
                  )}
                </div>

                {feedback.status === "resolved" && feedback.resolver && (
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✅ Resuelto por {feedback.resolver.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Panel de chat */}
        <div className="sticky top-6">
          {selectedFeedback ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg">
                <h2 className="font-bold text-lg mb-1">
                  {selectedFeedback.type === "error" ? "🐛" : "💡"}{" "}
                  {selectedFeedback.title}
                </h2>
                <p className="text-sm text-white/80">
                  {selectedFeedback.module}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      selectedFeedback.status
                    )}`}
                  >
                    {getStatusLabel(selectedFeedback.status)}
                  </span>
                  <span className="text-xs text-white/80">
                    Reporte #{selectedFeedback.id}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <FeedbackChat
                  feedbackId={selectedFeedback.id}
                  currentUserId={currentUserId}
                  isAdmin={false}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                Selecciona un reporte para ver los detalles y chatear con
                soporte
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
