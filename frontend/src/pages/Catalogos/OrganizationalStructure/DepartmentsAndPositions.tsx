// src/pages/Catalogos/DepartmentsAndPositions.tsx
import React, { useState } from "react";

// Importar los componentes de cada tab
import DepartmentManagement from "../Departments/DepartmentManagement";
import PositionManagement from "../Positions/PositionManagement";

type ViewMode = "departments" | "positions";

export default function DepartmentsAndPositions() {
  const [viewMode, setViewMode] = useState<ViewMode>("departments");

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-5xl mx-auto overflow-x-hidden bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        {/* ============================================ */}
        {/* 🔄 TABS DE NAVEGACIÓN */}
        {/* ============================================ */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode("departments")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                viewMode === "departments"
                  ? "border-b-2 border-blue-600 dark:border-yellow-500 text-blue-700 dark:text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              📁 Departamentos
            </button>
            <button
              onClick={() => setViewMode("positions")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                viewMode === "positions"
                  ? "border-b-2 border-blue-600 dark:border-yellow-500 text-blue-700 dark:text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              👔 Posiciones
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* 📄 CONTENIDO DE LOS TABS */}
        {/* ============================================ */}
        {viewMode === "departments" && <DepartmentManagement />}
        {viewMode === "positions" && <PositionManagement />}
      </div>
    </div>
  );
}
