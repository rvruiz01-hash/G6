// src/pages/Catalogos/PositionManagement.tsx
import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import * as XLSX from "xlsx";
import Button from "../../../components/ui/button/Button";

import { Table, Badge, ActionButtons } from "../../../components/Table1";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../../../styles/driver-custom.css";
import { getPositionDriverSteps } from "./PositionDriverSteps";

interface Department {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
  level: number;
  reports_to_position_id: number | null;
  business_line_id: number;
  department_id: number;
  department?: Department;
  reports_to?: Position;
  business_line?: {
    id: number;
    name: string;
  };
}

interface BusinessLine {
  id: number;
  name: string;
  status: boolean;
}

interface ValidationErrors {
  name?: string[];
  level?: string[];
  business_line_id?: string[];
  department_id?: string[];
  reports_to_position_id?: string[];
}

export default function PositionManagement() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);

  // ✅ NUEVO: Estado para posiciones filtradas por línea de negocio
  const [availablePositionsForReportsTo, setAvailablePositionsForReportsTo] =
    useState<Position[]>([]);

  const [form, setForm] = useState<Omit<Position, "id">>({
    name: "",
    level: 1,
    reports_to_position_id: null,
    business_line_id: 0,
    department_id: 0,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number | null>(
    null
  );

  // 🎯 TOUR GUIADO
  useEffect(() => {
    const hasSeenTour =
      localStorage.getItem("tour_positions_completed") === "true";

    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    const tour = getPositionDriverSteps();
    tour.drive();
  };

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
    fetchBusinessLines();
  }, []);

  // ✅ NUEVO: Efecto para cargar posiciones cuando cambia la línea de negocio
  useEffect(() => {
    if (form.business_line_id > 0) {
      fetchPositionsByBusinessLine(form.business_line_id);
    } else {
      setAvailablePositionsForReportsTo([]);
    }
  }, [form.business_line_id, editingId]);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/positions");
      console.log("Positions Response:", response.data);
      setPositions(response.data);
    } catch (error) {
      console.error("Error al obtener posiciones", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error al obtener departamentos", error);
    }
  };

  const fetchBusinessLines = async () => {
    try {
      const response = await api.get("/business-lines");
      setBusinessLines(response.data);
    } catch (error) {
      console.error("Error al obtener líneas de negocio", error);
    }
  };

  // ✅ NUEVO: Función para obtener posiciones filtradas por línea de negocio
  const fetchPositionsByBusinessLine = async (businessLineId: number) => {
    try {
      const params: any = { business_line_id: businessLineId };

      // Si estamos editando, excluir la posición actual
      if (editingId) {
        params.exclude_position_id = editingId;
      }

      const response = await api.get("/positions/by-business-line/list", {
        params,
      });

      setAvailablePositionsForReportsTo(response.data);
    } catch (error) {
      console.error("Error al obtener posiciones por línea de negocio", error);
      setAvailablePositionsForReportsTo([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // ✅ MEJORADO: Cuando cambia la línea de negocio, resetear "Reporta a"
    if (name === "business_line_id") {
      setForm({
        ...form,
        business_line_id: value === "" ? 0 : Number(value),
        reports_to_position_id: null, // Resetear supervisor
      });
      return;
    }

    setForm({
      ...form,
      [name]:
        name === "level" ||
        name === "department_id" ||
        name === "reports_to_position_id"
          ? value === ""
            ? name === "reports_to_position_id"
              ? null
              : 0
            : Number(value)
          : name === "name"
          ? value.toUpperCase()
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        ...form,
        reports_to_position_id: form.reports_to_position_id || null,
      };

      console.log("Submitting payload:", payload);

      if (editingId) {
        const response = await api.put(`/positions/${editingId}`, payload);
        setPositions(
          positions.map((pos) => (pos.id === editingId ? response.data : pos))
        );
        setEditingId(null);
      } else {
        const response = await api.post("/positions", payload);
        setPositions([...positions, response.data]);
      }
      setForm({
        name: "",
        level: 1,
        reports_to_position_id: null,
        business_line_id: 0,
        department_id: 0,
      });

      // Recargar posiciones para obtener relaciones actualizadas
      fetchPositions();
    } catch (error: any) {
      console.error("Error completo:", error);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Error al guardar posición", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pos: Position) => {
    setForm({
      name: pos.name,
      level: pos.level,
      reports_to_position_id: pos.reports_to_position_id,
      business_line_id: pos.business_line_id,
      department_id: pos.department_id,
    });
    setEditingId(pos.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setForm({
      name: "",
      level: 1,
      reports_to_position_id: null,
      business_line_id: 0,
      department_id: 0,
    });
    setEditingId(null);
    setErrors({});
    setAvailablePositionsForReportsTo([]);
  };

  const filteredPositions = positions.filter((pos) => {
    const matchesSearch = pos.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      selectedDeptFilter === null || pos.department_id === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredPositions.map((pos) => ({
        ID: pos.id,
        Nombre: pos.name,
        Nivel: pos.level,
        "Reporta a": pos.reports_to?.name || "N/A",
        "Línea de Negocio": pos.business_line?.name || "N/A",
        Departamento: pos.department?.name || "N/A",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Posiciones");
    XLSX.writeFile(wb, "posiciones.xlsx");
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      align: "center" as const,
      render: (row: Position) => (
        <Badge text={`#${row.id}`} variant="primary" />
      ),
    },
    {
      key: "name",
      header: "Posición",
      align: "left" as const,
      render: (row: Position) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.name}
        </span>
      ),
    },
    {
      key: "level",
      header: "Nivel",
      width: "100px",
      align: "center" as const,
      render: (row: Position) => (
        <Badge text={`Nivel ${row.level}`} variant="info" />
      ),
    },
    {
      key: "department",
      header: "Departamento",
      align: "center" as const,
      render: (row: Position) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.department?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "reports_to",
      header: "Reporta a",
      align: "center" as const,
      render: (row: Position) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 italic">
          {row.reports_to?.name || "—"}
        </span>
      ),
    },
    {
      key: "business_line",
      header: "Línea de Negocio",
      align: "center" as const,
      render: (row: Position) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.business_line?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "150px",
      align: "center" as const,
      render: (row: Position) => (
        <ActionButtons onEdit={() => handleEdit(row)} />
      ),
    },
  ];

  return (
    <>
      <div data-tour="bodyForm">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500 mb-4 sm:mb-6">
            Gestión de Posiciones
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
          data-tour="position-form"
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
                Editando posición #{editingId}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre de la Posición */}
            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la Posición:
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                placeholder="Ej. GERENTE DE VENTAS"
                data-tour="position-form-name"
                required
              />
              {errors.name && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.name.join(", ")}
                </p>
              )}
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Nivel:
              </label>
              <input
                type="number"
                name="level"
                value={form.level}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                data-tour="position-form-level"
                required
              />
              {errors.level && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.level.join(", ")}
                </p>
              )}
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Departamento:
              </label>
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                required
                data-tour="position-form-department"
              >
                <option value={0}>Selecciona un departamento</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.department_id.join(", ")}
                </p>
              )}
            </div>

            {/* Línea de Negocio */}
            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Línea de Negocio:
              </label>
              <select
                name="business_line_id"
                value={form.business_line_id}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                required
                data-tour="position-form-business-line"
              >
                <option value={0}>Selecciona una línea de negocio</option>
                {businessLines.map((bl) => (
                  <option key={bl.id} value={bl.id}>
                    {bl.name}
                  </option>
                ))}
              </select>
              {errors.business_line_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.business_line_id.join(", ")}
                </p>
              )}
              {businessLines.length === 0 && (
                <p className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm mt-1">
                  No hay líneas de negocio activas disponibles
                </p>
              )}
            </div>

            {/* ✅ MEJORADO: Reporta a (Solo muestra posiciones de la misma línea de negocio) */}
            <div className="md:col-span-2">
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Reporta a(Jefe):
                {form.business_line_id === 0 && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                    👆 Primero selecciona una línea de negocio
                  </span>
                )}
              </label>
              <select
                name="reports_to_position_id"
                value={form.reports_to_position_id || ""}
                onChange={handleChange}
                disabled={form.business_line_id === 0}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                  form.business_line_id === 0
                    ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
                    : "bg-gray-200 dark:bg-gray-700"
                } text-gray-900 dark:text-gray-100 border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600`}
                data-tour="position-form-reports-to"
              >
                <option value="">Sin supervisor directo</option>
                {availablePositionsForReportsTo.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name} (Nivel {pos.level}) - {pos.department?.name}
                  </option>
                ))}
              </select>
              {errors.reports_to_position_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.reports_to_position_id.join(", ")}
                </p>
              )}
              {form.business_line_id > 0 &&
                availablePositionsForReportsTo.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                    💡 No hay posiciones disponibles en esta línea de negocio
                    para reportar
                  </p>
                )}
            </div>
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

        {/* BÚSQUEDA Y FILTROS */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar posición..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-tour="position-search"
            />
            <select
              value={selectedDeptFilter || ""}
              onChange={(e) =>
                setSelectedDeptFilter(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              data-tour="position-filter-department"
            >
              <option value="">Todos los departamentos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 sm:gap-3" data-tour="position-export">
              <Button
                onClick={exportExcel}
                theme="download"
                text="Excel"
                size="clamp(0.75rem, 2vw, 0.85rem)"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredPositions.length} de {positions.length}{" "}
            {positions.length === 1 ? "posición" : "posiciones"}
          </div>
        </div>

        {/* TABLA */}
        <div data-tour="position-table">
          <Table
            data={filteredPositions}
            columns={columns}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="No hay posiciones registradas"
            mobileBreakpoint="lg"
            mobileCardRender={(row) => (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <Badge text={`#${row.id}`} variant="primary" />
                  <Badge text={`Nivel ${row.level}`} variant="info" />
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {row.name}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Depto:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {row.department?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Reporta a:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100 italic">
                      {row.reports_to?.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {row.business_line?.name || "N/A"}
                </div>
                <ActionButtons onEdit={() => handleEdit(row)} />
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
}
