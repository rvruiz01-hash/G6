// src/pages/Catalogos/Positions/PositionDriverSteps.ts
import { driver, Driver } from "driver.js";

export const getPositionDriverSteps = (): Driver => {
  const driverObj = driver({
    showProgress: true,
    showButtons: ["next", "previous", "close"],
    nextBtnText: "Siguiente →",
    prevBtnText: "← Atrás",
    doneBtnText: "✓ Finalizar",
    popoverClass: "driver-popover-custom",

    // ✅ Texto de progreso en español
    progressText: "{{current}} de {{total}}",

    onDestroyStarted: () => {
      if (driverObj.isLastStep()) {
        localStorage.setItem("tour_positions_completed", "true");
      }
      driverObj.destroy();
    },

    steps: [
      {
        element: '[data-tour="bodyForm"]',
        popover: {
          title: "👋 ¡Bienvenido a Posiciones!",
          description: `
            <p style="margin-bottom: 12px;">
              Este módulo te permite crear y administrar todas las posiciones 
              de tu organización con su jerarquía.
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
        element: '[data-tour="position-form"]',
        popover: {
          title: "📝 Formulario de Posición",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 12px;">
                Aquí puedes crear una nueva posición. Completa todos los campos requeridos.
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
        element: '[data-tour="position-form-name"]',
        popover: {
          title: "📌 Nombre de la Posición",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 8px;">
                Ingresa el nombre de la posición (ej. GERENTE DE VENTAS).
              </p>
              <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
                El nombre debe ser único en el sistema.
              </p>
            </div>
          `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="position-form-level"]',
        popover: {
          title: "📊 Nivel Jerárquico",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 8px;">
                Define el nivel jerárquico (1-10). Nivel 1 es el más alto.
              </p>
              <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem;">
                <li>Nivel 1: Dirección/Gerencia General</li>
                <li>Nivel 2-3: Gerencias/Jefaturas</li>
                <li>Nivel 4+: Supervisión/Operación</li>
              </ul>
            </div>
          `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="position-form-business-line"]',
        popover: {
          title: "🏢 Línea de Negocio",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 12px;">
                Selecciona la línea de negocio a la que pertenece esta posición.
              </p>
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
                          border-left: 4px solid #f59e0b; 
                          padding: 12px; 
                          border-radius: 6px;">
                <strong style="color: #92400e;">⚠️ Importante:</strong>
                <span style="color: #78350f; font-size: 0.875rem;">
                  Solo podrás asignar supervisores de la misma línea de negocio.
                </span>
              </div>
            </div>
          `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="position-form-reports-to"]',
        popover: {
          title: "👤 Reporta a (Supervisor)",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 12px;">
                Selecciona el supervisor directo de esta posición.
              </p>
              <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem;">
                <li>✓ Solo muestra posiciones de la misma línea de negocio</li>
                <li>✓ Solo muestra posiciones con nivel menor</li>
                <li>✓ Puedes dejarlo vacío si no tiene supervisor</li>
              </ul>
            </div>
          `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="position-search"]',
        popover: {
          title: "🔍 Búsqueda Rápida",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 8px;">
                Usa esta barra para encontrar posiciones rápidamente.
              </p>
              <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
                Busca por nombre de posición.
              </p>
            </div>
          `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="position-filter-department"]',
        popover: {
          title: "🏛️ Filtrar por Departamento",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 8px;">
                Filtra las posiciones por departamento para una búsqueda más específica.
              </p>
            </div>
          `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="position-export"]',
        popover: {
          title: "📥 Exportar Datos",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 8px;">
                Exporta la lista de posiciones en formato Excel.
              </p>
              <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">
                Incluye toda la información jerárquica.
              </p>
            </div>
          `,
          side: "left",
          align: "start",
        },
      },
      {
        element: '[data-tour="position-table"]',
        popover: {
          title: "📊 Tabla de Posiciones",
          description: `
            <div style="line-height: 1.6;">
              <p style="margin-bottom: 12px;">
                Aquí verás todas las posiciones registradas con su información jerárquica.
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
              <p style="margin-bottom: 16px; font-size: 0.9375rem;">
                ¡Excelente! Ya conoces las funciones principales del módulo de Posiciones.
                Ahora puedes comenzar a crear y gestionar la estructura organizacional.
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
