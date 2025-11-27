// src/pages/Quoter.tsx
import { useState, useEffect } from "react";
import { Plus, Trash2, Calculator, FileText } from "lucide-react";
import api from "../../services/api";

// ========== INTERFACES ==========
interface BusinessLine {
  id: number;
  description: string;
}

interface ShiftType {
  id: number;
  name: string;
  total_rest_days: number;
}

interface FederalEntity {
  id: string;
  name: string;
}

interface Sex {
  id: number;
  name: string;
}

interface BodyPart {
  id: number;
  description: string;
}

interface UniformType {
  id: number;
  description: string;
}

interface UniformOption {
  uniform_stock_id: number;
  size_description: string;
  color_description: string;
  unit_price: number;
  available_quantity: number; // ✅ NUEVO
  option_label: string;
}

interface UniformRow {
  sex_id: number;
  sex_name: string;
  body_part_id: number;
  body_part_name: string;
  uniform_type_id: number;
  uniform_type_name: string;
  uniform_stock_id: number;
  option_label: string;
  quantity: number;
  unit_price: number;
}

interface QuotationResult {
  quotation_id: number;
  folio: string;
  monthly_salary: number;
  total_benefits: number;
  total_social_charge: number;
  state_tax: number;
  total_cost_per_guard: number;
  uniform_cost: number;
  sale_cost_without_financing: number;
  financing: number;
  utility: number;
  sale_price: number;
  breakdown: {
    rest_days_pay: number;
    holiday_pay: number;
    day_31_pay: number;
    vacations: number;
    vacation_premium: number;
    christmas_bonus: number;
    seniority_pay: number;
    admin_expenses: number;
  };
  uniforms_details: Array<{
    uniform_type: string;
    size: string;
    color: string;
    quantity: number;
    max_unit_price: number;
    subtotal: number;
  }>;
}

export default function Quoter() {
  // ========== ESTADOS - CATÁLOGOS ==========
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [federalEntities, setFederalEntities] = useState<FederalEntity[]>([]);
  const [sexes, setSexes] = useState<Sex[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [uniformTypes, setUniformTypes] = useState<UniformType[]>([]);
  const [uniformOptions, setUniformOptions] = useState<UniformOption[]>([]);

  // ========== ESTADOS - FORMULARIO PRINCIPAL ==========
  const [businessLineId, setBusinessLineId] = useState("");
  const [shiftTypeId, setShiftTypeId] = useState("");
  const [federalEntityId, setFederalEntityId] = useState("");
  const [netSalary, setNetSalary] = useState("");
  const [totalElements, setTotalElements] = useState("");
  const [totalRestDays, setTotalRestDays] = useState("");
  const [hasHolidays, setHasHolidays] = useState(false);
  const [hasDay31, setHasDay31] = useState(false);

  // ========== ESTADOS - SELECTORES UNIFORMES ==========
  const [selectedSex, setSelectedSex] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedUniformType, setSelectedUniformType] = useState("");
  const [selectedUniformOption, setSelectedUniformOption] = useState("");
  const [uniformQuantity, setUniformQuantity] = useState("1");

  // Estados para tallas y colores separados
  // const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);

  // ========== ESTADOS - UNIFORMES AGREGADOS ==========
  const [uniformRows, setUniformRows] = useState<UniformRow[]>([]);

  // ========== ESTADOS - RESULTADO Y UI ==========
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quotationResult, setQuotationResult] =
    useState<QuotationResult | null>(null);

  // ========== CARGAR CATÁLOGOS INICIALES ==========
  useEffect(() => {
    loadBusinessLines();
    loadSexes();
    loadBodyParts();
    loadColors();
  }, []);

  const loadBusinessLines = async () => {
    try {
      const response = await api.get("/business-lines");
      setBusinessLines(response.data);
    } catch (error) {
      console.error("Error al cargar líneas de negocio:", error);
    }
  };

  const loadSexes = async () => {
    try {
      const response = await api.get("/sexes");
      const dataSinUltimo = response.data.slice(0, -1);
      setSexes(dataSinUltimo);
    } catch (error) {
      console.error("Error al cargar sexos:", error);
    }
  };

  const loadBodyParts = async () => {
    try {
      const response = await api.get("/body-parts");
      setBodyParts(response.data);
    } catch (error) {
      console.error("Error al cargar partes corporales:", error);
    }
  };

  const loadColors = async () => {
    try {
      const response = await api.get("/colors");
      setColors(response.data);
    } catch (error) {
      console.error("Error al cargar colores:", error);
    }
  };

  // ========== HANDLERS - FORMULARIO PRINCIPAL ==========
  const handleBusinessLineChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setBusinessLineId(value);
    setShiftTypeId("");
    setFederalEntityId("");
    setShiftTypes([]);
    setFederalEntities([]);

    if (value) {
      try {
        const [shiftsResponse, entitiesResponse] = await Promise.all([
          api.get(`/quoter/shift-types/business-line/${value}`),
          api.get(`/federal-entities`),
        ]);
        setShiftTypes(shiftsResponse.data.data);
        setFederalEntities(entitiesResponse.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    }
  };

  const handleShiftTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShiftTypeId(value);

    const shiftType = shiftTypes.find((st) => st.id === parseInt(value));
    if (shiftType && totalElements) {
      const restDays = shiftType.total_rest_days * parseInt(totalElements);
      setTotalRestDays(restDays.toString());
    }
  };

  const handleTotalElementsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setTotalElements(value);

    if (shiftTypeId && value) {
      const shiftType = shiftTypes.find(
        (st) => st.id === parseInt(shiftTypeId)
      );
      if (shiftType) {
        const restDays = shiftType.total_rest_days * parseInt(value);
        setTotalRestDays(restDays.toString());
      }
    }
  };

  // ========== EFECTO - CARGAR TIPOS DE UNIFORME ==========
  useEffect(() => {
    if (businessLineId && selectedSex && selectedBodyPart) {
      loadUniformTypes();
    } else {
      setUniformTypes([]);
      setSelectedUniformType("");
    }
  }, [businessLineId, selectedSex, selectedBodyPart]);

  const loadUniformTypes = async () => {
    try {
      // ✅ CORRECCIÓN: Usar la misma ruta que Invoice.tsx
      const response = await api.get("/uniform-types");

      // ✅ FILTRAR los tipos de uniforme con los 3 criterios
      const filtered = response.data.filter(
        (type: any) =>
          type.business_line_id === parseInt(businessLineId) &&
          type.sexe_id === parseInt(selectedSex) &&
          type.body_part_id === parseInt(selectedBodyPart)
      );

      setUniformTypes(filtered);
    } catch (error) {
      console.error("Error al cargar tipos de uniforme:", error);
      setUniformTypes([]);
    }
  };

  // ========== EFECTO - CARGAR TALLAS CUANDO CAMBIA EL TIPO DE UNIFORME ==========
  useEffect(() => {
    console.log(
      "🔄 useEffect disparado - selectedUniformType:",
      selectedUniformType
    );

    if (selectedUniformType) {
      loadUniformOptions();
    } else {
      setUniformOptions([]);
      setSelectedUniformOption("");
    }
  }, [selectedUniformType]);

  const loadUniformOptions = async () => {
    try {
      console.log(
        "🚀 Iniciando carga de opciones para uniform_type_id:",
        selectedUniformType
      );

      const response = await api.get(
        `/invoices/uniform-options/${selectedUniformType}`
      );
      const options = response.data;

      console.log("✅ Opciones recibidas del backend:", options);
      console.log("📊 Total de opciones:", options.length);

      if (!options || options.length === 0) {
        console.warn(
          "⚠️ No se encontraron opciones para este tipo de uniforme"
        );
        setUniformOptions([]);
        return;
      }

      const validOptions = options.filter((opt: any) => {
        const isValid =
          opt.uniform_stock_id &&
          opt.size_description &&
          opt.color_description &&
          opt.unit_price !== undefined;

        if (!isValid) {
          console.warn("⚠️ Opción inválida detectada:", opt);
        }

        return isValid;
      });

      console.log("✅ Opciones válidas:", validOptions.length);
      setUniformOptions(validOptions);
    } catch (error: any) {
      console.error("❌ Error al cargar opciones de uniformes:", error);
      console.error("Detalles del error:", error.response?.data);
      setUniformOptions([]);
    }
  };

  // ========== AGREGAR UNIFORME A LA TABLA ==========
  const addUniformRow = () => {
    if (
      !selectedSex ||
      !selectedBodyPart ||
      !selectedUniformType ||
      !selectedUniformOption ||
      !uniformQuantity
    ) {
      alert("Por favor completa todos los campos de uniforme");
      return;
    }

    const sex = sexes.find((s) => s.id === parseInt(selectedSex));
    const bodyPart = bodyParts.find(
      (bp) => bp.id === parseInt(selectedBodyPart)
    );
    const uniformType = uniformTypes.find(
      (ut) => ut.id === parseInt(selectedUniformType)
    );
    const uniformOption = uniformOptions.find(
      (uo) => uo.uniform_stock_id === parseInt(selectedUniformOption)
    );

    if (!sex || !bodyPart || !uniformType || !uniformOption) {
      return;
    }

    const newRow: UniformRow = {
      sex_id: sex.id,
      sex_name: sex.name,
      body_part_id: bodyPart.id,
      body_part_name: bodyPart.description,
      uniform_type_id: uniformType.id,
      uniform_type_name: uniformType.description,
      uniform_stock_id: uniformOption.uniform_stock_id,
      option_label: uniformOption.option_label,
      quantity: parseInt(uniformQuantity),
      unit_price: uniformOption.unit_price,
    };

    setUniformRows([...uniformRows, newRow]);

    // Limpiar selectores
    setSelectedSex("");
    setSelectedBodyPart("");
    setSelectedUniformType("");
    setSelectedUniformOption("");
    setUniformQuantity("1");
    setUniformTypes([]);
    setUniformOptions([]);
  };

  // ========== ELIMINAR UNIFORME ==========
  const removeUniformRow = (index: number) => {
    setUniformRows(uniformRows.filter((_, i) => i !== index));
  };

  // ========== CALCULAR COTIZACIÓN ==========
  const handleCalculate = async () => {
    if (
      !businessLineId ||
      !shiftTypeId ||
      !federalEntityId ||
      !netSalary ||
      !totalElements ||
      uniformRows.length === 0
    ) {
      alert(
        "Por favor completa todos los campos requeridos y agrega al menos un uniforme"
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        business_line_id: parseInt(businessLineId),
        shift_type_id: parseInt(shiftTypeId),
        federal_entity_id: federalEntityId,
        net_salary: parseFloat(netSalary),
        total_elements: parseInt(totalElements),
        total_rest_days: parseInt(totalRestDays),
        has_holidays: hasHolidays,
        has_day_31: hasDay31,
        uniforms: uniformRows.map((row) => ({
          uniform_stock_id: row.uniform_stock_id,
          quantity: row.quantity,
        })),
      };

      const response = await api.post("/quoter/calculate", payload);
      setQuotationResult(response.data.data);
      setShowResult(true);
    } catch (error: any) {
      console.error("Error al calcular:", error);
      alert(error.response?.data?.message || "Error al calcular cotización");
    } finally {
      setLoading(false);
    }
  };

  // ========== GENERAR PDF ==========
  const handleGeneratePDF = async () => {
    if (!quotationResult) return;

    setLoading(true);
    try {
      const payload = {
        business_line_id: parseInt(businessLineId),
        shift_type_id: parseInt(shiftTypeId),
        federal_entity_id: federalEntityId,
        net_salary: parseFloat(netSalary),
        total_elements: parseInt(totalElements),
        total_rest_days: parseInt(totalRestDays),
        has_holidays: hasHolidays,
        has_day_31: hasDay31,
        uniforms: uniformRows.map((row) => ({
          uniform_stock_id: row.uniform_stock_id,
          quantity: row.quantity,
        })),
      };

      const response = await api.post("/quoter/generate-pdf", payload, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Cotizacion_${quotationResult.folio}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar PDF");
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cotizador</h1>
        <p className="text-gray-600">
          Genera cotizaciones de servicios de seguridad
        </p>
      </div>

      {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Información General
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Línea de Negocio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea de Negocio *
            </label>
            <select
              value={businessLineId}
              onChange={handleBusinessLineChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar...</option>
              {businessLines.map((bl) => (
                <option key={bl.id} value={bl.id}>
                  {bl.description}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Turno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Turno *
            </label>
            <select
              value={shiftTypeId}
              onChange={handleShiftTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!businessLineId}
              required
            >
              <option value="">Seleccionar...</option>
              {shiftTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Entidad Federativa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entidad Federativa *
            </label>
            <select
              value={federalEntityId}
              onChange={(e) => setFederalEntityId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!businessLineId}
              required
            >
              <option value="">Seleccionar...</option>
              {federalEntities.map((fe) => (
                <option key={fe.id} value={fe.id}>
                  {fe.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sueldo Neto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sueldo Neto *
            </label>
            <input
              type="number"
              value={netSalary}
              onChange={(e) => setNetSalary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Total de Elementos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total de Elementos *
            </label>
            <input
              type="number"
              value={totalElements}
              onChange={handleTotalElementsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="1"
              required
            />
          </div>

          {/* Total de Descansos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total de Descansos
            </label>
            <input
              type="number"
              value={totalRestDays}
              onChange={(e) => setTotalRestDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              readOnly
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mt-4 flex gap-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasHolidays}
              onChange={(e) => setHasHolidays(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Incluye Días Festivos</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasDay31}
              onChange={(e) => setHasDay31(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Incluye Día 31</span>
          </label>
        </div>
      </div>

      {/* SECCIÓN 2: SELECCIÓN DE UNIFORMES */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Selección de Uniformes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo *
            </label>
            <select
              value={selectedSex}
              onChange={(e) => {
                setSelectedSex(e.target.value);
                setSelectedBodyPart("");
                setSelectedUniformType("");
                setSelectedUniformOption("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!businessLineId}
            >
              <option value="">Seleccionar...</option>
              {sexes.map((sex) => (
                <option key={sex.id} value={sex.id}>
                  {sex.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lugar Corporal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar Corporal *
            </label>
            <select
              value={selectedBodyPart}
              onChange={(e) => {
                setSelectedBodyPart(e.target.value);
                setSelectedUniformType("");
                setSelectedUniformOption("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedSex}
            >
              <option value="">Seleccionar...</option>
              {bodyParts.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.description}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Uniforme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Uniforme *
            </label>
            <select
              value={selectedUniformType}
              onChange={(e) => {
                const value = e.target.value;
                console.log("👉 Usuario seleccionó uniform_type_id:", value);
                setSelectedUniformType(value);
                setSelectedUniformOption("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedBodyPart || uniformTypes.length === 0}
            >
              <option value="">Seleccionar...</option>
              {uniformTypes.map((ut) => (
                <option key={ut.id} value={ut.id}>
                  {ut.description}
                </option>
              ))}
            </select>
          </div>

          {/* Opción (Talla + Color) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Talla y Color *
            </label>
            <select
              value={selectedUniformOption}
              onChange={(e) => setSelectedUniformOption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedUniformType || uniformOptions.length === 0}
            >
              <option value="">
                {!selectedUniformType
                  ? "Seleccione tipo primero"
                  : uniformOptions.length === 0
                  ? "Sin stock disponible"
                  : "Seleccionar..."}
              </option>
              {uniformOptions.map((uo) => (
                <option key={uo.uniform_stock_id} value={uo.uniform_stock_id}>
                  {uo.option_label}{" "}
                  {uo.available_quantity > 1 &&
                    `(${uo.available_quantity} disponibles)`}
                </option>
              ))}
            </select>
            {selectedUniformType && uniformOptions.length === 0 && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                ⚠️ No hay uniformes en stock para esta combinación
              </p>
            )}
            {selectedUniformType && uniformOptions.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ✅ {uniformOptions.length} opción(es) disponible(s)
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={uniformQuantity}
                onChange={(e) => setUniformQuantity(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={addUniformRow}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                title="Agregar uniforme"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de uniformes agregados */}
        {uniformRows.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Uniformes Agregados</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sexo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lugar Corporal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Opción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uniformRows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.sex_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.body_part_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.uniform_type_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.option_label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {row.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${row.unit_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeUniformRow(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: BOTONES DE ACCIÓN */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={handleCalculate}
          disabled={loading || uniformRows.length === 0}
          className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          {loading ? "Calculando..." : "Calcular Cotización"}
        </button>

        {quotationResult && (
          <button
            onClick={handleGeneratePDF}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Generar PDF
          </button>
        )}
      </div>

      {/* SECCIÓN 4: RESULTADO */}
      {showResult && quotationResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Resultado - Folio: {quotationResult.folio}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Sueldo Mensual</p>
              <p className="text-2xl font-bold text-blue-600">
                ${quotationResult.monthly_salary.toFixed(2)}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Prestaciones Totales</p>
              <p className="text-2xl font-bold text-green-600">
                ${quotationResult.total_benefits.toFixed(2)}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Carga Social (IMSS)</p>
              <p className="text-2xl font-bold text-purple-600">
                ${quotationResult.total_social_charge.toFixed(2)}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Impuesto Estatal</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${quotationResult.state_tax.toFixed(2)}
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Costo Uniformes</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${quotationResult.uniform_cost.toFixed(2)}
              </p>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Costo Total por Guardia</p>
              <p className="text-2xl font-bold text-pink-600">
                ${quotationResult.total_cost_per_guard.toFixed(2)}
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg col-span-full">
              <p className="text-sm text-gray-600">PRECIO DE VENTA FINAL</p>
              <p className="text-4xl font-bold text-orange-600">
                ${quotationResult.sale_price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Desglose de Uniformes */}
          {quotationResult.uniforms_details &&
            quotationResult.uniforms_details.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Desglose de Uniformes
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Talla
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Color
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Precio Máx.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotationResult.uniforms_details.map(
                        (uniform, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm">
                              {uniform.uniform_type}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {uniform.size}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {uniform.color}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {uniform.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              ${uniform.max_unit_price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              ${uniform.subtotal.toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
