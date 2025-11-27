// src/pages/Catalogos/TypesUniforms.tsx
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import * as XLSX from "xlsx";
import Button from "../../components/ui/button/Button";
import { useToast } from "../../components/Toast";
import {
  Table,
  Badge,
  StatusBadge,
  ActionButtons,
} from "../../components/Table1";

interface BodyPart {
  id: number;
  description: string;
}

interface BusinessLine {
  id: number;
  description: string;
}

interface Sex {
  id: number;
  name: string;
}

interface Color {
  id: number;
  description: string;
}

interface UniformType {
  id: number;
  description: string;
  body_part_id: number;
  business_line_id: number;
  sexe_id: number;
  color_id: number;
  status: boolean;
  body_part?: BodyPart;
  business_line?: BusinessLine;
  sexe?: Sex;
  color?: Color;
}

interface ValidationErrors {
  description?: string[];
  body_part_id?: string[];
  business_line_id?: string[];
  sexe_id?: string[];
  color_id?: string[];
  status?: string[];
}

export default function TiposDeUniformes() {
  const [uniformTypes, setUniformTypes] = useState<UniformType[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [sexes, setSexes] = useState<Sex[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const [form, setForm] = useState<Omit<UniformType, "id">>({
    description: "",
    body_part_id: 0,
    business_line_id: 0,
    sexe_id: 0,
    color_id: 0,
    status: true,
  });

  const [errors, setErrors] = useState<ValidationErrors>(
    {} as ValidationErrors
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchUniformTypes();
    fetchBodyParts();
    fetchBusinessLines();
    fetchSexes();
    fetchColors();
  }, []);

  const fetchUniformTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/uniform-types");
      setUniformTypes(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de uniformes", error);
      showToast("Error al cargar los tipos de uniformes", "error");
    } finally {
      setLoading(false);
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

  const fetchBusinessLines = async () => {
    try {
      const response = await api.get("/business-lines");
      setBusinessLines(response.data);
    } catch (error) {
      console.error("Error al obtener las líneas de negocio", error);
      showToast("Error al cargar las líneas de negocio", "error");
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

  const fetchColors = async () => {
    try {
      const response = await api.get("/colors");
      setColors(response.data);
    } catch (error) {
      console.error("Error al obtener los colores", error);
      showToast("Error al cargar los colores", "error");
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
          : name === "body_part_id" ||
            name === "business_line_id" ||
            name === "sexe_id" ||
            name === "color_id"
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
        const response = await api.put(`/uniform-types/${editingId}`, form);
        setUniformTypes(
          uniformTypes.map((type) =>
            type.id === editingId ? response.data : type
          )
        );
        setEditingId(null);
        showToast("Tipo de uniforme actualizado exitosamente", "success");
      } else {
        const response = await api.post("/uniform-types", form);
        setUniformTypes([...uniformTypes, response.data]);
        showToast("Tipo de uniforme agregado exitosamente", "success");
      }

      setForm({
        description: "",
        body_part_id: 0,
        business_line_id: 0,
        sexe_id: 0,
        color_id: 0,
        status: true,
      });

      await fetchUniformTypes();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        showToast(
          error.response.data.message || "Error de validación",
          "error"
        );
      } else {
        console.error("Error al guardar el tipo de uniforme", error);
        showToast(
          error.response?.data?.message ||
            "Error al guardar el tipo de uniforme",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (uniformType: UniformType) => {
    setForm({
      description: uniformType.description,
      body_part_id: uniformType.body_part_id,
      business_line_id: uniformType.business_line_id,
      sexe_id: uniformType.sexe_id,
      color_id: uniformType.color_id,
      status: uniformType.status,
    });
    setEditingId(uniformType.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (uniformType: UniformType) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar "${uniformType.description}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/uniform-types/${uniformType.id}`);
      setUniformTypes(uniformTypes.filter((t) => t.id !== uniformType.id));
      showToast("Tipo de uniforme eliminado exitosamente", "success");
    } catch (error: any) {
      console.error("Error al eliminar el tipo de uniforme", error);
      showToast(
        error.response?.data?.message ||
          "Error al eliminar el tipo de uniforme",
        "error"
      );
    }
  };

  const handleCancelEdit = () => {
    setForm({
      description: "",
      body_part_id: 0,
      business_line_id: 0,
      sexe_id: 0,
      color_id: 0,
      status: true,
    });
    setEditingId(null);
    setErrors({});
    showToast("Edición cancelada", "info");
  };

  const filteredUniformTypes = uniformTypes.filter(
    (uniformType) =>
      (uniformType.description || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (uniformType.body_part?.description || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (uniformType.business_line?.description || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (uniformType.sexe?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) || // 👈 SOLUCIÓN CLAVE AQUÍ
      (uniformType.color?.description || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredUniformTypes.map((uniformType) => ({
          ID: uniformType.id,
          Descripción: uniformType.description,
          "Parte Corporal": uniformType.body_part?.description || "N/A",
          "Línea de Negocio": uniformType.business_line?.description || "N/A",
          Sexo: uniformType.sexe?.name || "N/A",
          Color: uniformType.color?.description || "N/A",
          Estatus: uniformType.status ? "Activo" : "Inactivo",
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tipos de Uniformes");
      XLSX.writeFile(wb, "tipos_de_uniformes.xlsx");
      showToast("Archivo Excel exportado exitosamente", "success");
    } catch (error) {
      console.error("Error al exportar Excel", error);
      showToast("Error al exportar el archivo Excel", "error");
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      align: "center" as const,
      render: (row: UniformType) => (
        <Badge text={`#${row.id}`} variant="primary" />
      ),
    },
    {
      key: "description",
      header: "Descripción",
      align: "center" as const,
      render: (row: UniformType) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.description}
        </span>
      ),
    },
    {
      key: "body_part",
      header: "Parte Corporal",
      align: "center" as const,
      render: (row: UniformType) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.body_part?.description || "N/A"}
        </span>
      ),
    },
    {
      key: "business_line",
      header: "Línea de Negocio",
      align: "center" as const,
      render: (row: UniformType) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.business_line?.description || "N/A"}
        </span>
      ),
    },
    {
      key: "sexe",
      header: "Sexo",
      align: "center" as const,
      render: (row: UniformType) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.sexe?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "color",
      header: "Color",
      align: "center" as const,
      render: (row: UniformType) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.color?.description || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estatus",
      width: "120px",
      align: "center" as const,
      render: (row: UniformType) => (
        <StatusBadge
          status={row.status ? "active" : "inactive"}
          text={row.status ? "Activo" : "Inactivo"}
          showIndicator={true}
        />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "150px",
      align: "center" as const,
      render: (row: UniformType) => (
        <ActionButtons
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {ToastComponent}

      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500 mb-4 sm:mb-6">
          Tipos de Uniformes
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Descripción */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Descripción: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                placeholder="Ej. CAMISA EJECUTIVA, PANTALÓN OPERATIVO..."
              />
              {errors.description && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.description.join(", ")}
                </p>
              )}
            </div>

            {/* Línea de Negocio */}
            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Línea de Negocio: <span className="text-red-500">*</span>
              </label>
              <select
                name="business_line_id"
                value={form.business_line_id}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              >
                <option value={0}>Seleccione una línea de negocio</option>
                {businessLines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.description}
                  </option>
                ))}
              </select>
              {errors.business_line_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.business_line_id.join(", ")}
                </p>
              )}
            </div>

            {/* Sexo */}
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
                {sexes.map((sex) => (
                  <option key={sex.id} value={sex.id}>
                    {sex.name}
                  </option>
                ))}
              </select>
              {errors.sexe_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.sexe_id.join(", ")}
                </p>
              )}
            </div>

            {/* Parte Corporal */}
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
                <option value={0}>Seleccione una parte corporal</option>
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

            {/* Color */}
            <div>
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Color: <span className="text-red-500">*</span>
              </label>
              <select
                name="color_id"
                value={form.color_id}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              >
                <option value={0}>Seleccione un color</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.description}
                  </option>
                ))}
              </select>
              {errors.color_id && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.color_id.join(", ")}
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

        {/* Barra de búsqueda y exportar */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por descripción, parte corporal, línea de negocio, sexo o color..."
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
            Mostrando {filteredUniformTypes.length} de {uniformTypes.length}{" "}
            {filteredUniformTypes.length === 1 ? "registro" : "registros"}
          </div>
        </div>

        {/* Tabla */}
        <Table
          data={filteredUniformTypes}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No hay tipos de uniformes registrados"
          mobileBreakpoint="lg"
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
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    <span className="font-medium">Parte Corporal:</span>{" "}
                    {row.body_part?.description || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Línea de Negocio:</span>{" "}
                    {row.business_line?.description || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Sexo:</span>{" "}
                    {row.sexe?.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Color:</span>{" "}
                    {row.color?.description || "N/A"}
                  </p>
                </div>
              </div>
              <ActionButtons
                onEdit={() => handleEdit(row)}
                onDelete={() => handleDelete(row)}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
