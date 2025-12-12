// src/pages/Catalogos/Departments/DepartmentManagement.tsx
// IMPLEMENTACIÓN COMPLETA CON DRIVER.JS

import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import * as XLSX from "xlsx";
import Button from "../../../components/ui/button/Button";
import { Table, Badge, ActionButtons } from "../../../components/Table1";

// 🎯 Importar Driver.js
// import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../../../styles/driver-custom.css"; // Tu CSS personalizado
import { getDepartmentDriverSteps } from "./departmentDriverSteps";
import FeedbackButton from "../../../components/FeedbackButton";

interface Department {
  id: number;
  name: string;
}

interface ValidationErrors {
  name?: string[];
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<Omit<Department, "id">>({
    name: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // 🎯 TOUR GUIADO
  useEffect(() => {
    // Verificar si el usuario ya vio el tour
    const hasSeenTour =
      localStorage.getItem("tour_departments_completed") === "true";

    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500); // Esperar 1.5 segundos para que cargue el contenido

      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    const tour = getDepartmentDriverSteps();
    tour.drive();
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error al obtener departamentos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm({ name: value.toUpperCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (editingId) {
        const response = await api.put(`/departments/${editingId}`, form);
        setDepartments(
          departments.map((dept) =>
            dept.id === editingId ? response.data : dept
          )
        );
        setEditingId(null);
      } else {
        const response = await api.post("/departments", form);
        setDepartments([...departments, response.data]);
      }
      setForm({ name: "" });
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Error al guardar departamento", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setForm({ name: dept.name });
    setEditingId(dept.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setForm({ name: "" });
    setEditingId(null);
    setErrors({});
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredDepartments.map((dept) => ({
        ID: dept.id,
        Nombre: dept.name,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Departamentos");
    XLSX.writeFile(wb, "departamentos.xlsx");
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "100px",
      align: "center" as const,
      sortable: true,
      render: (row: Department) => (
        <Badge text={`#${row.id}`} variant="primary" />
      ),
    },
    {
      key: "name",
      header: "Nombre del Departamento",
      align: "center" as const,
      sortable: true,
      render: (row: Department) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.name}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "150px",
      align: "center" as const,
      render: (row: Department) => (
        <ActionButtons onEdit={() => handleEdit(row)} />
      ),
    },
  ];

  return (
    <>
      <FeedbackButton
        moduleName="Gestión de Departamentos"
        moduleUrl="/catalogos/departamentos"
      />
      <div data-tour="bodyForm">
        {/* Header con botón de tutorial */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500">
            Gestión de Departamentos
          </h1>

          <button
            onClick={startTour}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            title="Ver tutorial"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline">Tutorial</span>
          </button>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 sm:mb-8 space-y-4"
          data-tour="department-form"
        >
          {editingId && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Editando departamento #{editingId}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Departamento:
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              placeholder="Ej. RECURSOS HUMANOS, FINANZAS..."
              required
            />
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                {errors.name.join(", ")}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleSubmit}
              theme={editingId ? "update" : "add"}
              text={editingId ? "Actualizar" : "Agregar"}
              loading={loading}
              loadingText={editingId ? "Actualizando..." : "Agregando..."}
            />
            {editingId && (
              <Button
                onClick={handleCancelEdit}
                theme="close"
                text="Cancelar"
              />
            )}
          </div>
        </form>

        {/* BÚSQUEDA Y EXPORTACIÓN */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar departamento..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-tour="department-search"
            />
            <div className="flex gap-2 sm:gap-3" data-tour="department-export">
              <Button
                onClick={exportExcel}
                theme="download"
                text="Excel"
                size="clamp(0.75rem, 2vw, 0.85rem)"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredDepartments.length} de {departments.length}{" "}
            {departments.length === 1 ? "departamento" : "departamentos"}
          </div>
        </div>

        {/* TABLA */}
        <div data-tour="department-table">
          <Table
            data={filteredDepartments}
            columns={columns}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="No hay departamentos registrados"
            mobileBreakpoint="md"
            mobileCardRender={(row) => (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge text={`#${row.id}`} variant="primary" />
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {row.name}
                </p>
                <ActionButtons onEdit={() => handleEdit(row)} />
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
}
