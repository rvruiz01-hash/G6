// src/pages/Catalogos/Supplier.tsx - PARTE 1: IMPORTS Y FUNCIONALIDAD
import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import * as XLSX from "xlsx";
import Button from "../components/ui/button/Button";
import { useToast } from "../components/Toast";
import { Table, Badge, StatusBadge, ActionButtons } from "../components/Table1";
import { useAddressCascade } from "../hooks/useAddressCascade"; // ✅ NUEVO

interface Bank {
  id: number;
  name: string;
  code: string;
}

interface FederalEntity {
  id: string; // ✅ CAMBIO: era number, ahora es string
  name: string;
  abbreviation?: string;
}

interface Municipality {
  // ✅ NOMBRE CORREGIDO: era Municipies
  id: number;
  name: string;
  federal_entity_id: string;
}

interface Colony {
  // ✅ NOMBRE CORREGIDO: era Colonies
  id: number;
  name: string;
  postal_code: string;
  municipality_id: number;
}

interface Supplier {
  id: number;
  contractor_number: string;
  legal_name: string;
  trade_name: string | null;
  rfc: string;
  contact_person: string | null;
  contact_number: string | null;
  email: string;
  phone: string;
  bank_id: number;
  account_number: string;
  clabe: string;
  fiscal_address: string;
  postal_code: string;
  federal_entity_id: string | null; // ✅ CAMBIO: ahora es string
  municipalities_id: number | null;
  colonies_id: number | null;
  website: string | null;
  notes: string | null;
  status: boolean;
  bank?: Bank;
  federal_entity?: FederalEntity;
  municipality?: Municipality; // ✅ CAMBIO: nombre corregido
  colony?: Colony; // ✅ CAMBIO: nombre corregido
}

interface ValidationErrors {
  contractor_number?: string[];
  legal_name?: string[];
  trade_name?: string[];
  rfc?: string[];
  contact_person?: string[];
  contact_number?: string[];
  email?: string[];
  phone?: string[];
  bank_id?: string[];
  account_number?: string[];
  clabe?: string[];
  fiscal_address?: string[];
  postal_code?: string[];
  city?: string[];
  federal_entity_id?: string[];
  municipalities_id?: string[];
  colonies_id?: string[];
  website?: string[];
  notes?: string[];
  status?: string[];
}

export default function Proveedores() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  // const [federalEntities, setFederalEntities] = useState<FederalEntity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    contractor_number: "",
    legal_name: "",
    trade_name: "",
    rfc: "",
    contact_person: "",
    contact_number: "",
    email: "",
    phone: "",
    bank_id: 0,
    account_number: "",
    clabe: "",
    fiscal_address: "",
    postal_code: "",
    federal_entity_id: "", // ✅ CAMBIO: ahora es string vacío
    municipalities_id: 0,
    colonies_id: 0,
    website: "",
    notes: "",
    status: true,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { showToast, ToastComponent } = useToast();
  const handleAddressError = useCallback(
    (message: string) => {
      showToast(message, "error");
    },
    [showToast] // Solo se recrea si showToast cambia
  );
  const {
    federalEntities,
    municipalities,
    colonies,
    loadingCP,
    loadingMunicipalities,
    loadingColonies,
    loadByPostalCode,
    loadMunicipalitiesByState,
    loadColoniesByMunicipality,
    getPostalCodeFromColony,
    resetMunicipalitiesAndColonies,
    resetColonies,
  } = useAddressCascade({
    onError: handleAddressError, // ✅ Función estable
  });

  useEffect(() => {
    fetchSuppliers();
    fetchBanks();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/suppliers");
      setSuppliers(response.data);
    } catch (error: any) {
      console.error("Error al obtener los proveedores", error);
      if (error.response?.status !== 404) {
        showToast("Error al cargar los proveedores", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get("/banks");
      setBanks(response.data);
    } catch (error) {
      console.error("Error al obtener los bancos", error);
      showToast("Error al cargar los bancos", "error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
          : name === "legal_name" || name === "trade_name" || name === "rfc"
          ? value.toUpperCase()
          : name === "bank_id" ||
            name === "federal_entity_id" ||
            name === "municipalities_id" ||
            name === "colonies_id"
          ? parseInt(value) || 0
          : value,
    });
  };

  /**
   * Manejador especial para código postal
   */
  const handlePostalCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const postalCode = e.target.value;

    // Actualizar el form
    setForm((prev) => ({
      ...prev,
      postal_code: postalCode,
    }));

    // Limpiar error si existe
    if (errors.postal_code) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.postal_code;
        return newErrors;
      });
    }

    // Si el código postal tiene 5 dígitos, buscar
    if (postalCode.length === 5) {
      const result = await loadByPostalCode(postalCode);

      if (result) {
        setForm((prev) => ({
          ...prev,
          federal_entity_id: result.federalEntity.id,
          municipalities_id: result.municipality.id,
          // No establecemos colony automáticamente, esperamos que el usuario seleccione
          colonies_id: 0,
        }));
      }
    } else if (postalCode.length === 0) {
      // Si borran el CP, resetear todo
      setForm((prev) => ({
        ...prev,
        federal_entity_id: "",
        municipalities_id: 0,
        colonies_id: 0,
      }));
      resetMunicipalitiesAndColonies();
    }
  };

  /**
   * Manejador especial para entidad federativa
   */
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.target.value;

    setForm((prev) => ({
      ...prev,
      federal_entity_id: stateId,
      municipalities_id: 0, // Resetear municipio
      colonies_id: 0, // Resetear colonia
      postal_code: "", // Resetear CP
    }));

    // Limpiar errores
    if (errors.federal_entity_id) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.federal_entity_id;
        return newErrors;
      });
    }

    if (stateId) {
      await loadMunicipalitiesByState(stateId);
    } else {
      resetMunicipalitiesAndColonies();
    }
  };

  /**
   * Manejador especial para municipio
   */
  const handleMunicipalityChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const municipalityId = parseInt(e.target.value) || 0;

    setForm((prev) => ({
      ...prev,
      municipalities_id: municipalityId,
      colonies_id: 0, // Resetear colonia
      postal_code: "", // Resetear CP
    }));

    // Limpiar errores
    if (errors.municipalities_id) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.municipalities_id;
        return newErrors;
      });
    }

    if (municipalityId) {
      await loadColoniesByMunicipality(municipalityId);
    } else {
      resetColonies();
    }
  };

  /**
   * Manejador especial para colonia
   */
  const handleColonyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const colonyId = parseInt(e.target.value) || 0;

    setForm((prev) => ({
      ...prev,
      colonies_id: colonyId,
    }));

    // Limpiar errores
    if (errors.colonies_id) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.colonies_id;
        return newErrors;
      });
    }

    // Buscar el código postal de la colonia seleccionada
    if (colonyId) {
      const postalCode = await getPostalCodeFromColony(colonyId);
      if (postalCode) {
        setForm((prev) => ({
          ...prev,
          postal_code: postalCode,
        }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        postal_code: "",
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setErrors({});

    const dataToSend = {
      ...form,
      federal_entity_id:
        form.federal_entity_id === "" ? null : form.federal_entity_id,
      municipalities_id:
        form.municipalities_id === 0 ? null : form.municipalities_id,
      colonies_id: form.colonies_id === 0 ? null : form.colonies_id,
      trade_name: form.trade_name.trim() === "" ? null : form.trade_name,
      contact_person:
        form.contact_person.trim() === "" ? null : form.contact_person,
      contact_number:
        form.contact_number.trim() === "" ? null : form.contact_number,
      website: form.website.trim() === "" ? null : form.website,
      notes: form.notes.trim() === "" ? null : form.notes,
      postal_code: form.postal_code.trim() === "" ? null : form.postal_code,
    };

    console.log("📤 Datos a enviar:", dataToSend);

    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, dataToSend);
        showToast("Proveedor actualizado exitosamente", "success");
      } else {
        await api.post("/suppliers", dataToSend);
        showToast("Proveedor creado exitosamente", "success");
      }

      handleCloseModal();

      // ✅ FIX: Recargar la lista completa con todas las relaciones
      await fetchSuppliers();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        showToast(
          error.response.data.message || "Error de validación",
          "error"
        );
      } else {
        console.error("Error al guardar el proveedor", error);
        showToast("Error al guardar el proveedor", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async (supplier: Supplier) => {
    setEditingId(supplier.id);

    // Establecer valores del formulario
    setForm({
      contractor_number: supplier.contractor_number,
      legal_name: supplier.legal_name,
      trade_name: supplier.trade_name || "",
      rfc: supplier.rfc,
      contact_person: supplier.contact_person || "",
      contact_number: supplier.contact_number || "",
      email: supplier.email,
      phone: supplier.phone,
      bank_id: supplier.bank_id,
      account_number: supplier.account_number,
      clabe: supplier.clabe,
      fiscal_address: supplier.fiscal_address,
      postal_code: supplier.postal_code || "",
      federal_entity_id: supplier.federal_entity_id || "",
      municipalities_id: supplier.municipalities_id || 0,
      colonies_id: supplier.colonies_id || 0,
      website: supplier.website || "",
      notes: supplier.notes || "",
      status: supplier.status,
    });

    // ✅ NUEVO: Cargar los catálogos dependientes si existen
    if (supplier.federal_entity_id) {
      await loadMunicipalitiesByState(supplier.federal_entity_id);
    }

    if (supplier.municipalities_id) {
      await loadColoniesByMunicipality(supplier.municipalities_id);
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar al proveedor "${supplier.legal_name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/suppliers/${supplier.id}`);
      setSuppliers(suppliers.filter((s) => s.id !== supplier.id));
      showToast("Proveedor eliminado exitosamente", "success");
    } catch (error: any) {
      console.error("Error al eliminar el proveedor", error);
      showToast(
        error.response?.data?.message || "Error al eliminar el proveedor",
        "error"
      );
    }
  };

  const handleCloseModal = () => {
    setForm({
      contractor_number: "",
      legal_name: "",
      trade_name: "",
      rfc: "",
      contact_person: "",
      contact_number: "",
      email: "",
      phone: "",
      bank_id: 0,
      account_number: "",
      clabe: "",
      fiscal_address: "",
      postal_code: "",
      federal_entity_id: "", // ✅ CAMBIO: string vacío
      municipalities_id: 0,
      colonies_id: 0,
      website: "",
      notes: "",
      status: true,
    });
    setErrors({});
    setEditingId(null);
    setIsModalOpen(false);

    // ✅ NUEVO: Resetear los catálogos dependientes
    resetMunicipalitiesAndColonies();
  };

  // ✅ SOLUCIÓN: Optional chaining y valores por defecto
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();

    const legalName = supplier.legal_name?.toLowerCase() || "";
    const contractorNumber = supplier.contractor_number?.toLowerCase() || "";
    const tradeName = supplier.trade_name?.toLowerCase() || "";
    const email = supplier.email?.toLowerCase() || "";
    const rfc = supplier.rfc?.toLowerCase() || "";

    return (
      legalName.includes(searchLower) ||
      contractorNumber.includes(searchLower) ||
      tradeName.includes(searchLower) ||
      email.includes(searchLower) ||
      rfc.includes(searchLower)
    );
  });

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredSuppliers.map((supplier) => ({
          ID: supplier.id,
          "No. Contratante": supplier.contractor_number,
          "Razón Social": supplier.legal_name,
          "Nombre Comercial": supplier.trade_name || "N/A",
          RFC: supplier.rfc,
          "Persona Contacto": supplier.contact_person || "N/A",
          Email: supplier.email,
          Teléfono: supplier.phone,
          Banco: supplier.bank?.name || "N/A",
          "No. Cuenta": supplier.account_number,
          CLABE: supplier.clabe,
          Estado: supplier.federal_entity?.name || "N/A",
          Municipio: supplier.municipality?.name || "N/A",
          Colonia: supplier.colony?.name || "N/A",
          Estatus: supplier.status ? "Activo" : "Inactivo",
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
      XLSX.writeFile(wb, "proveedores.xlsx");
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
      width: "70px",
      align: "center" as const,
      render: (row: Supplier) => (
        <Badge text={`#${row.id}`} variant="primary" />
      ),
    },
    {
      key: "contractor_number",
      header: "No. Contratante",
      width: "130px",
      align: "center" as const,
      render: (row: Supplier) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          {row.contractor_number}
        </span>
      ),
    },
    {
      key: "legal_name",
      header: "Razón Social",
      align: "left" as const,
      render: (row: Supplier) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.legal_name}
        </span>
      ),
    },
    {
      key: "rfc",
      header: "RFC",
      width: "140px",
      align: "center" as const,
      render: (row: Supplier) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          {row.rfc || "N/A"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      align: "left" as const,
      render: (row: Supplier) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.email}
        </span>
      ),
    },
    {
      key: "bank",
      header: "Banco",
      width: "150px",
      align: "center" as const,
      render: (row: Supplier) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.bank?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estatus",
      width: "110px",
      align: "center" as const,
      render: (row: Supplier) => (
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
      width: "130px",
      align: "center" as const,
      render: (row: Supplier) => (
        <ActionButtons
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ];

  // ============================================
  // AQUÍ TERMINA LA PARTE 1
  // COPIA LA PARTE 2 A CONTINUACIÓN
  // ============================================
  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {ToastComponent}

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500">
            Proveedores
          </h1>
          <div className="no-transform-buttons">
            <Button
              onClick={() => setIsModalOpen(true)}
              theme="add"
              text="Nuevo Proveedor"
            />
          </div>
        </div>

        {/* Barra de búsqueda y exportar */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por razón social, RFC, no. contratante o email..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 sm:gap-3 no-transform-buttons">
              <Button
                onClick={exportExcel}
                theme="download"
                text="Excel"
                size="clamp(0.75rem, 2vw, 0.85rem)"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredSuppliers.length} de {suppliers.length}{" "}
            {filteredSuppliers.length === 1 ? "registro" : "registros"}
          </div>
        </div>

        {/* Tabla */}
        <Table
          data={filteredSuppliers}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No hay proveedores registrados"
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
                  {row.legal_name}
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    <span className="font-medium">No. Contratante:</span>{" "}
                    <span className="font-mono">{row.contractor_number}</span>
                  </p>
                  <p>
                    <span className="font-medium">RFC:</span>{" "}
                    <span className="font-mono">{row.rfc}</span>
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {row.email}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span> {row.phone}
                  </p>
                  <p>
                    <span className="font-medium">Banco:</span>{" "}
                    {row.bank?.name || "N/A"}
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

      {/* ✨ MODAL PROFESIONAL */}
      {isModalOpen && (
        <>
          {/* Backdrop - Capa de fondo fija */}
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCloseModal}
            style={{
              touchAction: "none",
              overscrollBehavior: "none",
            }}
          />

          {/* Modal Container - Completamente fijo */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            style={{
              touchAction: "none",
              overscrollBehavior: "none",
              overflow: "hidden",
            }}
          >
            <div
              className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col pointer-events-auto"
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
                        Editar Proveedor
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
                        Nuevo Proveedor
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

              {/* Body - Scrollable con mejor manejo */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          No. Contratante{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contractor_number"
                          value={form.contractor_number}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.contractor_number
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="CNT-001"
                        />
                        {errors.contractor_number && (
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
                            {errors.contractor_number[0]}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Razón Social <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="legal_name"
                          value={form.legal_name}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.legal_name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="EMPRESA S.A. DE C.V."
                        />
                        {errors.legal_name && (
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
                            {errors.legal_name[0]}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nombre Comercial
                        </label>
                        <input
                          type="text"
                          name="trade_name"
                          value={form.trade_name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre comercial (opcional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          RFC
                        </label>
                        <input
                          type="text"
                          name="rfc"
                          value={form.rfc}
                          onChange={handleChange}
                          maxLength={13}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.rfc
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                          placeholder="ABC123456789"
                        />
                        {errors.rfc && (
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
                            {errors.rfc[0]}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Persona de Contacto{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contact_person"
                          value={form.contact_person}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Juan Pérez"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          No. Contacto
                        </label>
                        <input
                          type="text"
                          name="contact_number"
                          value={form.contact_number}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="555-123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email <span className="text-red-500">*</span>
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
                          placeholder="email@empresa.com"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.phone
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="555-000-0000"
                        />
                        {errors.phone && (
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
                            {errors.phone[0]}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sitio Web
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.website
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="https://www.empresa.com"
                        />
                        {errors.website && (
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
                            {errors.website[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información Bancaria */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-purple-600 dark:text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Información Bancaria
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Banco
                        </label>
                        <select
                          name="bank_id"
                          value={form.bank_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.bank_id
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="null">Seleccione un banco</option>
                          {banks.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                              {bank.name} ({bank.code})
                            </option>
                          ))}
                        </select>
                        {errors.bank_id && (
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
                            {errors.bank_id[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          No. de Cuenta
                        </label>
                        <input
                          type="text"
                          name="account_number"
                          value={form.account_number}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.account_number
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                          placeholder="1234567890"
                        />
                        {errors.account_number && (
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
                            {errors.account_number[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CLABE (18 dígitos){" "}
                        </label>
                        <input
                          type="text"
                          name="clabe"
                          value={form.clabe}
                          onChange={handleChange}
                          maxLength={18}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.clabe
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                          placeholder="012345678901234567"
                        />
                        {errors.clabe && (
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
                            {errors.clabe[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información Fiscal */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-orange-600 dark:text-orange-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Información Fiscal y Ubicación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Domicilio Fiscal{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="fiscal_address"
                          value={form.fiscal_address}
                          onChange={handleChange}
                          rows={2}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.fiscal_address
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Calle, Número, Colonia..."
                        />
                        {errors.fiscal_address && (
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
                            {errors.fiscal_address[0]}
                          </p>
                        )}
                      </div>

                      {/* ✅ CAMPO: Código Postal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={form.postal_code}
                          onChange={handlePostalCodeChange}
                          maxLength={5}
                          placeholder="12345"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.postal_code
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {loadingCP && (
                          <p className="text-xs text-blue-600 mt-1">
                            🔍 Buscando código postal...
                          </p>
                        )}
                        {errors.postal_code && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.postal_code[0]}
                          </p>
                        )}
                      </div>

                      {/* ✅ CAMPO: Entidad Federativa */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado (Entidad Federativa)
                        </label>
                        <select
                          name="federal_entity_id"
                          value={form.federal_entity_id}
                          onChange={handleStateChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.federal_entity_id
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Seleccionar estado...</option>
                          {federalEntities.map((entity) => (
                            <option key={entity.id} value={entity.id}>
                              {entity.name}
                            </option>
                          ))}
                        </select>
                        {errors.federal_entity_id && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.federal_entity_id[0]}
                          </p>
                        )}
                      </div>

                      {/* ✅ CAMPO: Municipio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Municipio
                        </label>
                        <select
                          name="municipalities_id"
                          value={form.municipalities_id}
                          onChange={handleMunicipalityChange}
                          disabled={
                            !form.federal_entity_id || loadingMunicipalities
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors.municipalities_id
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="0">
                            {loadingMunicipalities
                              ? "Cargando municipios..."
                              : !form.federal_entity_id
                              ? "Primero seleccione un estado"
                              : "Seleccionar municipio..."}
                          </option>
                          {municipalities.map((municipality) => (
                            <option
                              key={municipality.id}
                              value={municipality.id}
                            >
                              {municipality.name}
                            </option>
                          ))}
                        </select>
                        {errors.municipalities_id && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.municipalities_id[0]}
                          </p>
                        )}
                      </div>

                      {/* ✅ CAMPO: Colonia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Colonia
                        </label>
                        <select
                          name="colonies_id"
                          value={form.colonies_id}
                          onChange={handleColonyChange}
                          disabled={!form.municipalities_id || loadingColonies}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                            errors.colonies_id
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="0">
                            {loadingColonies
                              ? "Cargando colonias..."
                              : !form.municipalities_id
                              ? "Primero seleccione un municipio"
                              : "Seleccionar colonia..."}
                          </option>
                          {colonies.map((colony) => (
                            <option key={colony.id} value={colony.id}>
                              {colony.name} (CP: {colony.postal_code})
                            </option>
                          ))}
                        </select>
                        {errors.colonies_id && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.colonies_id[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notas/Observaciones
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Información adicional del proveedor..."
                    />
                  </div>

                  {/* Estatus */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="status"
                      checked={form.status}
                      onChange={handleChange}
                      className="accent-blue-500 w-5 h-5 cursor-pointer"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Activo
                    </label>
                  </div>
                </form>
              </div>

              {/* Footer - Fijo en la parte inferior */}
              <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3 justify-end no-transform-buttons">
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
