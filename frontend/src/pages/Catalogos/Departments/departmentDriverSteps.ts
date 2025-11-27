// src/pages/Catalogos/Departments/departmentDriverSteps.ts
import { driver, Driver } from "driver.js";

export const getDepartmentDriverSteps = (): Driver => {
  const driverObj = driver({
    showProgress: true,
    showButtons: ["next", "previous", "close"],
    nextBtnText: "Siguiente →",
    prevBtnText: "← Atrás",
    doneBtnText: "✓ Finalizar",
    popoverClass: "driver-popover-custom",

    // ✅ AGREGADO: Texto de progreso en español
    progressText: "{{current}} de {{total}}",

    onDestroyStarted: () => {
      if (driverObj.isLastStep()) {
        localStorage.setItem("tour_departments_completed", "true");
      }
      driverObj.destroy();
    },

    steps: [
      {
        element: '[data-tour="bodyForm"]',
        popover: {
          title: "👋 ¡Bienvenido a Departamentos!",
          description: `
                <p style="margin-bottom: 12px;">
                  Este módulo te permite crear y administrar todos los departamentos 
                  de tu organización.
                </p>
                <p style="font-size: 0.875rem; margin: 0;">
                  Te guiaré paso a paso para que aprendas a usarlo. 🚀
                </p>
            `,
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="department-form"]',
        popover: {
          title: "📝 Formulario de Departamento",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí puedes crear un nuevo departamento. Solo ingresa el nombre 
                  y haz clic en "Agregar".
                </p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            border-left: 4px solid #3b82f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            margin-top: 12px;">
                  <strong style="color: #1e40af;">💡 Tip:</strong>
                  <span style="color: #1e3a8a; font-size: 0.875rem;">
                    El nombre se guardará automáticamente en MAYÚSCULAS.
                  </span>
                </div>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="department-search"]',
        popover: {
          title: "🔍 Búsqueda Rápida",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Usa esta barra para encontrar departamentos rápidamente.
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem;">
                  <li>✓ Búsqueda en tiempo real</li>
                  <li>✓ No distingue mayúsculas/minúsculas</li>
                  <li>✓ Busca en el nombre del departamento</li>
                </ul>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="department-export"]',
        popover: {
          title: "📥 Exportar Datos",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Exporta la lista en formato:
                </p>
                <div style="font-size: 0.875rem;">
                  <div>📊 <strong>Excel:</strong> Archivo .xlsx con formato</div>
                </div>
              </div>
            `,
          side: "left",
          align: "start",
        },
      },
      {
        element: '[data-tour="department-table"]',
        popover: {
          title: "📊 Tabla de Departamentos",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí verás todos los departamentos registrados.
                </p>
                <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); 
                            border-left: 4px solid #10b981; 
                            padding: 12px; 
                            border-radius: 6px;">
                  <strong style="color: #065f46;">✏️ Para editar:</strong>
                  <span style="color: #064e3b; font-size: 0.875rem;">
                    Haz clic en el ícono de lápiz.
                  </span>
                </div>
              </div>
            `,
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="bodyForm"]',
        popover: {
          title: "🎉 ¡Tour Completado!",
          description: `
        <div style="line-height: 1.6;">
          <p style="margin-bottom: 16px;  font-size: 0.9375rem;">
            ¡Excelente! Ya conoces las funciones principales del módulo de Departamentos.
            Ahora puedes comenzar a crear y gestionar departamentos.
          </p>
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
                      border: 1px solid #d1d5db; 
                      padding: 14px; 
                      border-radius: 8px;">
            <div style="display: flex; align-items: start; gap: 10px;">
              <span style="font-size: 1.5rem;">💡</span>
              <div>
                <strong style="color: #374151; display: block; margin-bottom: 4px;">
                  Recuerda:
                </strong>
                <span style="font-size: 0.875rem; color: #4b5563; line-height: 1.5;">
                  Puedes volver a ver este tutorial en cualquier momento 
                  haciendo clic en el botón <strong>"Tutorial"</strong> en la parte superior derecha.
                </span>
              </div>
            </div>
          </div>
        </div>
      `,
          side: "top",
          align: "center",
        },
      },
    ],
  });

  return driverObj;
};
