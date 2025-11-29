// src/pages/Catalogos/Bank.tsx
import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import * as XLSX from "xlsx";
import Button from "../../../components/ui/button/Button";
import { useToast } from "../../../components/Toast";
// 🎯 Importar Driver.js
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../../../styles/driver-custom.css"; // Tu CSS personalizado
import { getBankDriverSteps } from "./bankDriverSteps";
import {
  Table,
  Badge,
  StatusBadge,
  ActionButtons,
} from "../../../components/Table1";
// import { AlignCenter } from "lucide-react";

interface Bank {
  id: number;
  name: string;
  code: string;
  status: boolean;
}

interface ValidationErrors {
  name?: string[];
  code?: string[];
  status?: string[];
}

export default function Bancos() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [form, setForm] = useState<Omit<Bank, "id">>({
    name: "",
    code: "",
    status: true,
  });
  const [errors, setErrors] = useState<ValidationErrors>(
    {} as ValidationErrors
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { showToast, ToastComponent } = useToast();

  // 🎯 TOUR GUIADO
  useEffect(() => {
    // Verificar si el usuario ya vio el tour
    const hasSeenTour =
      localStorage.getItem("tour_bank_completed") === "true";

    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500); // Esperar 1.5 segundos para que cargue el contenido

      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    const tour = getBankDriverSteps();
    tour.drive();
  };


  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/banks");
      setBanks(response.data);
    } catch (error) {
      console.error("Error al obtener los bancos", error);
      showToast("Error al cargar los bancos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : name === "name"
          ? value.toUpperCase()
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({} as ValidationErrors);

    try {
      if (editingId) {
        const response = await api.put(`/banks/${editingId}`, form);
        setBanks(
          banks.map((bank) => (bank.id === editingId ? response.data : bank))
        );
        setEditingId(null);
        showToast("Banco actualizado exitosamente", "success");
      } else {
        const response = await api.post("/banks", form);
        setBanks([...banks, response.data]);
        showToast("Banco agregado exitosamente", "success");
      }

      setForm({ name: "", code: "", status: true });
      await fetchBanks();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        showToast(
          error.response.data.message || "Error de validación",
          "error"
        );
      } else {
        console.error("Error al guardar el banco", error);
        showToast(
          error.response?.data?.message || "Error al guardar el banco",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank: Bank) => {
    setForm({
      name: bank.name,
      code: bank.code,
      status: bank.status,
    });
    setEditingId(bank.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setForm({ name: "", code: "", status: true });
    setEditingId(null);
    setErrors({});
    showToast("Edición cancelada", "info");
  };

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(search.toLowerCase()) ||
      bank.code.includes(search)
  );

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredBanks.map((bank) => ({
          ID: bank.id,
          Nombre: bank.name,
          Código: bank.code,
          Estatus: bank.status ? "Activo" : "Inactivo",
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bancos");
      XLSX.writeFile(wb, "bancos.xlsx");
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
      sortable: true,
      filterable: true,
      filterType: "number" as const,
      render: (row: Bank) => <Badge text={`#${row.id}`} variant="primary" />,
    },
    {
      key: "name",
      header: "Nombre",
      align: "center" as const,
      sortable: true,
      filterable: true,
      filterType: "text" as const,
      render: (row: Bank) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.name}
        </span>
      ),
    },
    {
      key: "code",
      header: "Código",
      width: "120px",
      align: "center" as const,
      sortable: true,
      filterable: true,
      filterType: "number" as const,
      render: (row: Bank) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          {row.code}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estatus",
      width: "120px",
      align: "center" as const,
      sortable: true,
      filterable: true,
      filterType: "boolean" as const,
      render: (row: Bank) => (
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
      render: (row: Bank) => <ActionButtons onEdit={() => handleEdit(row)} />,
    },
  ];

  return (
    
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {ToastComponent}

      <div className="w-full max-w-5xl mx-auto overflow-x-hidden bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        <div data-tour="bodyForm">
          <div className="flex justify-between items-center mb-4 sm:mb-6"> 
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500 mb-4 sm:mb-6">
          BANCOS
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

          <div data-tour="bank_form" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-tour="bank_name" >
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Banco:
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
                placeholder="Ej. BBVA, SANTANDER, BANORTE..."
              />
              {errors.name && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.name.join(", ")}
                </p>
              )}
            </div>

            <div data-tour="bank_code">
              <label className="block text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-1">
                Código (3 dígitos):
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                maxLength={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 font-mono"
                placeholder="012"
              />
              {errors.code && (
                <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                  {errors.code.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div data-tour="bank_status" className="flex items-center space-x-2">
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

          <div  className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div data-tour="bank_button_add">
              <Button
                onClick={handleSubmit}
                theme={editingId ? "update" : "add"}
                text={editingId ? "Actualizar" : "Agregar"}
                loading={loading}
                loadingText={editingId ? "Actualizando..." : "Agregando..."}
              />
            </div>
            <div data-tour="bank_button_cancel">
            {editingId && (
              <Button
                onClick={handleCancelEdit}
                theme="close"
                text="Cancelar"
              />
            )}
            </div>
            <div data-tour="bank_button_dowload">
              <Button
                onClick={exportExcel}
                theme="download"
                text="Descargar Excel"
              />
            </div>
          </div>
        </form>

        <div data-tour="bank_registers" className="mb-4 space-y-3">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredBanks.length} de {banks.length}{" "}
            {filteredBanks.length === 1 ? "registro" : "registros"}
          </div>
        </div>
      <div data-tour="bank_table" className="overflow-x-auto">
        <Table
          data={filteredBanks}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No hay bancos registrados"
          mobileBreakpoint="md"
          mobileCardRender={(row) => (
            <div className="space-y-3" >
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
                  {row.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Código:</span>{" "}
                  <span className="font-mono">{row.code}</span>
                </p>
              </div>
              <ActionButtons onEdit={() => handleEdit(row)} />
            </div>
          )}
        />
        </div>
      </div>
    </div>
    </div>

  );
}
