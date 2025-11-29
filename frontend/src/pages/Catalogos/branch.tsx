// src/pages/Catalogos/Branch.tsx
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

interface FederalEntity {
  id: string;
  name: string;
  abbreviation: string;
}

interface Branch {
  id: number;
  name: string;
  code: string;
  federal_entity_id: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: boolean;
  federal_entity?: FederalEntity;
}

interface ValidationErrors {
  name?: string[];
  code?: string[];
  federal_entity_id?: string[];
  address?: string[];
  phone?: string[];
  email?: string[];
  status?: string[];
}

export default function Sucursales() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [federalEntities, setFederalEntities] = useState<FederalEntity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    federal_entity_id: "",
    address: "",
    phone: "",
    email: "",
    status: true,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchBranches();
    fetchFederalEntities();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await api.get("/branches");
      setBranches(response.data);
    } catch (error: any) {
      console.error("Error al obtener las sucursales", error);
      if (error.response?.status !== 404) {
        showToast("Error al cargar las sucursales", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFederalEntities = async () => {
    try {
      const response = await api.get("/federal-entities");
      setFederalEntities(response.data);
    } catch (error) {
      console.error("Error al obtener las entidades federativas", error);
      showToast("Error al cargar las entidades federativas", "error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : name === "name" || name === "code"
          ? value.toUpperCase()
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const dataToSend = {
      ...form,
      address: form.address.trim() === "" ? null : form.address,
      phone: form.phone.trim() === "" ? null : form.phone,
      email: form.email.trim() === "" ? null : form.email,
    };

    try {
      if (editingId) {
        const response = await api.put(`/branches/${editingId}`, dataToSend);
        setBranches(
          branches.map((branch) =>
            branch.id === editingId ? response.data : branch
          )
        );
        showToast("Sucursal actualizada exitosamente", "success");
      } else {
        const response = await api.post("/branches", dataToSend);
        setBranches([...branches, response.data]);
        showToast("Sucursal agregada exitosamente", "success");
      }

      handleCloseModal();
      await fetchBranches();
    } catch (error: any) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        showToast(
          error.response.data.message || "Error de validación",
          "error"
        );
      } else {
        console.error("Error al guardar la sucursal", error);
        showToast(
          error.response?.data?.message || "Error al guardar la sucursal",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setForm({
      name: branch.name,
      code: branch.code,
      federal_entity_id: branch.federal_entity_id,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      status: branch.status,
    });
    setEditingId(branch.id);
    setIsReadOnly(true); // 🔒 Bloqueamos los campos
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setForm({
      name: "",
      code: "",
      federal_entity_id: "",
      address: "",
      phone: "",
      email: "",
      status: true,
    });
    setEditingId(null);
    setErrors({});
    setIsReadOnly(false); // 🔒 Desbloqueamos los campos
    setIsModalOpen(false);
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(search.toLowerCase()) ||
      branch.code.toLowerCase().includes(search.toLowerCase()) ||
      branch.federal_entity?.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredBranches.map((branch) => ({
          ID: branch.id,
          Código: branch.code,
          Nombre: branch.name,
          Estado: branch.federal_entity?.name || "N/A",
          Dirección: branch.address || "N/A",
          Teléfono: branch.phone || "N/A",
          Email: branch.email || "N/A",
          Estatus: branch.status ? "Activo" : "Inactiva",
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sucursales");
      XLSX.writeFile(wb, "sucursales.xlsx");
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
      render: (row: Branch) => <Badge text={`#${row.id}`} variant="primary" />,
    },
    {
      key: "code",
      header: "Código",
      width: "120px",
      align: "center" as const,
      render: (row: Branch) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nombre",
      align: "left" as const,
      render: (row: Branch) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.name}
        </span>
      ),
    },

    {
      key: "federal_entity",
      header: "Estado",
      width: "180px",
      align: "center" as const,
      render: (row: Branch) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.federal_entity?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "Direction",
      header: "Dirección",
      width: "180px",
      align: "center" as const,
      render: (row: Branch) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.address || "N/A"}
        </span>
      ),
    },
    {
      key: "Phone",
      header: "Telefono",
      align: "left" as const,
      render: (row: Branch) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.phone || "N/A"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Correo",
      align: "left" as const,
      render: (row: Branch) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.email || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estatus",
      width: "120px",
      align: "center" as const,
      render: (row: Branch) => (
        <StatusBadge
          status={row.status ? "active" : "inactive"}
          text={row.status ? "Activo" : "Inactiva"}
          showIndicator={true}
        />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "130px",
      align: "center" as const,
      render: (row: Branch) => <ActionButtons onEdit={() => handleEdit(row)} />,
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {ToastComponent}

      <div className="w-full max-w-5xl mx-auto overflow-x-hidden bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500">
            Sucursales
          </h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            theme="add"
            text="Nueva Sucursal"
          />
        </div>

        {/* BARRA DE BÚSQUEDA Y EXPORTAR */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, código o estado..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            Mostrando {filteredBranches.length} de {branches.length}{" "}
            {filteredBranches.length === 1 ? "registro" : "registros"}
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
        <Table
          data={filteredBranches}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No hay sucursales registradas"
          mobileBreakpoint="md"
          mobileCardRender={(row) => (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Badge text={`#${row.id}`} variant="primary" />
                <StatusBadge
                  status={row.status ? "active" : "inactive"}
                  text={row.status ? "Activo" : "Inactiva"}
                  showIndicator={true}
                />
              </div>
              <div className="space-y-2">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {row.name}
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    <span className="font-medium">Código:</span>{" "}
                    <span className="font-mono">{row.code}</span>
                  </p>
                  <p>
                    <span className="font-medium">Estado:</span>{" "}
                    {row.federal_entity?.name || "N/A"}
                  </p>
                  {row.address && (
                    <p>
                      <span className="font-medium">Dirección:</span>{" "}
                      {row.address}
                    </p>
                  )}
                  {row.phone && (
                    <p>
                      <span className="font-medium">Teléfono:</span> {row.phone}
                    </p>
                  )}
                  {row.email && (
                    <p>
                      <span className="font-medium">Email:</span> {row.email}
                    </p>
                  )}
                </div>
              </div>
              <ActionButtons onEdit={() => handleEdit(row)} />
            </div>
          )}
        />
        </div>
      </div>

      {/* ✨ MODAL PROFESIONAL */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCloseModal}
            style={{
              touchAction: "none",
              overscrollBehavior: "none",
            }}
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            style={{
              touchAction: "none",
              overscrollBehavior: "none",
              overflow: "hidden",
            }}
          >
            <div
              className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                touchAction: "auto",
                animation: "modalAppear 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Header */}
              <div className="flex-shrink-0 rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 border-b border-blue-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    {editingId ? (
                      <>
                        <svg
                          className="w-6 h-6"
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
                        Editar Sucursal
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Nueva Sucursal
                      </>
                    )}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white/10"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body - Scrollable */}
              <div
                className="flex-1 overflow-y-auto"
                style={{
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Información Básica */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Código <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.code
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                          placeholder="SUC-001"
                        />
                        {errors.code && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.code[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="SUCURSAL CENTRO"
                        />
                        {errors.name && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.name[0]}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Entidad Federativa{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="federal_entity_id"
                          value={form.federal_entity_id}
                          onChange={handleChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.federal_entity_id
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="">Seleccione un estado</option>
                          {federalEntities.map((entity) => (
                            <option key={entity.id} value={entity.id}>
                              {entity.name}
                            </option>
                          ))}
                        </select>
                        {errors.federal_entity_id && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.federal_entity_id[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Información de Contacto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Dirección
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Calle, Número, Colonia..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="555-123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.email
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="sucursal@empresa.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.email[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Estatus */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="status"
                      checked={form.status}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="accent-blue-500 w-5 h-5 cursor-pointer"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Activo
                    </label>
                  </div>
                </form>
              </div>

              {/* Footer - Fijo */}
              <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    onClick={handleCloseModal}
                    theme="close"
                    text="Cancelar"
                  />
                  <Button
                    onClick={handleSubmit}
                    theme={editingId ? "update" : "add"}
                    text={editingId ? "Actualizar" : "Guardar"}
                    loading={loading}
                    loadingText={editingId ? "Actualizando..." : "Guardando..."}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
