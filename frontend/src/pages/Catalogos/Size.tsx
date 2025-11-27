// src/pages/Catalogos/Size.tsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import * as XLSX from "xlsx";
import Button from "../../components/ui/button/Button";
import { useToast } from "../../components/Toast";
import { Table, Badge, StatusBadge } from "../../components/Table1";

interface Sexe {
  id: number;
  name: string;
}

interface BodyPart {
  id: number;
  description: string;
}

interface Size {
  id: number;
  description: string;
  sexe_id: number;
  body_part_id: number;
  status: boolean;
  sexe?: Sexe;
  body_part?: BodyPart;
}

interface ValidationErrors {
  description?: string[];
  sexe_id?: string[];
  body_part_id?: string[];
  status?: string[];
}

export default function Tallas() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sexes, setSexes] = useState<Sexe[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [form, setForm] = useState<Omit<Size, "id">>({
    description: "",
    sexe_id: 0,
    body_part_id: 0,
    status: true,
  });
  const [errors, setErrors] = useState<ValidationErrors>(
    {} as ValidationErrors
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✅ Hook para las notificaciones
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchSizes();
    fetchSexes();
    fetchBodyParts();
  }, []);

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/sizes");
      setSizes(response.data);
    } catch (error) {
      console.error("Error al obtener las tallas", error);
      showToast("Error al cargar las tallas", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSexes = async () => {
    try {
      const response = await api.get("/sexes");
      setSexes(response.data);
    } catch (error) {
      console.error("Error al obtener los sexos", error);
      showToast("Error al cargar los sexos", "error");
    }
  };

  const fetchBodyParts = async () => {
    try {
      const response = await api.get("/body-parts");
      setBodyParts(response.data);
    } catch (error) {
      console.error("Error al obtener las partes corporales", error);
      showToast("Error al cargar las partes corporales", "error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : name === "description"
          ? value.toUpperCase()
          : name === "sexe_id" || name === "body_part_id"
          ? parseInt(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({} as ValidationErrors);

    try {
      if (editingId) {
        const response = await api.put(`/sizes/${editingId}`, form);
        setSizes(
          sizes.map((size) => (size.id === editingId ? response.data : size))
        );
        setEditingId(null);
        showToast("Talla actualizada exitosamente", "success");
      } else {
        const response = await api.post("/sizes", form);

        // ✅ Verificar si se crearon dos registros (AMBOS)
        if (
          response.data.data &&
          response.data.data.femenino &&
          response.data.data.masculino
        ) {
          setSizes([
            ...sizes,
            response.data.data.femenino,
            response.data.data.masculino,
          ]);
          showToast(
            "Tallas creadas para FEMENINO y MASCULINO exitosamente",
            "success"
          );
        } else {
          setSizes([...sizes, response.data]);
          showToast("Talla agregada exitosamente", "success");
        }
      }

      setForm({
        description: "",
        sexe_id: 0,
        body_part_id: 0,
        status: true,
      });

      await fetchSizes();
    } catch (error: any) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        showToast(
          error.response.data.message || "Error de validación",
          "error"
        );
      } else {
        console.error("Error al guardar la talla", error);
        showToast(
          error.response?.data?.message || "Error al guardar la talla",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      description: "",
      sexe_id: 0,
      body_part_id: 0,
      status: true,
    });
    setEditingId(null);
    setErrors({});
    showToast("Edición cancelada", "info");
  };

  const filteredSizes = sizes.filter(
    (size) =>
      size.description.toLowerCase().includes(search.toLowerCase()) ||
      size.sexe?.name.toLowerCase().includes(search.toLowerCase()) ||
      size.body_part?.description.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredSizes.map((size) => ({
          ID: size.id,
          Descripción: size.description,
          Sexo: size.sexe?.name || "N/A",
          "Parte Corporal": size.body_part?.description || "N/A",
          Estatus: size.status ? "Activo" : "Inactivo",
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tallas");
      XLSX.writeFile(wb, "tallas.xlsx");
      showToast("Archivo Excel exportado exitosamente", "success");
    } catch (error) {
      console.error("Error al exportar Excel", error);
      showToast("Error al exportar el archivo Excel", "error");
    }
  };

  // ✅ CORRECCIÓN 1: Filtrar sexos - ocultar "AMBOS" cuando estamos editando
  const availableSexes = editingId
    ? sexes.filter((sex) => sex.name.toUpperCase() !== "AMBOS")
    : sexes;

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      align: "center" as const,
      render: (row: Size) => <Badge text={`#${row.id}`} variant="primary" />,
    },
    {
      key: "description",
      header: "Descripción",
      align: "center" as const,
      render: (row: Size) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.description}
        </span>
      ),
    },
    {
      key: "sexe",
      header: "Sexo",
      align: "center" as const,
      render: (row: Size) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.sexe?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "body_part",
      header: "Parte Corporal",
      align: "center" as const,
      render: (row: Size) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.body_part?.description || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estatus",
      width: "120px",
      align: "center" as const,
      render: (row: Size) => (
        <StatusBadge
          status={row.status ? "active" : "inactive"}
          text={row.status ? "Activo" : "Inactivo"}
          showIndicator={true}
        />
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* ✅ CORRECCIÓN 2: Componente de Toast */}
      {ToastComponent}

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500 mb-4 sm:mb-6">
          Tallas
        </h1>

        <form onSubmit={handleSubmit} className="mb-6 sm:mb-8 space-y-4">
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
                Editando registro #{editingId}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Descripción: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                placeholder="Ej. S, M, L, XL, 28, 30..."
              />
              {errors.description && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.description.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Sexo: <span className="text-red-500">*</span>
              </label>
              <select
                name="sexe_id"
                value={form.sexe_id}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              >
                <option value={0}>Seleccione un sexo</option>
                {/* ✅ CORRECCIÓN 1 APLICADA: usar availableSexes en lugar de sexes */}
                {availableSexes.map((sexo) => (
                  <option key={sexo.id} value={sexo.id}>
                    {sexo.name}
                  </option>
                ))}
              </select>
              {errors.sexe_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.sexe_id.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Parte Corporal: <span className="text-red-500">*</span>
              </label>
              <select
                name="body_part_id"
                value={form.body_part_id}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              >
                <option value={0}>Seleccione una parte corporal </option>
                {bodyParts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.description}
                  </option>
                ))}
              </select>
              {errors.body_part_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.body_part_id.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="status"
              checked={form.status}
              onChange={handleChange}
              className="accent-blue-500 w-4 h-4 sm:w-5 sm:h-5"
            />
            <label className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Activo
            </label>
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

        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por descripción, sexo o parte corporal..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={exportExcel}
                theme="download"
                text="Excel"
                size="clamp(0.75rem, 2vw, 0.85rem)"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredSizes.length} de {sizes.length}{" "}
            {filteredSizes.length === 1 ? "registro" : "registros"}
          </div>
        </div>

        <Table
          data={filteredSizes}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No hay tallas registradas"
          mobileBreakpoint="md"
          mobileCardRender={(row) => (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Badge text={`#${row.id}`} variant="primary" />
                <StatusBadge
                  status={row.status ? "active" : "inactive"}
                  text={row.status ? "Activo" : "Inactivo"}
                  showIndicator={true}
                />
              </div>
              <div className="space-y-2">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {row.description}
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Sexo:</span>{" "}
                    {row.sexe?.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Parte Corporal:</span>{" "}
                    {row.body_part?.description || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
