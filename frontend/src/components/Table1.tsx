// src/components/Table1.tsx
import React, { useState, useMemo } from "react";

// 🎯 Tipos para las columnas
export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  filterType?: "text" | "number" | "select" | "date" | "range" | "boolean";
  filterOptions?: { value: string; label: string }[];
  valueGetter?: (row: T) => any; // Función para obtener el valor de la celda
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
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
  mobileBreakpoint?: "sm" | "md" | "lg";
  // Nuevas props para funcionalidades avanzadas
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  enableGlobalSearch?: boolean;
  globalSearchPlaceholder?: string;
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
  enablePagination = true,
  pageSize: initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  enableGlobalSearch = true,
  globalSearchPlaceholder = "Buscar...",
}: TableProps<T>) {
  // Estados para funcionalidades avanzadas
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(col => col.key));
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Actualizar orden de columnas cuando cambien
  React.useEffect(() => {
    setColumnOrder(columns.map(col => col.key));
  }, [columns]);

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

  // 🔹 Función de ordenamiento
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      if (current?.key === columnKey) {
        return current.direction === "asc"
          ? { key: columnKey, direction: "desc" }
          : null;
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  // 🔹 Función para cambiar filtro de columna
  const handleColumnFilter = (columnKey: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    setCurrentPage(1); // Reset a primera página al filtrar
  };

  // 🔹 Funciones para drag and drop de columnas
  const handleDragStart = (columnKey: string) => {
    setDraggedColumn(columnKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnKey: string) => {
    if (!draggedColumn || draggedColumn === targetColumnKey) return;

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnKey);

    // Mover la columna arrastrada a la nueva posición
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  // Obtener columnas ordenadas
  const orderedColumns = useMemo(() => {
    return columnOrder
      .map(key => columns.find(col => col.key === key))
      .filter((col): col is Column<T> => col !== undefined);
  }, [columnOrder, columns]);

  // 🔹 Función para obtener el valor de una columna (soporte para objetos anidados)
  const getColumnValue = (row: T, column: Column<T>) => {
    // Si hay valueGetter personalizado, usarlo
    if (column.valueGetter) {
      return column.valueGetter(row);
    }
    
    // Soporte para notación de punto (ej: "department.name")
    const keys = column.key.split('.');
    let value: any = row;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        break;
      }
    }
    
    return value;
  };

  // 🔹 Datos procesados (filtrados, ordenados, paginados)
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Aplicar búsqueda global
    if (globalSearch) {
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = getColumnValue(row, col);
          return String(value).toLowerCase().includes(globalSearch.toLowerCase());
        })
      );
    }

    // Aplicar filtros de columna
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((row) => {
          const column = columns.find(col => col.key === key);
          if (!column) return true;
          
          const value = getColumnValue(row, column);
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Aplicar ordenamiento
    if (sortConfig) {
      filtered.sort((a, b) => {
        const column = columns.find(col => col.key === sortConfig.key);
        if (!column) return 0;
        
        const aValue = getColumnValue(a, column);
        const bValue = getColumnValue(b, column);

        if (aValue === bValue) return 0;

        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, globalSearch, columnFilters, sortConfig, columns]);

  // 🔹 Paginación
  const paginatedData = useMemo(() => {
    if (!enablePagination) return processedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize, enablePagination]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // 🔹 Cambiar página
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // 🔹 Cambiar tamaño de página
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <>
      <style>{`
        /* ✨ TABLA FUTURISTA - CON SOPORTE TEMA CLARO */
        .futuristic-table {
          position: relative;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .dark .futuristic-table {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
        }

        .futuristic-table thead {
          position: relative;
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(251, 191, 36, 0.12) 100%);
        }

        .dark .futuristic-table thead {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
        }

        .futuristic-table thead th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgb(180, 83, 9);
          position: relative;
          border-bottom: 2px solid rgba(212, 175, 55, 0.25);
          white-space: nowrap;
          cursor: move;
          transition: all 0.2s ease;
        }

        .dark .futuristic-table thead th {
          color: rgb(212, 175, 55);
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
        }

        .futuristic-table thead th:hover {
          background-color: rgba(212, 175, 55, 0.08);
        }

        .dark .futuristic-table thead th:hover {
          background-color: rgba(212, 175, 55, 0.1);
        }

        .futuristic-table thead th.dragging {
          opacity: 0.5;
          background-color: rgba(212, 175, 55, 0.15);
        }

        .dark .futuristic-table thead th.dragging {
          opacity: 0.5;
          background-color: rgba(212, 175, 55, 0.2);
        }

        .sortable-header {
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sortable-header:hover {
          color: rgb(161, 98, 7);
        }

        .dark .sortable-header:hover {
          color: rgb(251, 191, 36);
        }

        .sort-icon {
          font-size: 0.75rem;
          opacity: 0.5;
        }

        .sort-icon.active {
          opacity: 1;
          color: rgb(180, 83, 9);
        }

        .dark .sort-icon.active {
          opacity: 1;
          color: rgb(251, 191, 36);
        }

        .column-filter {
          margin-top: 0.5rem;
          width: 100%;
        }

        .column-filter input,
        .column-filter select {
          width: 100%;
          padding: 0.375rem 0.5rem;
          font-size: 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid rgba(209, 213, 219, 0.8);
          background-color: white;
          color: rgb(31, 41, 55);
          transition: all 0.2s;
        }

        .dark .column-filter input,
        .dark .column-filter select {
          background-color: rgba(17, 24, 39, 0.8);
          color: rgb(229, 231, 235);
          border-color: rgba(75, 85, 99, 0.5);
        }

        .column-filter input:focus,
        .column-filter select:focus {
          outline: none;
          border-color: rgb(212, 175, 55);
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }

        .column-filter input::placeholder {
          color: rgb(107, 114, 128);
          font-size: 0.7rem;
        }

        .futuristic-table thead th::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.8), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .futuristic-table tbody tr {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.6);
          border-bottom: 1px solid rgba(156, 163, 175, 0.15);
        }

        .dark .futuristic-table tbody tr {
          background: rgba(15, 23, 42, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .futuristic-table tbody tr:hover {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.08) 100%);
          transform: translateX(4px);
          box-shadow: -4px 0 0 0 rgba(212, 175, 55, 0.4), 0 4px 20px 0 rgba(212, 175, 55, 0.1);
        }

        .dark .futuristic-table tbody tr:hover {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%);
          box-shadow: -4px 0 0 0 rgba(212, 175, 55, 0.6), 0 4px 20px 0 rgba(212, 175, 55, 0.15);
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

        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(243, 244, 246, 0.9);
          border-top: 2px solid rgba(156, 163, 175, 0.3);
          border-radius: 0 0 12px 12px;
          margin-top: -12px;
        }

        .dark .pagination-container {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.7) 100%);
          border-top: 2px solid rgba(212, 175, 55, 0.3);
        }

        .pagination-info {
          font-size: 0.875rem;
          color: rgb(75, 85, 99);
        }

        .dark .pagination-info {
          color: rgb(156, 163, 175);
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid rgba(209, 213, 219, 0.8);
          background-color: white;
          color: rgb(55, 65, 81);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dark .pagination-btn {
          border: 1px solid rgba(75, 85, 99, 0.5);
          background-color: rgba(31, 41, 55, 0.8);
          color: rgb(229, 231, 235);
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: rgba(212, 175, 55, 0.15);
          border-color: rgb(212, 175, 55);
        }

        .dark .pagination-btn:hover:not(:disabled) {
          background-color: rgba(59, 130, 246, 0.2);
          border-color: rgb(59, 130, 246);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-btn.active {
          background-color: rgb(212, 175, 55);
          color: white;
          border-color: rgb(212, 175, 55);
          font-weight: 600;
        }

        .page-size-selector {
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid rgba(209, 213, 219, 0.8);
          background-color: white;
          color: rgb(55, 65, 81);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .dark .page-size-selector {
          border: 1px solid rgba(75, 85, 99, 0.5);
          background-color: rgba(31, 41, 55, 0.8);
          color: rgb(229, 231, 235);
        }

        .global-search {
          margin-bottom: 1rem;
        }

        .global-search input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(209, 213, 219, 0.8);
          background-color: white;
          color: rgb(31, 41, 55);
          transition: all 0.2s;
        }

        .dark .global-search input {
          background-color: rgba(17, 24, 39, 0.8);
          color: rgb(229, 231, 235);
          border-color: rgba(75, 85, 99, 0.5);
        }

        .global-search input:focus {
          outline: none;
          border-color: rgb(212, 175, 55);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
        }

        .global-search input::placeholder {
          color: rgb(107, 114, 128);
        }

        .mobile-card {
          position: relative;
          background: linear-gradient(to bottom right, rgba(249, 250, 251, 1), rgba(212, 175, 55, 1));
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid rgba(212, 175, 55, 1);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .dark .mobile-card {
          background: linear-gradient(to bottom right, rgba(212, 175, 55, 1), rgba(17, 24, 39, 1));
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

        .badge-info {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.3));
          color: rgb(37, 99, 235);
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .dark .badge-info {
          color: rgb(147, 197, 253);
          border: 1px solid rgba(59, 130, 246, 0.5);
        }

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

          .pagination-container {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>

      {/* ✨ BÚSQUEDA GLOBAL */}
      {enableGlobalSearch && (
        <div className="global-search">
          <input
            type="text"
            placeholder={globalSearchPlaceholder}
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* ✨ TABLA DESKTOP */}
      <div
        className={`${desktopClass} table-container overflow-x-auto ${className}`}
      >
        <table className="futuristic-table w-full">
          <thead>
            <tr>
              {orderedColumns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width: column.width,
                    textAlign: column.align || "left",
                    cursor: "move",
                  }}
                  className={`${column.className} ${draggedColumn === column.key ? 'opacity-50' : ''}`}
                  draggable={true}
                  onDragStart={() => handleDragStart(column.key)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.key)}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className={column.sortable ? "sortable-header" : ""}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span
                        className={`sort-icon ${
                          sortConfig?.key === column.key ? "active" : ""
                        }`}
                      >
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === "asc" ? (
                            "▲"
                          ) : (
                            "▼"
                          )
                        ) : (
                          "⇅"
                        )}
                      </span>
                    )}
                  </div>
                  {column.filterable && (
  <div className="column-filter">

    {/* === SELECT FILTER === */}
    {column.filterType === "select" && column.filterOptions ? (
      <select
        value={columnFilters[column.key] || ""}
        onChange={(e) => handleColumnFilter(column.key, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">Todos</option>
        {column.filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : null}

    {/* === BOOLEAN FILTER === */}
    {column.filterType === "boolean" && (
      <select
        value={columnFilters[column.key] ?? ""}
        onChange={(e) => handleColumnFilter(column.key, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">Todos</option>
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>
    )}

    {/* === DEFAULT INPUT FILTER (text/number/date etc.) === */}
    {column.filterType !== "select" &&
     column.filterType !== "boolean" && (
      <input
        type={column.filterType || "text"}
        placeholder={`Filtrar ${column.header.toLowerCase()}...`}
        value={columnFilters[column.key] || ""}
        onChange={(e) => handleColumnFilter(column.key, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />
    )}

  </div>
)}

                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={orderedColumns.length}>
                  <div className="loading-row">
                    <div className="loading-spinner"></div>
                    <p className="mt-2 text-sm">Cargando datos...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "clickable" : ""}
                >
                  {orderedColumns.map((column) => (
                    <td
                      key={column.key}
                      style={{ textAlign: column.align || "left" }}
                      className={column.className}
                    >
                      {column.render
                        ? column.render(row, index)
                        : getColumnValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={orderedColumns.length}>
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

        {/* ✨ PAGINACIÓN */}
        {enablePagination && processedData.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Mostrando {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, processedData.length)} de{" "}
              {processedData.length} registros
            </div>

            <div className="pagination-controls">
              <select
                className="page-size-selector"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} por página
                  </option>
                ))}
              </select>

              <button
                className="pagination-btn"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                ««
              </button>
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                «
              </button>

              {/* Números de página */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${
                      currentPage === pageNum ? "active" : ""
                    }`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
              <button
                className="pagination-btn"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »»
              </button>
            </div>
          </div>
        )}
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
        ) : paginatedData.length > 0 ? (
          <>
            {paginatedData.map((row, index) => (
              <div
                key={keyExtractor(row)}
                className="mobile-card"
                onClick={() => onRowClick?.(row)}
              >
                <div className="relative z-10">
                  {mobileCardRender ? (
                    mobileCardRender(row, index)
                  ) : (
                    <DefaultMobileCard row={row} columns={columns} />
                  )}
                </div>
              </div>
            ))}

            {/* Paginación móvil */}
            {enablePagination && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
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
  variant?: "primary" | "success" | "warning" | "danger" | "info";
}> = ({ text, variant = "primary" }) => (
  <span className={`table-badge badge-${variant}`}>{text}</span>
);