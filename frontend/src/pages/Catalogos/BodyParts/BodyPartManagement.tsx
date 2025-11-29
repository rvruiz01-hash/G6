// src/pages/Catalogos/BodyParts/BodyPartManagement.tsx
import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import * as XLSX from "xlsx";
import Button from "../../../components/ui/button/Button";
import { Table, Badge, ActionButtons } from "../../../components/Table1";

interface BodyPart {
  id: number;
  description: string;
}

interface ValidationErrors {
  description?: string[];
}

export default function BodyPartManagement() {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [form, setForm] = useState<Omit<BodyPart, "id">>({
    description: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBodyParts();
  }, []);

  const fetchBodyParts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/body-parts");
      setBodyParts(response.data);
    } catch (error) {
      console.error("Error al obtener las partes corporales", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm({ description: value.toUpperCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (editingId) {
        const response = await api.put(`/body-parts/${editingId}`, form);
        setBodyParts(
          bodyParts.map((bodyPart) =>
            bodyPart.id === editingId ? response.data : bodyPart
          )
        );
        setEditingId(null);
      } else {
        const response = await api.post("/body-parts", form);
        setBodyParts([...bodyParts, response.data]);
      }
      setForm({ description: "" });
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Error al guardar la parte corporal", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bodyPart: BodyPart) => {
    setForm({ description: bodyPart.description });
    setEditingId(bodyPart.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (bodyPart: BodyPart) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${bodyPart.description}"?`)) {
      return;
    }

    try {
      await api.delete(`/body-parts/${bodyPart.id}`);
      setBodyParts(bodyParts.filter((bp) => bp.id !== bodyPart.id));
    } catch (error) {
      console.error("Error al eliminar la parte corporal", error);
      alert("Error al eliminar. Por favor intenta de nuevo.");
    }
  };

  const handleCancelEdit = () => {
    setForm({ description: "" });
    setEditingId(null);
    setErrors({});
  };

  const filteredBodyParts = bodyParts.filter((bodyPart) =>
    bodyPart.description.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredBodyParts.map((bodyPart) => ({
        ID: bodyPart.id,
        Descripción: bodyPart.description,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partes Corporales");
    XLSX.writeFile(wb, "partes_corporales.xlsx");
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "100px",
      align: "center" as const,
      render: (row: BodyPart) => <Badge text={`#${row.id}`} variant="primary" />,
    },
    {
      key: "description",
      header: "Descripción",
      align: "center" as const,
      render: (row: BodyPart) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.description}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "150px",
      align: "center" as const,
      render: (row: BodyPart) => (
        <ActionButtons
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ];

  return (
    <>
      <div data-tour="bodyForm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500">
            Gestión de Partes Corporales
          </h1>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 sm:mb-8 space-y-4"
          data-tour="bodypart-form"
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
                Editando parte corporal #{editingId}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
              Descripción de la Parte Corporal:
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              placeholder="Ej. CABEZA, TORSO, PIERNAS, PIES..."
              required
            />
            {errors.description && (
              <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                {errors.description.join(", ")}
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
              placeholder="Buscar parte corporal..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-tour="bodypart-search"
            />
            <div className="flex gap-2 sm:gap-3" data-tour="bodypart-export">
              <Button
                onClick={exportExcel}
                theme="download"
                text="Excel"
                size="clamp(0.75rem, 2vw, 0.85rem)"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredBodyParts.length} de {bodyParts.length}{" "}
            {bodyParts.length === 1 ? "parte corporal" : "partes corporales"}
          </div>
        </div>

        {/* TABLA */}
        <div data-tour="bodypart-table">
          <Table
            data={filteredBodyParts}
            columns={columns}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="No hay partes corporales registradas"
            mobileBreakpoint="md"
            mobileCardRender={(row) => (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge text={`#${row.id}`} variant="primary" />
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {row.description}
                </p>
                <ActionButtons
                  onEdit={() => handleEdit(row)}
                  onDelete={() => handleDelete(row)}
                />
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
}