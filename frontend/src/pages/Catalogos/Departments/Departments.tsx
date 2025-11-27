// src/pages/Catalogos/Departments.tsx
// 🎯 PÁGINA STANDALONE - Puede usarse de forma independiente
import React from "react";
import DepartmentManagement from "./DepartmentManagement";

export default function Departments() {
  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        <DepartmentManagement />
      </div>
    </div>
  );
}
