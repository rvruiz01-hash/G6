// src/components/InvoiceDetailModal.tsx

import { X } from "lucide-react";
import { useState, useEffect } from "react"; // ⬅️ AGREGAR
import api from "../../services/api"; // ⬅️ AGREGAR (ajusta la ruta según tu estructura)

interface UniformStock {
  id: number;
  code: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  observations?: string;
  uniform_type?: {
    id: number;
    description: string;
  };
  size?: {
    id: number;
    description: string;
  };
  uniform_status?: {
    id: number;
    description: string;
  };
}

interface Invoice {
  id: number;
  folio: string;
  payment_type: "CONTADO" | "CREDITO";
  payment_months: number | null;
  subtotal: number;
  iva: number;
  total: number;
  merchandise_paid: boolean;
  invoice_paid: boolean;
  created_at: string;
  supplier?: {
    id: number;
    legal_name: string;
    rfc: string;
    email?: string;
    phone?: string;
  };
  business_line?: {
    id: number;
    description: string;
  };
  federal_entity?: {
    id: string;
    name: string;
  };
  branch?: {
    id: number;
    name: string;
    code: string;
    address?: string;
    phone?: string;
  };
  uniform_stock?: UniformStock[];
}

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceDetailModal({
  invoice,
  isOpen,
  onClose,
}: InvoiceDetailModalProps) {
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  // Agrupar uniformes por tipo y talla para mostrar cantidades
  const groupedUniforms = invoice.uniform_stock?.reduce((acc, uniform) => {
    const key = `${uniform.uniform_type?.id}-${uniform.size?.id}`;
    if (!acc[key]) {
      acc[key] = {
        uniform_type: uniform.uniform_type?.description || "N/A",
        size: uniform.size?.description || "N/A",
        unit_price: Number(uniform.unit_price),
        quantity: 0,
        subtotal: 0,
      };
    }
    acc[key].quantity += uniform.quantity;
    acc[key].subtotal += Number(uniform.subtotal);
    return acc;
  }, {} as Record<string, any>);

  const uniformsArray = Object.values(groupedUniforms || {});

  // Actualizar el estado local cuando cambia el invoice prop

  const handleCheckboxChange = async (
    field: "merchandise_paid" | "invoice_paid"
  ) => {
    if (!localInvoice) return;

    // Si ya está marcado, no permitir desmarcarlo
    if (localInvoice[field]) {
      return;
    }

    setUpdating(true);

    try {
      await api.patch(`/invoices/${localInvoice.id}/update-payment-status`, {
        [field]: true,
      });

      // Actualizar el estado local
      setLocalInvoice({
        ...localInvoice,
        [field]: true,
      });

      // Opcional: mostrar notificación de éxito
      console.log("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      // Opcional: mostrar notificación de error
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Detalle de Factura
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                  Información de la Factura
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Folio:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {invoice.folio}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Fecha:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(invoice.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Tipo de Pago:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {invoice.payment_type}
                      {invoice.payment_months &&
                        ` (${invoice.payment_months} meses)`}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Línea de Negocio:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {invoice.business_line?.description || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                  Proveedor
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Razón Social:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {invoice.supplier?.legal_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      RFC:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {invoice.supplier?.rfc || "N/A"}
                    </p>
                  </div>
                  {invoice.supplier?.email && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {invoice.supplier.email}
                      </p>
                    </div>
                  )}
                  {invoice.supplier?.phone && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Teléfono:
                      </span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {invoice.supplier.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Destino */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                Destino
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Entidad Federativa:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {invoice.federal_entity?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Sucursal:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {invoice.branch?.name || "N/A"} (
                    {invoice.branch?.code || "N/A"})
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Uniformes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                Uniformes
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Talla
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        P. Unitario
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {uniformsArray.map((uniform, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {uniform.uniform_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {uniform.size}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                          {uniform.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                          ${Number(uniform.unit_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                          ${Number(uniform.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Subtotal:
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  ${invoice.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  IVA (16%):
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  ${invoice.iva.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  ${invoice.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Estados de Pago - CHECKBOXES INTERACTIVOS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                Estados de Pago
              </h3>

              <div className="space-y-3">
                {/* Mercancía Pagada */}
                <label
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                    localInvoice?.merchandise_paid
                      ? "bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-600"
                      : "bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:border-blue-400 cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={localInvoice?.merchandise_paid || false}
                    onChange={() => handleCheckboxChange("merchandise_paid")}
                    disabled={localInvoice?.merchandise_paid || updating}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Mercancía Entregada
                    </span>
                    {localInvoice?.merchandise_paid && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Confirmado - No se puede desmarcar
                      </p>
                    )}
                  </div>
                </label>

                {/* Factura Pagada */}
                <label
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                    localInvoice?.invoice_paid
                      ? "bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-600"
                      : "bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:border-blue-400 cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={localInvoice?.invoice_paid || false}
                    onChange={() => handleCheckboxChange("invoice_paid")}
                    disabled={localInvoice?.invoice_paid || updating}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Factura Pagada
                    </span>
                    {localInvoice?.invoice_paid && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Confirmado - No se puede desmarcar
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {updating && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Actualizando...
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
