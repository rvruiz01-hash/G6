// src/components/FeedbackChat.tsx
import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";

interface Message {
  id: number;
  feedback_id: number;
  user_id: number;
  message: string;
  attachments: Array<{
    path: string;
    name: string;
    type: string;
    size: number;
  }> | null;
  is_internal: boolean;
  is_system: boolean;
  read_at: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
  };
}

interface FeedbackChatProps {
  feedbackId: number;
  currentUserId: number;
  isAdmin?: boolean;
}

export default function FeedbackChat({
  feedbackId,
  currentUserId,
  isAdmin = false,
}: FeedbackChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false); // 🎯 Indicador de mensajes nuevos
  const [isTyping, setIsTyping] = useState(false); // 🎯 Detectar si está escribiendo
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousMessageCountRef = useRef(0); // 🎯 Trackear cantidad de mensajes

  useEffect(() => {
    fetchMessages();
    // 🎯 Polling cada 3 segundos (más rápido para tiempo real)
    const interval = setInterval(() => {
      // Solo hacer polling si no está escribiendo
      if (!isTyping) {
        fetchMessages();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [feedbackId, isTyping]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/feedback/${feedbackId}/messages`);
      const newMessages = response.data;

      // 🎯 Detectar si hay mensajes nuevos
      if (
        newMessages.length > previousMessageCountRef.current &&
        previousMessageCountRef.current > 0
      ) {
        setHasNewMessages(true);
        // Auto-scroll si hay mensajes nuevos
        setTimeout(() => scrollToBottom(), 100);

        // Ocultar indicador después de 2 segundos
        setTimeout(() => setHasNewMessages(false), 2000);
      }

      previousMessageCountRef.current = newMessages.length;
      setMessages(newMessages);

      // Marcar como leídos
      await api.post(`/feedback/${feedbackId}/messages/read`);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      const formData = new FormData();
      const messageToSend =
        newMessage.trim() ||
        (attachments.length > 0 ? "📎 Archivo adjunto" : "");
      formData.append("message", messageToSend);
      if (isAdmin) {
        formData.append("is_internal", isInternal.toString());
      }

      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      await api.post(`/feedback/${feedbackId}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewMessage("");
      setAttachments([]);
      setIsInternal(false);
      await fetchMessages();
      // Solo hacer scroll cuando envías un mensaje
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error al enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="font-semibold">Chat de Soporte</h3>
            {/* 🎯 Indicador de nuevos mensajes */}
            {hasNewMessages && (
              <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                Nuevo mensaje
              </span>
            )}
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded">
            {messages.length} mensajes
          </span>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <svg
              className="w-16 h-16 mx-auto mb-3 opacity-50"
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
            <p>No hay mensajes aún</p>
            <p className="text-sm mt-1">Inicia la conversación</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_id === currentUserId;
            const isSystemMessage = msg.is_system;

            if (isSystemMessage) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-4 py-2 rounded-full">
                    {msg.message}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage ? "order-2" : "order-1"
                  }`}
                >
                  {/* Nombre del usuario */}
                  {!isOwnMessage && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-3">
                      {msg.user.name}
                      {msg.user.is_admin && (
                        <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                          Soporte
                        </span>
                      )}
                      {msg.is_internal && isAdmin && (
                        <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 px-2 py-0.5 rounded text-xs">
                          🔒 Interno
                        </span>
                      )}
                    </div>
                  )}

                  {/* Burbuja del mensaje */}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? "bg-blue-500 text-white"
                        : msg.is_internal
                        ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>

                    {/* Archivos adjuntos */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((file, index) => (
                          <a
                            key={index}
                            href={`${
                              import.meta.env.VITE_API_URL ||
                              "http://localhost:8000"
                            }/storage/${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors text-sm"
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
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            <span className="truncate">{file.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hora */}
                  <div
                    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-3 ${
                      isOwnMessage ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Archivos adjuntos preview */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Toggle mensaje interno (solo admin) */}
        {isAdmin && (
          <div className="mb-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded"
              />
              <span>🔒 Mensaje interno (solo visible para soporte)</span>
            </label>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Adjuntar archivo"
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => setIsTyping(true)} // 🎯 Pausar polling mientras escribe
            onBlur={() => setIsTyping(false)} // 🎯 Reanudar polling
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />

          <button
            type="submit"
            disabled={
              sending || (!newMessage.trim() && attachments.length === 0)
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
