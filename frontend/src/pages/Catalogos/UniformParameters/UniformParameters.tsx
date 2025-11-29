// src/pages/Catalogos/UniformParameters/UniformParameters.tsx
import React, { useState } from "react";

// Importar los componentes de cada tab
import ColorManagement from "../Color/ColorManagement";
import SizeManagement from "../Size/SizeManagement";
import BodyPartManagement from "../BodyParts/BodyPartManagement";
import TypesUniformsManagement from "../TypeUniform/TypesUniformsManagement";

type ViewMode = "colors" | "sizes" | "bodyParts" | "typeUniforms";

export default function UniformParameters() {
  const [viewMode, setViewMode] = useState<ViewMode>("colors");

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-5xl mx-auto overflow-x-hidden bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        
        {/* ============================================ */}
        {/* 🔄 TABS DE NAVEGACIÓN */}
        {/* ============================================ */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode("colors")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                viewMode === "colors"
                  ? "border-b-2 border-blue-600 dark:border-yellow-500 text-blue-700 dark:text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🎨 Colores
            </button>
            
            <button
              onClick={() => setViewMode("sizes")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                viewMode === "sizes"
                  ? "border-b-2 border-blue-600 dark:border-yellow-500 text-blue-700 dark:text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              📏 Tallas
            </button>
            
            <button
              onClick={() => setViewMode("bodyParts")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                viewMode === "bodyParts"
                  ? "border-b-2 border-blue-600 dark:border-yellow-500 text-blue-700 dark:text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🦴 Partes Corporales
            </button>
            
            <button
              onClick={() => setViewMode("typeUniforms")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                viewMode === "typeUniforms"
                  ? "border-b-2 border-blue-600 dark:border-yellow-500 text-blue-700 dark:text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              👕 Tipos de Uniforme
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* 📄 CONTENIDO DE LOS TABS */}
        {/* ============================================ */}
        {viewMode === "colors" && <ColorManagement />}
        {viewMode === "sizes" && <SizeManagement />}
        {viewMode === "bodyParts" && <BodyPartManagement />}
        {viewMode === "typeUniforms" && <TypesUniformsManagement />}
      </div>
    </div>
  );
}