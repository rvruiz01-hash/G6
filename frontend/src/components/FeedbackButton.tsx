// src/components/FeedbackButton.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api";

interface FeedbackModalProps {
  moduleName: string;
  moduleUrl?: string;
}

interface FormData {
  type: "error" | "improvement";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  frequency: "always" | "sometimes" | "once";
  affectedUsers: string;
  additionalInfo: string;
}

export default function FeedbackButton({
  moduleName,
  moduleUrl,
}: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: "error",
    priority: "medium",
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    frequency: "sometimes",
    affectedUsers: "",
    additionalInfo: "",
  });

  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      type: "error",
      priority: "medium",
      title: "",
      description: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
      frequency: "sometimes",
      affectedUsers: "",
      additionalInfo: "",
    });
    setScreenshots([]);
    setScreenshotPreviews([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isImage) alert(`${file.name} no es una imagen válida`);
      if (!isValidSize) alert(`${file.name} supera el tamaño máximo de 5MB`);
      return isImage && isValidSize;
    });

    if (screenshots.length + validFiles.length > 3) {
      alert("Máximo 3 capturas de pantalla permitidas");
      return;
    }

    setScreenshots((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("module", moduleName);
      formDataToSend.append("url", moduleUrl || window.location.pathname);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("steps_to_reproduce", formData.stepsToReproduce);
      formDataToSend.append("expected_behavior", formData.expectedBehavior);
      formDataToSend.append("actual_behavior", formData.actualBehavior);
      formDataToSend.append("frequency", formData.frequency);
      formDataToSend.append("affected_users", formData.affectedUsers);
      formDataToSend.append("additional_info", formData.additionalInfo);
      formDataToSend.append("user_agent", navigator.userAgent);
      formDataToSend.append("timestamp", new Date().toISOString());

      screenshots.forEach((file, index) => {
        formDataToSend.append(`screenshots[${index}]`, file);
      });

      await api.post("/feedback", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error al enviar feedback:", error);
      alert("Error al enviar el reporte. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 MODAL RENDERIZADO EN PORTAL (fuera del contenedor padre)
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[101]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-t-xl z-[102]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">🎯 Feedback y Soporte</h2>
            <button
              onClick={() => {
                setIsOpen(false);
                resetForm();
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
          <p className="text-sm text-white/90 mt-1">
            Módulo: <span className="font-semibold">{moduleName}</span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Gracias por tu feedback!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tu reporte ha sido enviado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ¿Qué deseas reportar? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("type", "error")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === "error"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl block mb-1">🐛</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Error/Bug
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("type", "improvement")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === "improvement"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl block mb-1">💡</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Mejora
                    </span>
                  </button>
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="low">🟢 Baja</option>
                  <option value="medium">🟡 Media</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Error al guardar departamento"
                  required
                  minLength={10}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Entre 10 y 100 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Explica brevemente..."
                  required
                  minLength={20}
                  maxLength={500}
                />
              </div>

              {/* Campos para ERRORES */}
              {formData.type === "error" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pasos para reproducir{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.stepsToReproduce}
                      onChange={(e) =>
                        handleChange("stepsToReproduce", e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="1. Ir a...&#10;2. Hacer clic en..."
                      required
                      minLength={20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ¿Qué esperabas? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.expectedBehavior}
                      onChange={(e) =>
                        handleChange("expectedBehavior", e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      required
                      minLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ¿Qué sucedió? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.actualBehavior}
                      onChange={(e) =>
                        handleChange("actualBehavior", e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      required
                      minLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frecuencia <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) =>
                        handleChange("frequency", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="always">🔴 Siempre</option>
                      <option value="sometimes">🟡 A veces</option>
                      <option value="once">🟢 Una vez</option>
                    </select>
                  </div>
                </>
              )}

              {/* Campos para MEJORAS */}
              {formData.type === "improvement" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ¿Qué beneficio traería?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.expectedBehavior}
                      onChange={(e) =>
                        handleChange("expectedBehavior", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      required
                      minLength={20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ¿Cómo se hace actualmente?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.actualBehavior}
                      onChange={(e) =>
                        handleChange("actualBehavior", e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      required
                      minLength={15}
                    />
                  </div>
                </>
              )}

              {/* Usuarios afectados */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.type === "error"
                    ? "¿A quién afecta?"
                    : "¿Quién se beneficiaría?"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.affectedUsers}
                  onChange={(e) =>
                    handleChange("affectedUsers", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Solo a mí, A todos"
                  required
                  minLength={5}
                />
              </div>

              {/* Info adicional */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📎 Información adicional (opcional)
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    handleChange("additionalInfo", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  maxLength={1000}
                />
              </div>

              {/* Capturas */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📸 Capturas (opcional)
                </label>
                <input
                  type="file"
                  id="screenshot-input"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={screenshots.length >= 3}
                />
                <label
                  htmlFor="screenshot-input"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                    screenshots.length >= 3
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : "border-purple-300 bg-purple-50 hover:bg-purple-100"
                  }`}
                >
                  <p className="text-sm">
                    {screenshots.length >= 3
                      ? "Máximo alcanzado"
                      : "Click para subir"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {screenshots.length}/3 imágenes
                  </p>
                </label>

                {screenshotPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {screenshotPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ))}
                  </div>
                )}
              </div>

              {/* Info automática */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">ℹ️ Se incluirá:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Módulo: {moduleName}</li>
                  <li>URL: {window.location.pathname}</li>
                </ul>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-1 right-1 z-50 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        title="Reportar error o sugerir mejora"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* 🎯 PORTAL: Renderiza el modal FUERA del DOM del componente */}
      {createPortal(modalContent, document.body)}
    </>
  );
}
