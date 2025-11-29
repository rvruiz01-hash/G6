// src/pages/Catalogos/Invoice.tsx - PARTE 1: FUNCIONALIDAD
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import * as XLSX from "xlsx";
import Button from "../components/ui/button/Button";
import { useToast } from "../components/Toast";
import { Table, Badge } from "../components/Table1";
import InvoiceDetailModal from "../components/InvoiceDetailModal";
import { FileText, Upload, Eye } from "lucide-react";

// ============================================
// INTERFACES
// ============================================

interface Supplier {
  id: number;
  legal_name: string;
  rfc: string;
}

interface BusinessLine {
  id: number;
  name: string;
}

interface FederalEntity {
  id: string;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  code: string;
  federal_entity_id: string;
}

interface UniformType {
  id: number;
  description: string;
  body_part_id: number;
  sexe_id: number;
  business_line_id: number;
}

interface Size {
  id: number;
  description: string;
}

interface UniformItem {
  uniform_type_id: number;
  uniform_type_name?: string;
  size_id: number;
  size_name?: string;
  color_id: number;
  color_name?: string;
  sexe_id: number; // ✅ NUEVO
  sexe_name?: string; // ✅ NUEVO
  code: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Invoice {
  id: number;
  folio: string;
  supplier_id: number;
  business_line_id: number;
  payment_type: "CONTADO" | "CREDITO";
  payment_months: number | null;
  subtotal: number;
  iva: number;
  total: number;
  shipping_cost: number; // ✅ NUEVO
  freight_withholding: number; // ✅ NUEVO
  discount: number; // ✅ NUEVO
  federal_entity_id: string;
  branch_id: number;
  merchandise_paid: boolean;
  invoice_paid: boolean;
  invoice_file?: string | null;
  supplier?: Supplier;
  business_line?: BusinessLine;
  federal_entity?: FederalEntity;
  branch?: Branch;
  uniform_stock?: any[];
  created_at: string;
}

interface ValidationErrors {
  folio?: string[];
  supplier_id?: string[];
  business_line_id?: string[];
  payment_type?: string[];
  payment_months?: string[];
  federal_entity_id?: string[];
  branch_id?: string[];
  uniforms?: string[];
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Facturas() {
  // Estados principales
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [federalEntities, setFederalEntities] = useState<FederalEntity[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [uniformTypes, setUniformTypes] = useState<UniformType[]>([]);
  // Estado para el modal de detalles
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // Estado para manejo de archivos
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  const [filteredUniformTypes, setFilteredUniformTypes] = useState<
    UniformType[]
  >([]);
  const [uniformFilters, setUniformFilters] = useState({
    body_part_id: 0,
    sexe_id: 0,
  });
  const [bodyParts, setBodyParts] = useState<any[]>([]);
  const [sexes, setSexes] = useState<any[]>([]);
  // Estados para los 3 nuevos campos de ajustes
  const [adjustments, setAdjustments] = useState({
    shipping_cost: 0,
    freight_withholding: 0,
    discount: 0,
  });
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [filteredColors, setFilteredColors] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Estados del formulario
  const [form, setForm] = useState({
    folio: "",
    supplier_id: 0,
    business_line_id: 0,
    payment_type: "CONTADO" as "CONTADO" | "CREDITO",
    payment_months: 0,
    federal_entity_id: "",
    branch_id: 0,
    merchandise_paid: false,
    invoice_paid: false,
  });

  // Estados para agregar uniformes
  const [uniformForm, setUniformForm] = useState({
    uniform_type_id: 0,
    size_id: 0,
    color_id: 0,
    sexe_id: 0, // ✅ AGREGADO
    code: "",
    quantity: 1,
    unit_price: 0,
  });

  const [uniformItems, setUniformItems] = useState<UniformItem[]>([]);

  const { showToast, ToastComponent } = useToast();

  // ============================================
  // useEffect - Cargar datos iniciales
  // ============================================

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
    fetchBusinessLines();
    fetchFederalEntities();
    fetchBranches();
    fetchUniformTypes();
    fetchBodyParts();
    fetchSexes();
    fetchColors();
  }, []);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";

      const style = document.createElement("style");
      style.id = "modal-no-transform";
      style.textContent = `
        * {
          transform: none !important;
          animation: none !important;
        }
        @keyframes modalAppear {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";

      const style = document.getElementById("modal-no-transform");
      if (style) {
        style.remove();
      }

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";

      const style = document.getElementById("modal-no-transform");
      if (style) {
        style.remove();
      }
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (
      uniformFilters.body_part_id &&
      form.business_line_id && // ✅ CAMBIO: usar form.business_line_id
      uniformFilters.sexe_id
    ) {
      const filtered = uniformTypes.filter(
        (type) =>
          type.body_part_id === uniformFilters.body_part_id &&
          type.business_line_id === form.business_line_id && // ✅ CAMBIO
          type.sexe_id === uniformFilters.sexe_id
      );
      setFilteredUniformTypes(filtered);
    } else {
      setFilteredUniformTypes([]);
    }
  }, [uniformFilters, uniformTypes, form.business_line_id]); // ✅ AGREGAR DEPENDENCIA

  // Filtrar sucursales cuando cambia la entidad federativa
  useEffect(() => {
    if (form.federal_entity_id) {
      const filtered = branches.filter(
        (branch) => branch.federal_entity_id === form.federal_entity_id
      );
      setFilteredBranches(filtered);
      // Limpiar sucursal si ya no está en la lista filtrada
      if (form.branch_id && !filtered.find((b) => b.id === form.branch_id)) {
        setForm((prev) => ({ ...prev, branch_id: 0 }));
      }
    } else {
      setFilteredBranches([]);
      setForm((prev) => ({ ...prev, branch_id: 0 }));
    }
  }, [form.federal_entity_id, branches]);

  // ============================================
  // FUNCIONES FETCH
  // ============================================

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/invoices");
      // Normalizar los datos antes de guardarlos
      const normalizedInvoices = response.data.map((invoice: any) => ({
        ...invoice,
        subtotal:
          typeof invoice.subtotal === "string"
            ? parseFloat(invoice.subtotal)
            : invoice.subtotal,
        iva:
          typeof invoice.iva === "string"
            ? parseFloat(invoice.iva)
            : invoice.iva,
        total:
          typeof invoice.total === "string"
            ? parseFloat(invoice.total)
            : invoice.total,
        merchandise_paid: Boolean(invoice.merchandise_paid),
        invoice_paid: Boolean(invoice.invoice_paid),
      }));
      setInvoices(normalizedInvoices);
    } catch (error: any) {
      console.error("Error al obtener las facturas", error);
      if (error.response?.status !== 404) {
        showToast("Error al cargar las facturas", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal de detalles
  const handleViewDetails = async (invoiceId: number) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      const invoice = response.data;

      // Normalizar datos
      setSelectedInvoice({
        ...invoice,
        subtotal:
          typeof invoice.subtotal === "string"
            ? parseFloat(invoice.subtotal)
            : invoice.subtotal,
        iva:
          typeof invoice.iva === "string"
            ? parseFloat(invoice.iva)
            : invoice.iva,
        total:
          typeof invoice.total === "string"
            ? parseFloat(invoice.total)
            : invoice.total,
      });
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      showToast("Error al cargar los detalles de la factura", "error");
    }
  };

  // Función para cerrar modal
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  // Función para subir archivo
  const handleFileUpload = async (invoiceId: number, file: File) => {
    setUploadingFile(invoiceId);
    try {
      const formData = new FormData();
      formData.append("invoice_file", file);

      await api.post(`/invoices/${invoiceId}/upload-file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("Archivo subido exitosamente", "success");
      fetchInvoices(); // Recargar lista
    } catch (error: any) {
      console.error("Error al subir archivo:", error);
      const message =
        error.response?.data?.message || "Error al subir el archivo";
      showToast(message, "error");
    } finally {
      setUploadingFile(null);
    }
  };

  // Función para ver archivo
  const handleViewFile = (filename: string) => {
    if (!filename) return;
    const url = `${
      import.meta.env.VITE_API_URL || "http://localhost:8000"
    }/api/invoice-file/${filename.split("/").pop()}`;
    window.open(url, "_blank");
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/suppliers");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error al obtener los proveedores", error);
    }
  };

  const fetchBusinessLines = async () => {
    try {
      const response = await api.get("/business-lines");
      setBusinessLines(response.data);
    } catch (error) {
      console.error("Error al obtener las líneas de negocio", error);
    }
  };

  const fetchFederalEntities = async () => {
    try {
      const response = await api.get("/federal-entities");
      setFederalEntities(response.data);
    } catch (error) {
      console.error("Error al obtener las entidades federativas", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get("/branches");
      setBranches(response.data);
    } catch (error) {
      console.error("Error al obtener las sucursales", error);
    }
  };

  const fetchUniformTypes = async () => {
    try {
      const response = await api.get("/uniform-types");
      setUniformTypes(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de uniformes", error);
    }
  };
  const fetchBodyParts = async () => {
    try {
      const response = await api.get("/body-parts");
      setBodyParts(response.data);
    } catch (error) {
      console.error("Error al obtener las partes corporales", error);
    }
  };

  const fetchSexes = async () => {
    try {
      const response = await api.get("/sexes");
      const dataSinUltimo = response.data.slice(0, -1);
      setSexes(dataSinUltimo);
      // setSexes(response.data);
    } catch (error) {
      console.error("Error al obtener los sexos", error);
    }
  };

  const fetchColors = async () => {
    try {
      const response = await api.get("/colors");
      setColors(response.data);
    } catch (error) {
      console.error("Error al obtener los colores", error);
    }
  };

  const fetchSizesByUniformType = async (uniformTypeId: number) => {
    try {
      const response = await api.get(
        `/invoices/sizes-by-uniform/${uniformTypeId}`
      );
      setSizes(response.data);
    } catch (error) {
      console.error("Error al obtener las tallas", error);
      showToast("Error al cargar las tallas", "error");
    }
  };

const fetchColorsByUniformAndSize = async (uniformTypeId: number, sizeId: number) => {
  try {
    console.log('🔍 Buscando colores para uniform_type_id:', uniformTypeId);
    
    // ✅ NUEVO ENDPOINT: Obtener color del uniform_type
    const response = await api.get(`/invoices/colors-by-uniform/${uniformTypeId}`);
    const availableColors = response.data;
    
    console.log('✨ Colores disponibles:', availableColors);
    
    setFilteredColors(availableColors);
  } catch (error) {
    console.error("❌ Error al obtener colores disponibles:", error);
    setFilteredColors([]);
  }
};
  // ============================================
  // HANDLERS DEL FORMULARIO
  // ============================================

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
          : name === "folio"
          ? value.toUpperCase()
          : name === "supplier_id" ||
            name === "business_line_id" ||
            name === "branch_id" ||
            name === "payment_months"
          ? parseInt(value) || 0
          : value,
    });
  };

  const handleUniformFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setUniformFilters({
      ...uniformFilters,
      [name]: parseInt(value) || 0,
    });

    // Limpiar el formulario de uniformes cuando cambian los filtros
    setUniformForm({
      uniform_type_id: 0,
      size_id: 0,
      color_id: 0,
      sexe_id: 0,
      code: "",
      quantity: 1,
      unit_price: 0,
    });
    setSizes([]);
    setFilteredColors([]); // ✅ AGREGAR ESTA LÍNEA
  };

  const handleUniformChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "uniform_type_id") {
      const uniformTypeId = parseInt(value) || 0;

      // ✅ OBTENER INFORMACIÓN DEL UNIFORM TYPE SELECCIONADO
      const selectedUniformType = filteredUniformTypes.find(
        (type) => type.id === uniformTypeId
      );

      setUniformForm((prev) => ({
        ...prev,
        uniform_type_id: uniformTypeId,
        size_id: 0,
        color_id: 0, // ✅ También limpiar color
        code: "",
        sexe_id: selectedUniformType?.sexe_id || 0,
      }));

      if (uniformTypeId > 0) {
        fetchSizesByUniformType(uniformTypeId);
      } else {
        setSizes([]);
        setFilteredColors([]); // ✅ Limpiar colores también
      }
    } else if (name === "size_id") {
      // ✅ ESTE BLOQUE AHORA ESTÁ AL MISMO NIVEL QUE EL IF DE "uniform_type_id"
      const sizeId = parseInt(value) || 0;
      setUniformForm((prev) => ({
        ...prev,
        size_id: sizeId,
        color_id: 0, // Limpiar color cuando cambia la talla
      }));

      // ✅ Cargar colores disponibles para esta talla
      if (sizeId > 0 && uniformForm.uniform_type_id > 0) {
        fetchColorsByUniformAndSize(uniformForm.uniform_type_id, sizeId);
      } else {
        setFilteredColors([]);
      }
    } else {
      // ✅ ESTE ELSE MANEJA TODOS LOS DEMÁS CAMPOS
      setUniformForm({
        ...uniformForm,
        [name]:
          name === "color_id"
            ? parseInt(value) || 0
            : name === "quantity"
            ? parseInt(value) || 1
            : name === "unit_price"
            ? parseFloat(value) || 0
            : value.toUpperCase(),
      });
    }

    // Generar código automáticamente
    if (name === "uniform_type_id" || name === "size_id") {
      generateCode(
        name === "uniform_type_id"
          ? parseInt(value)
          : uniformForm.uniform_type_id,
        name === "size_id" ? parseInt(value) : uniformForm.size_id
      );
    }
  };

  const generateCode = (uniformTypeId: number, sizeId: number) => {
    if (uniformTypeId && sizeId) {
      const uniformType = uniformTypes.find((u) => u.id === uniformTypeId);
      const size = sizes.find((s) => s.id === sizeId);

      if (uniformType && size) {
        // Generar código: UT{id}-S{id} (ejemplo: UT1-S5)
        const code = `UT${uniformTypeId}-S${sizeId}`;
        setUniformForm((prev) => ({ ...prev, code }));
      }
    }
  };

  // ============================================
  // MANEJO DE UNIFORMES (Mini tabla temporal)
  // ============================================

  const addUniformItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uniformForm.uniform_type_id === 0) {
      showToast("Seleccione un tipo de mercancía", "error");
      return;
    }
    if (uniformForm.size_id === 0) {
      showToast("Seleccione una talla", "error");
      return;
    }
    if (uniformForm.color_id === 0) {
      showToast("Seleccione un color", "error");
      return;
    }
    if (uniformForm.quantity <= 0) {
      showToast("La cantidad debe ser mayor a 0", "error");
      return;
    }
    if (uniformForm.unit_price <= 0) {
      showToast("El precio unitario debe ser mayor a 0", "error");
      return;
    }

    const uniformType = uniformTypes.find(
      (u) => u.id === uniformForm.uniform_type_id
    );
    const size = sizes.find((s) => s.id === uniformForm.size_id);
    const color = colors.find((c) => c.id === uniformForm.color_id);

    // ✅ OBTENER NOMBRE DEL SEXO
    const sexe = sexes.find((s) => s.id === uniformForm.sexe_id);

    const newItem: UniformItem = {
      uniform_type_id: uniformForm.uniform_type_id,
      uniform_type_name: uniformType?.description || "",
      size_id: uniformForm.size_id,
      size_name: size?.description || "",
      color_id: uniformForm.color_id,
      color_name: color?.description || "",
      sexe_id: uniformForm.sexe_id,
      sexe_name: sexe?.name || "",
      code: uniformForm.code,
      quantity: uniformForm.quantity,
      unit_price: uniformForm.unit_price,
      subtotal: uniformForm.quantity * uniformForm.unit_price,
    };

    setUniformItems([...uniformItems, newItem]);

    // Limpiar el formulario de uniformes
    setUniformForm({
      uniform_type_id: 0,
      size_id: 0,
      color_id: 0,
      sexe_id: 0,
      code: "",
      quantity: 1,
      unit_price: 0,
    });
    setSizes([]);
    showToast("Uniforme agregado a la lista", "success");
  };

  // ============================================
  // CALCULAR TOTALES
  // ============================================

  const calculateTotals = () => {
    // Subtotal de uniformes
    const subtotalUniforms = uniformItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    // ✅ Aplicar ajustes
    const subtotal =
      subtotalUniforms +
      adjustments.shipping_cost +
      adjustments.freight_withholding -
      adjustments.discount;

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    return { subtotalUniforms, subtotal, iva, total };
  };

  // ============================================
  // SUBMIT - Guardar factura
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uniformItems.length === 0) {
      showToast("Debe agregar al menos un uniforme", "error");
      return;
    }
    // ✅ AGREGAR ESTAS VALIDACIONES
    if (!form.federal_entity_id || form.federal_entity_id === "") {
      showToast("Debe seleccionar una entidad federativa", "error");
      return;
    }

    if (form.branch_id === 0) {
      showToast("Debe seleccionar una sucursal", "error");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // const response = await api.post("/invoices", dataToSend);
      // Crear FormData si hay archivo, sino enviar JSON normal
      const formData = new FormData();
      formData.append("folio", form.folio);
      formData.append("supplier_id", String(form.supplier_id));
      formData.append("business_line_id", String(form.business_line_id));
      formData.append("payment_type", form.payment_type);
      if (form.payment_months) {
        formData.append("payment_months", String(form.payment_months));
      }
      formData.append("federal_entity_id", form.federal_entity_id);
      formData.append("branch_id", String(form.branch_id));
      formData.append("merchandise_paid", form.merchandise_paid ? "1" : "0"); // ✅ Envía "1" o "0"
      formData.append("invoice_paid", form.invoice_paid ? "1" : "0"); // ✅ Envía "1" o "0"

      formData.append("shipping_cost", String(adjustments.shipping_cost));
      formData.append(
        "freight_withholding",
        String(adjustments.freight_withholding)
      );
      formData.append("discount", String(adjustments.discount));

      // Agregar uniformes
      uniformItems.forEach((uniform, index) => {
        formData.append(
          `uniforms[${index}][uniform_type_id]`,
          String(uniform.uniform_type_id)
        );
        formData.append(`uniforms[${index}][sexe_id]`, String(uniform.sexe_id));
        formData.append(`uniforms[${index}][size_id]`, String(uniform.size_id));
        formData.append(
          `uniforms[${index}][color_id]`,
          String(uniform.color_id)
        ); // ✅ NUEVO
        formData.append(
          `uniforms[${index}][quantity]`,
          String(uniform.quantity)
        );
        formData.append(
          `uniforms[${index}][unit_price]`,
          String(uniform.unit_price)
        );
      });

      // Agregar archivo si existe
      const fileInput = document.getElementById(
        "invoice_file_input"
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("invoice_file", fileInput.files[0]);
      }

      const response = await api.post("/invoices", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setInvoices([response.data, ...invoices]);
      showToast("Factura creada exitosamente", "success");
      handleCloseModal();
      await fetchInvoices();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        showToast(
          error.response.data.message || "Error de validación",
          "error"
        );
      } else {
        console.error("Error al guardar la factura", error);
        showToast(
          error.response?.data?.message || "Error al guardar la factura",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setForm({
      folio: "",
      supplier_id: 0,
      business_line_id: 0,
      payment_type: "CONTADO",
      payment_months: 0,
      federal_entity_id: "",
      branch_id: 0,
      merchandise_paid: false,
      invoice_paid: false,
    });
    setUniformForm({
      uniform_type_id: 0,
      size_id: 0,
      color_id: 0,
      sexe_id: 0, // ✅ NUEVO
      code: "",
      quantity: 1,
      unit_price: 0,
    });
    setUniformFilters({
      body_part_id: 0,
      sexe_id: 0,
    });
    setFilteredUniformTypes([]);
    setUniformItems([]);

    // ✅ NUEVO: Limpiar ajustes
    setAdjustments({
      shipping_cost: 0,
      freight_withholding: 0,
      discount: 0,
    });

    setErrors({});
    setSizes([]);
    setFilteredColors([]);
    setIsModalOpen(false);
  };

  // ============================================
  // BÚSQUEDA Y EXPORTACIÓN
  // ============================================

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.folio.toLowerCase().includes(search.toLowerCase()) ||
      invoice.supplier?.legal_name.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredInvoices.map((invoice) => ({
          Folio: invoice.folio,
          Proveedor: invoice.supplier?.legal_name || "N/A",
          "Segmento Negocio": invoice.business_line?.name || "N/A",
          "Tipo Pago": invoice.payment_type,
          Subtotal: invoice.subtotal,
          IVA: invoice.iva,
          Total: invoice.total,
          Estado: invoice.federal_entity?.name || "N/A",
          Sucursal: invoice.branch?.name || "N/A",
          "Mercancía Pagada": invoice.merchandise_paid ? "Sí" : "No",
          "Factura Pagada": invoice.invoice_paid ? "Sí" : "No",
          Fecha: new Date(invoice.created_at).toLocaleDateString(),
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Facturas");
      XLSX.writeFile(wb, "facturas.xlsx");
      showToast("Archivo Excel exportado exitosamente", "success");
    } catch (error) {
      console.error("Error al exportar Excel", error);
      showToast("Error al exportar el archivo Excel", "error");
    }
  };

  // ============================================
  // COLUMNAS DE LA TABLA
  // ============================================

  const columns = [
    {
      key: "id",
      header: "ID",
      align: "center" as const,
      render: (row: Invoice) => <Badge text={`#${row.id}`} variant="primary" />,
    },
    {
      key: "folio",
      header: "Folio",
      align: "center" as const,
      render: (row: Invoice) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.folio}
        </span>
      ),
    },
    {
      key: "supplier",
      header: "Proveedor",
      align: "center" as const,
      render: (row: Invoice) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {row.supplier?.legal_name || "N/A"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right" as const,
      render: (row: Invoice) => {
        const total =
          typeof row.total === "string" ? parseFloat(row.total) : row.total;
        return (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            ${total.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "payment_type",
      header: "Pago",
      align: "center" as const,
      render: (row: Invoice) => (
        <Badge
          text={row.payment_type}
          variant={row.payment_type === "CONTADO" ? "success" : "warning"}
        />
      ),
    },

    {
      key: "merchandise_paid",
      header: "Merc. Entregada",
      align: "center" as const,
      render: (row: Invoice) =>
        row.merchandise_paid ? (
          <Badge text="✓ Entregada" variant="success" />
        ) : (
          <Badge text="○ Pendiente" variant="warning" />
        ),
    },
    {
      key: "invoice_paid",
      header: "Fact. Pagada",
      align: "center" as const,
      render: (row: Invoice) =>
        row.invoice_paid ? (
          <Badge text="✓ Pagada" variant="success" />
        ) : (
          <Badge text="○ Pendiente" variant="warning" />
        ),
    },
    {
      key: "invoice_file",
      header: "Archivo",
      align: "center" as const,
      render: (row: Invoice) => (
        <div className="flex justify-center gap-2">
          {row.invoice_file ? (
            <button
              onClick={() => handleViewFile(row.invoice_file!)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              title="Ver archivo"
            >
              <FileText size={20} />
            </button>
          ) : (
            <label
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 cursor-pointer"
              title="Subir archivo"
            >
              <Upload size={20} />
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(row.id, file);
                  }
                }}
                disabled={uploadingFile === row.id}
              />
            </label>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      width: "100px",
      align: "center" as const,
      render: (row: Invoice) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleViewDetails(row.id)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Ver detalles"
          >
            <Eye size={20} />
          </button>
          {/* Otros botones de acciones si los hay */}
        </div>
      ),
    },
  ];

  const totals = calculateTotals();

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {ToastComponent}
      <div className="w-full max-w-5xl mx-auto overflow-x-hidden bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-yellow-500">
            Facturas
          </h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            theme="add"
            text="Nueva Factura"
          />
        </div>

        {/* BARRA DE BÚSQUEDA Y EXPORTAR */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por folio o proveedor..."
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
            Mostrando {filteredInvoices.length} de {invoices.length}{" "}
            {filteredInvoices.length === 1 ? "registro" : "registros"}
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
        <Table
          data={filteredInvoices}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No hay facturas registradas"
          mobileBreakpoint="lg"
          mobileCardRender={(row) => (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Badge text={`#${row.id}`} variant="primary" />
                <div className="flex gap-2">
                  <Badge
                    text={row.payment_type}
                    variant={
                      row.payment_type === "CONTADO" ? "success" : "warning"
                    }
                  />
                  {row.invoice_file && (
                    <button
                      onClick={() => handleViewFile(row.invoice_file!)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <FileText size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {row.folio}
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    <span className="font-medium">Proveedor:</span>{" "}
                    {row.supplier?.legal_name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span>{" "}
                    <span className="font-semibold">
                      $
                      {(typeof row.total === "string"
                        ? parseFloat(row.total)
                        : row.total
                      ).toFixed(2)}
                    </span>
                  </p>
                  <div className="flex gap-2 mt-2">
                    {row.merchandise_paid && (
                      <Badge text="M. Pagada" variant="success" />
                    )}
                    {row.invoice_paid && (
                      <Badge text="F. Pagada" variant="success" />
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleViewDetails(row.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Detalles
              </button>
            </div>
          )}
        />
        </div>
      </div>

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
              className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                touchAction: "auto",
                animation: "modalAppear 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Header */}
              {ToastComponent}
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-700 dark:from-blue-500 dark:to-blue-800 px-6 py-4 border-b border-blue-500 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Nueva Factura
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
                  {/* SECCIÓN 1: Información Básica de la Factura */}
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Información de la Factura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Folio <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="folio"
                          value={form.folio}
                          onChange={handleChange}
                          maxLength={20}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.folio
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                          placeholder="FAC-001"
                        />
                        {errors.folio && (
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
                            {errors.folio[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Proveedor <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="supplier_id"
                          value={form.supplier_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.supplier_id
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value={0}>Seleccione un proveedor</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.legal_name}
                            </option>
                          ))}
                        </select>
                        {errors.supplier_id && (
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
                            {errors.supplier_id[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Línea de Negocio{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="business_line_id"
                          value={form.business_line_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.business_line_id
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value={0}>Seleccione un segmento</option>
                          {businessLines.map((line) => (
                            <option key={line.id} value={line.id}>
                              {line.name}
                            </option>
                          ))}
                        </select>
                        {errors.business_line_id && (
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
                            {errors.business_line_id[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tipo de Pago <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="payment_type"
                          value={form.payment_type}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="CONTADO">CONTADO</option>
                          <option value="CREDITO">CRÉDITO</option>
                        </select>
                      </div>

                      {form.payment_type === "CREDITO" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Meses de Crédito{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="payment_months"
                            value={form.payment_months}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                              errors.payment_months
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value={0}>Seleccione meses</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (month) => (
                                <option key={month} value={month}>
                                  {month} {month === 1 ? "mes" : "meses"}
                                </option>
                              )
                            )}
                          </select>
                          {errors.payment_months && (
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
                              {errors.payment_months[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Agregar Uniformes
                    </h3>

                    {/* Filtros para seleccionar el tipo de uniforme */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-300 dark:border-gray-600 ">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Lugar Corporal <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="body_part_id"
                          value={uniformFilters.body_part_id}
                          onChange={handleUniformFilterChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={0}>Seleccione lugar corporal</option>
                          {bodyParts.map((part) => (
                            <option key={part.id} value={part.id}>
                              {part.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sexo <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="sexe_id"
                          value={uniformFilters.sexe_id}
                          onChange={handleUniformFilterChange}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={0}>Seleccione sexo</option>
                          {sexes.map((sex) => (
                            <option key={sex.id} value={sex.id}>
                              {sex.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tipo de Mercancía
                        </label>
                        <select
                          name="uniform_type_id"
                          value={uniformForm.uniform_type_id}
                          onChange={handleUniformChange}
                          disabled={filteredUniformTypes.length === 0}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={0}>
                            {filteredUniformTypes.length === 0
                              ? "Seleccione filtros primero"
                              : "Seleccione tipo"}
                          </option>
                          {filteredUniformTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Talla
                        </label>
                        <select
                          name="size_id"
                          value={uniformForm.size_id}
                          onChange={handleUniformChange}
                          disabled={uniformForm.uniform_type_id === 0}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={0}>Seleccione talla</option>
                          {sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                              {size.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Color
                        </label>
                        <select
                          name="color_id"
                          value={uniformForm.color_id}
                          onChange={handleUniformChange}
                          disabled={uniformForm.size_id === 0 || filteredColors.length === 0}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={0}>Seleccione color</option>
                          {filteredColors.map((color) => (
                            <option key={color.id} value={color.id}>
                              {color.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Código
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={uniformForm.code}
                          readOnly
                          className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 font-mono cursor-not-allowed"
                          placeholder="Auto"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={uniformForm.quantity}
                          onChange={handleUniformChange}
                          min="1"
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Precio Unitario
                        </label>
                        <input
                          type="number"
                          name="unit_price"
                          value={uniformForm.unit_price}
                          onChange={handleUniformChange}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={addUniformItem}
                      theme="add"
                      text="Agregar Uniforme"
                      size=".8rem"
                      loading={loading}
                      loadingText="Agregando Uniforme..."
                    />

                    {/* Mini Tabla de Uniformes */}
                    {uniformItems.length > 0 && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                              <th className="px-3 py-2 text-left">Tipo</th>
                              <th className="px-3 py-2 text-left">Sexo</th>
                              <th className="px-3 py-2 text-left">Talla</th>
                              <th className="px-3 py-2 text-left">Color</th>
                              <th className="px-3 py-2 text-left">Código</th>
                              <th className="px-3 py-2 text-right">Cant.</th>
                              <th className="px-3 py-2 text-right">P. Unit.</th>
                              <th className="px-3 py-2 text-right">Subtotal</th>
                              <th className="px-3 py-2 text-center">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uniformItems.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-200 dark:border-gray-700"
                              >
                                <td className="px-3 py-2">
                                  {item.uniform_type_name}
                                </td>
                                <td className="px-3 py-2">{item.sexe_name}</td>
                                <td className="px-3 py-2">{item.size_name}</td>
                                <td className="px-3 py-2">{item.color_name}</td>
                                <td className="px-3 py-2 font-mono text-xs">
                                  {item.code}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {item.quantity}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  ${item.unit_price.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold">
                                  ${item.subtotal.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = uniformItems.filter(
                                        (_, i) => i !== index
                                      );
                                      setUniformItems(newItems);
                                    }}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {errors.uniforms && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-2 flex items-center gap-1">
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
                        {errors.uniforms[0]}
                      </p>
                    )}
                  </div>

                  {/* ✅ NUEVOS INPUTS DE AJUSTES */}
                  {uniformItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Costo de Envío
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={adjustments.shipping_cost}
                          onChange={(e) =>
                            setAdjustments({
                              ...adjustments,
                              shipping_cost: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Retención por Flete
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={adjustments.freight_withholding}
                          onChange={(e) =>
                            setAdjustments({
                              ...adjustments,
                              freight_withholding:
                                parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descuento
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={adjustments.discount}
                          onChange={(e) =>
                            setAdjustments({
                              ...adjustments,
                              discount: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 3: Totales */}
                  {uniformItems.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Totales
                      </h3>
                      <div className="space-y-2">
                        {/* ✅ NUEVO: Subtotal de Uniformes */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Subtotal Uniformes:
                          </span>
                          <span className="font-medium">
                            ${totals.subtotalUniforms.toFixed(2)}
                          </span>
                        </div>

                        {/* ✅ MOSTRAR AJUSTES SI SON > 0 */}
                        {adjustments.shipping_cost > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              + Costo de Envío:
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              ${adjustments.shipping_cost.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {adjustments.freight_withholding > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              + Retención Flete:
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              ${adjustments.freight_withholding.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {adjustments.discount > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              - Descuento:
                            </span>
                            <span className="text-red-600 dark:text-red-400">
                              -${adjustments.discount.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Subtotal Final */}
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="text-gray-700 dark:text-gray-300">
                            Subtotal:
                          </span>
                          <span className="font-semibold text-lg">
                            ${totals.subtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            IVA (16%):
                          </span>
                          <span className="font-semibold text-lg">
                            ${totals.iva.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span className="text-gray-900 dark:text-gray-100">
                            Total:
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 text-xl">
                            ${totals.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 4: Destino */}
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Destino
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Entidad a Recibir{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="federal_entity_id"
                          value={form.federal_entity_id}
                          onChange={handleChange}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sucursal a Recibir{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="branch_id"
                          value={form.branch_id}
                          onChange={handleChange}
                          disabled={!form.federal_entity_id}
                          className={`w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border ${
                            errors.branch_id
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value={0}>Seleccione una sucursal</option>
                          {filteredBranches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name} ({branch.code})
                            </option>
                          ))}
                        </select>
                        {errors.branch_id && (
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
                            {errors.branch_id[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 5: Estados de Pago */}
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Estados de la Factura
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="merchandise_paid"
                          checked={form.merchandise_paid}
                          onChange={handleChange}
                          className="accent-blue-500 w-5 h-5 cursor-pointer"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Mercancía Entregada
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="invoice_paid"
                          checked={form.invoice_paid}
                          onChange={handleChange}
                          className="accent-blue-500 w-5 h-5 cursor-pointer"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Factura Pagada
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Campo para subir archivo */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Archivo de Factura (Opcional)
                    </label>
                    <input
                      type="file"
                      id="invoice_file_input"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Formatos permitidos: PDF, JPG, JPEG, PNG (máx. 10MB)
                    </p>
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
                    theme="add"
                    text="Guardar Factura"
                    loading={loading}
                    loadingText="Guardando..."
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Modal de detalles */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
