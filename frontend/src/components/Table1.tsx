// src/components/Table.tsx
import React from "react";

// 🎯 Tipos para las columnas
export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  // ✅ NUEVO: Ocultar columna en móvil
  hideOnMobile?: boolean;
}

// 🎯 Props del componente
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  // ✅ NUEVO: Renderizado personalizado para móvil
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
  // ✅ NUEVO: Breakpoint para cambiar a móvil (default: md)
  mobileBreakpoint?: "sm" | "md" | "lg";
}

// 🎨 Componente principal
export function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "No hay resultados",
  loading = false,
  className = "",
  mobileCardRender,
  mobileBreakpoint = "md",
}: TableProps<T>) {
  // Clases para breakpoints
  const desktopClass = {
    sm: "hidden sm:block",
    md: "hidden md:block",
    lg: "hidden lg:block",
  }[mobileBreakpoint];

  const mobileClass = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
  }[mobileBreakpoint];

  return (
    <>
      <style>{`
        /* ✨ TABLA FUTURISTA */
        .futuristic-table {
          position: relative;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
          backdrop-filter: blur(10px);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.15),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
        }

        .dark .futuristic-table {
          background: linear-gradient(
            135deg,
            rgba(30, 41, 59, 0.8) 0%,
            rgba(15, 23, 42, 0.9) 100%
          );
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.4),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
        }

        .futuristic-table thead {
          position: relative;
          background: linear-gradient(
            90deg,
            rgba(212, 175, 55, 0.15) 0%,
            rgba(212, 175, 55, 0.15) 100%
          );
        }

        .dark .futuristic-table thead {
          background: linear-gradient(
            90deg,
            rgba(212, 175, 55, 0.2) 0%,
            rgba(59, 130, 246, 0.2) 100%
          );
        }

        .futuristic-table thead th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgb(212, 175, 55);
          position: relative;
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
          white-space: nowrap;
        }

        .dark .futuristic-table thead th {
          color: rgb(212, 175, 55);
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
        }

        .futuristic-table thead th::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(212, 175, 55, 0.8),
            transparent
          );
          animation: shimmer 3s ease-in-out infinite;
        }

        .dark .futuristic-table thead th::before {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(212, 175, 55, 0.8),
            transparent
          );
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .futuristic-table tbody tr {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(156, 163, 175, 0.1);
        }

        .dark .futuristic-table tbody tr {
          background: rgba(15, 23, 42, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .futuristic-table tbody tr:hover {
          background: linear-gradient(
            90deg,
            rgba(212, 175, 55, 0.08) 0%,
            rgba(212, 175, 55, 0.08) 100%
          );
          transform: translateX(4px);
          box-shadow: 
            -4px 0 0 0 rgba(212, 175, 55, 0.5),
            0 4px 20px 0 rgba(212, 175, 55, 0.1);
        }

        .dark .futuristic-table tbody tr:hover {
          background: linear-gradient(
            90deg,
            rgba(212, 175, 55, 0.1) 0%,
            rgba(212, 175, 55, 0.1) 100%
          );
          box-shadow: 
            -4px 0 0 0 rgba(212, 175, 55, 0.6),
            0 4px 20px 0 rgba(212, 175, 55, 0.15);
        }

        .futuristic-table tbody tr.clickable {
          cursor: pointer;
        }

        .futuristic-table tbody td {
          padding: 1rem;
          font-size: 0.9rem;
          color: rgb(55, 65, 81);
          position: relative;
        }

        .dark .futuristic-table tbody td {
          color: rgb(209, 213, 219);
        }

        /* ✨ TARJETA MÓVIL */
        .mobile-card {
          position: relative;
          background: linear-gradient(
            to bottom right,
            rgba(249, 250, 251, 1),
            rgba(212, 175, 55, 1)
          );
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid rgba(212, 175, 55, 1);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .dark .mobile-card {
          background: linear-gradient(
            to bottom right,
            rgba(212, 175, 55, 1),
            rgba(17, 24, 39, 1)
          );
          border: 1px solid rgba(212, 175, 55, 1);
        }

        .mobile-card:hover {
          box-shadow: 0 20px 25px -5px rgba(212, 175, 55, 0.15);
          transform: scale(1.02);
        }

        .mobile-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 8rem;
          height: 8rem;
          background: rgb(212, 175, 55);
          border-radius: 50%;
          filter: blur(3rem);
          opacity: 0.1;
        }

        .dark .mobile-card::before {
          background: rgb(212, 175, 55);
        }

        /* ✨ AVATAR CON NOMBRE */
        .avatar-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .dark .avatar-image {
          border: 2px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
        }

        .avatar-image:hover {
          transform: scale(1.1);
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
        }

        .dark .avatar-image:hover {
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.5);
        }

        .avatar-info {
          display: flex;
          flex-direction: column;
        }

        .avatar-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: rgb(31, 41, 55);
        }

        .dark .avatar-name {
          color: rgb(243, 244, 246);
        }

        .avatar-subtitle {
          font-size: 0.75rem;
          color: rgb(107, 114, 128);
        }

        .dark .avatar-subtitle {
          color: rgb(156, 163, 175);
        }

        /* ✨ BOTONES DE ACCIÓN */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
        }

        .action-btn {
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          background: rgba(59, 130, 246, 0.1);
          color: rgb(59, 130, 246);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .dark .action-btn {
          background: rgba(212, 175, 55, 0.15);
          color: rgb(212, 175, 55);
        }

        .action-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .dark .action-btn:hover {
          background: rgba(212, 175, 55, 0.25);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .action-btn.edit {
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
        }

        .action-btn.edit:hover {
          background: rgba(34, 197, 94, 0.2);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        /* ✨ BADGE GENÉRICO */
        .table-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-primary {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15));
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: rgb(59, 130, 246);
        }

        .dark .badge-primary {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(59, 130, 246, 0.2));
          border: 1px solid rgba(0,0,0, 0.4);
          color: rgb(243, 244, 246);
        }

        .badge-success {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.3));
          color: rgb(22, 163, 74);
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .dark .badge-success {
          color: rgb(74, 222, 128);
          border: 1px solid rgba(34, 197, 94, 0.5);
        }

        .badge-warning {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(202, 138, 4, 0.3));
          color: rgb(161, 98, 7);
          border: 1px solid rgba(212, 175, 55, 0.4);
        }

        .dark .badge-warning {
          color: rgb(253, 224, 71);
          border: 1px solid rgba(212, 175, 55, 0.5);
        }

        .badge-danger {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.3));
          color: rgb(220, 38, 38);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        /* ✨ STATUS INDICATOR */
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-indicator.active {
          background: rgb(34, 197, 94);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
        }

        .status-indicator.inactive {
          background: rgb(212, 175, 55);
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }

        /* ✨ ESTADO VACÍO */
        .empty-state {
          padding: 3rem 2rem;
          text-align: center;
          color: rgb(156, 163, 175);
        }

        .dark .empty-state {
          color: rgb(107, 114, 128);
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.3;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* ✨ LOADING STATE */
        .loading-row {
          padding: 2rem;
          text-align: center;
        }

        .loading-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(59, 130, 246, 0.2);
          border-top-color: rgb(59, 130, 246);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .dark .loading-spinner {
          border: 4px solid rgba(212, 175, 55, 0.2);
          border-top-color: rgb(212, 175, 55);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ✨ SCROLL PERSONALIZADO */
        .table-container::-webkit-scrollbar {
          height: 8px;
        }

        .table-container::-webkit-scrollbar-track {
          background: rgba(156, 163, 175, 0.1);
          border-radius: 4px;
        }

        .table-container::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5));
          border-radius: 4px;
        }

        .dark .table-container::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.5), rgba(59, 130, 246, 0.5));
        }

        /* ✨ RESPONSIVE */
        @media (max-width: 768px) {
          .futuristic-table thead th,
          .futuristic-table tbody td {
            padding: 0.75rem;
            font-size: 0.813rem;
          }

          .avatar-image {
            width: 32px;
            height: 32px;
          }

          .action-btn {
            padding: 0.375rem;
          }
        }
      `}</style>

      {/* ✨ TABLA DESKTOP */}
      <div
        className={`${desktopClass} table-container overflow-x-auto ${className}`}
      >
        <table className="futuristic-table w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width: column.width,
                    textAlign: column.align || "left",
                  }}
                  className={column.className}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="loading-row">
                    <div className="loading-spinner"></div>
                    <p className="mt-2 text-sm">Cargando datos...</p>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "clickable" : ""}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{ textAlign: column.align || "left" }}
                      className={column.className}
                    >
                      {column.render
                        ? column.render(row, index)
                        : (row as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                    <p className="text-xs mt-1">No se encontraron registros</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✨ VISTA MÓVIL (TARJETAS) */}
      <div className={`${mobileClass} space-y-3`}>
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Cargando...
            </p>
          </div>
        ) : data.length > 0 ? (
          data.map((row, index) => (
            <div
              key={keyExtractor(row)}
              className="mobile-card"
              onClick={() => onRowClick?.(row)}
            >
              <div className="relative z-10">
                {mobileCardRender ? (
                  mobileCardRender(row, index)
                ) : (
                  // ✅ Renderizado por defecto si no se proporciona mobileCardRender
                  <DefaultMobileCard row={row} columns={columns} />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="text-sm font-medium">{emptyMessage}</p>
            <p className="text-xs mt-1">No se encontraron registros</p>
          </div>
        )}
      </div>
    </>
  );
}

// ✨ Componente para tarjeta móvil por defecto
function DefaultMobileCard<T>({
  row,
  columns,
}: {
  row: T;
  columns: Column<T>[];
}) {
  return (
    <div className="space-y-2">
      {columns
        .filter((col) => !col.hideOnMobile)
        .map((column) => (
          <div key={column.key} className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {column.header}:
            </span>
            <div>
              {column.render ? column.render(row, 0) : (row as any)[column.key]}
            </div>
          </div>
        ))}
    </div>
  );
}

// 🎨 COMPONENTES AUXILIARES EXPORTADOS

export const AvatarCell: React.FC<{
  image: string;
  name: string;
  subtitle?: string;
}> = ({ image, name, subtitle }) => (
  <div className="avatar-cell">
    <img src={image} alt={name} className="avatar-image" />
    <div className="avatar-info">
      <span className="avatar-name">{name}</span>
      {subtitle && <span className="avatar-subtitle">{subtitle}</span>}
    </div>
  </div>
);

export const ActionButtons: React.FC<{
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customButtons?: Array<{
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
    title?: string;
  }>;
}> = ({ onEdit, onDelete, onView, customButtons }) => (
  <div className="action-buttons">
    {onView && (
      <button
        className="action-btn"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        title="Ver detalles"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    )}
    {onEdit && (
      <button
        className="action-btn edit"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Editar"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    )}
    {onDelete && (
      <button
        className="action-btn delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Eliminar"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    )}
    {customButtons?.map((btn, index) => (
      <button
        key={index}
        className={`action-btn ${btn.className || ""}`}
        onClick={(e) => {
          e.stopPropagation();
          btn.onClick();
        }}
        title={btn.title}
      >
        {btn.icon}
      </button>
    ))}
  </div>
);

export const StatusBadge: React.FC<{
  status: "active" | "inactive" | "pending" | "success" | "warning" | "danger";
  text: string;
  showIndicator?: boolean;
}> = ({ status, text, showIndicator = true }) => {
  const getClassName = () => {
    switch (status) {
      case "active":
      case "success":
        return "badge-success";
      case "warning":
      case "pending":
        return "badge-warning";
      case "danger":
      case "inactive":
        return "badge-danger";
      default:
        return "badge-primary";
    }
  };

  return (
    <span
      className={`table-badge ${getClassName()}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
    >
      {showIndicator && (
        <span
          className={`status-indicator ${
            status === "active" || status === "success" ? "active" : "inactive"
          }`}
        />
      )}
      {text}
    </span>
  );
};

export const Badge: React.FC<{
  text: string | number;
  variant?: "primary" | "success" | "warning" | "danger";
}> = ({ text, variant = "primary" }) => (
  <span className={`table-badge badge-${variant}`}>{text}</span>
);
