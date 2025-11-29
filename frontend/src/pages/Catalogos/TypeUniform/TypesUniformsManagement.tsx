// src/pages/Catalogos/TypeUniform/TypesUniformsManagement.tsx
import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import * as XLSX from "xlsx";
import Button from "../../../components/ui/button/Button";
import { Table, Badge, ActionButtons } from "../../../components/Table1";

interface TypeUniform {
  id: number;
  description: string;
}

interface ValidationErrors {
  description?: string[];
}

export default function TypesUniformsManagement() {
  const [typeUniforms, setTypeUniforms] = useState<TypeUniform[]>([]);
  const [form, setForm] = useState<Omit<TypeUniform, "id">>({
    description: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTypeUniforms();
  }, []);

  const fetchTypeUniforms = async () => {
    setLoading(true);
    try {
      const response = await api.get("/uniform-types");
      setTypeUniforms(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de uniforme", error);
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
        const response = await api.put(`/uniform-types/${editingId}`, form);
        setTypeUniforms(
          typeUniforms.map((typeUniform) =>
            typeUniform.id === editingId ? response.data : typeUniform
          )
        );
        setEditingId(null);
      } else {
        const response = await api.post("/uniform-types", form);
        setTypeUniforms([...typeUniforms, response.data]);
      }
      setForm({ description: "" });
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Error al guardar el tipo de uniforme", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (typeUniform: TypeUniform) => {
    setForm({ description: typeUniform.description });
    setEditingId(typeUniform.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (typeUniform: TypeUniform) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${typeUniform.description}"?`)) {
      return;
    }

    try {
      await api.delete(`/uniform-types/${typeUniform.id}`);
      setTypeUniforms(typeUniforms.filter((tu) => tu.id !== typeUniform.id));
    } catch (error) {
      console.error("Error al eliminar el tipo de uniforme", error);
      alert("Error al eliminar. Por favor intenta de nuevo.");
    }
  };

  const handleCancelEdit = () => {
    setForm({ description: "" });
    setEditingId(null);
    setErrors({});
  };

  const filteredTypeUniforms = typeUniforms.filter((typeUniform) =>
    typeUniform.description.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredTypeUniforms.map((typeUniform) => ({
        ID: typeUniform.id,
        Descripción: typeUniform.description,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tipos de Uniforme");
    XLSX.writeFile(wb, "tipos_uniforme.xlsx");
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "100px",
      align: "center" as const,
      render: (row: TypeUniform) => <Badge text={`#${row.id}`} variant="primary" />,
    },
    {
      key: "description",
      header: "Descripción",
      align: "center" as const,
      render: (row: TypeUniform) => (
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
      render: (row: TypeUniform) => (
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
            Gestión de Tipos de Uniforme
          </h1>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 sm:mb-8 space-y-4"
          data-tour="typeuniform-form"
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
                Editando tipo de uniforme #{editingId}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
              Descripción del Tipo de Uniforme:
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              placeholder="Ej. CAMISA, PANTALÓN, CHAMARRA, BOTAS..."
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
              placeholder="Buscar tipo de uniforme..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-tour="typeuniform-search"
            />
            <div className="flex gap-2 sm:gap-3" data-tour="typeuniform-export">
              <Button
                onClick={exportExcel}
                theme="download"
                text="Excel"
                size="clamp(0.75rem, 2vw, 0.85rem)"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredTypeUniforms.length} de {typeUniforms.length}{" "}
            {typeUniforms.length === 1 ? "tipo de uniforme" : "tipos de uniforme"}
          </div>
        </div>

        {/* TABLA */}
        <div data-tour="typeuniform-table">
          <Table
            data={filteredTypeUniforms}
            columns={columns}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="No hay tipos de uniforme registrados"
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