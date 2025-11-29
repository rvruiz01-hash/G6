// src/pages/Catalogos/Bank/bankDriverSteps.ts
import { driver, Driver } from "driver.js";

export const getBankDriverSteps = (): Driver => {
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
        localStorage.setItem("tour_bank_completed", "true");
      }
      driverObj.destroy();
    },

    steps: [
      {
        element: '[data-tour="bodyForm"]',
        popover: {
          title: "👋 ¡Bienvenido a Bancos!",
          description: `
                <p style="margin-bottom: 12px;">
                  Este módulo te permite crear y administrar todos los bancos 
                  de tu organización.
                </p>
                <p style="font-size: 0.875rem; margin: 0;">
                  Te guiaré paso a paso para que aprendas a usarlo. 🚀
                </p>
            `,
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="bank_form"]',
        popover: {
          title: "📝 Formulario del Banco",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí puedes crear un nuevo banco".
                </p>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="bank_name"]',
        popover: {
          title: "📝 Nombre del banco",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí debes ingresar el nombre del banco.
                </p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            border-left: 4px solid #3b82f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            margin-top: 12px;">
                  <strong style="color: #1e40af;">💡 Recuerda:</strong>
                  <span style="color: #1e3a8a; font-size: 0.875rem;">
                    Ese nombre aparecerá en los selectores de todo el sistema.
                  </span>
                </div>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="bank_code"]',
        popover: {
          title: "🔢 Código del banco",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí debes ingresar el código del banco".
                </p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            border-left: 4px solid #3b82f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            margin-top: 12px;">
                  <strong style="color: #1e40af;">💡 Recuerda:</strong>
                  <span style="color: #1e3a8a; font-size: 0.875rem;">
                    Ese código será usado para validar el número de cuenta bancaria correcta.
                  </span>
                </div>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="bank_status"]',
        popover: {
          title: "✅​ Estatus del Banco",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí debes marcar o desmarcar el estatus del banco".
                </p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            border-left: 4px solid #3b82f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            margin-top: 12px;">
                  <strong style="color: #1e40af;">💡 Ten en cuenta:</strong>
                  <span style="color: #1e3a8a; font-size: 0.875rem;">
                    Este estatus dará opción a que el banco este habilitado o bloqueado para su uso.
                  </span>
                </div>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="bank_button_add"]',
        popover: {
          title: "➕​ Boton agregar",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Agregará el banco a la base ".
                </p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            border-left: 4px solid #3b82f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            margin-top: 12px;">
                  <strong style="color: #1e40af;">💡 Recuerda:</strong>
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
        element: '[data-tour="bank_button_dowload"]',
        popover: {
          title: "📥 Boton descargar",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Descarga la tabla en excel.
                </p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            border-left: 4px solid #3b82f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            margin-top: 12px;">
                  <strong style="color: #1e40af;">💡 Atención:</strong>
                  <span style="color: #1e3a8a; font-size: 0.875rem;">
                    📊 Si se aplicó algún filtro se decargará con los registros que se muestrán.
                  </span>
                </div>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="bank_registers"]',
        popover: {
          title: "🧾 Total de registros",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí muestra el total de los registros y cuántos se están visualizando en la pantalla".
                </p>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="bank_table"]',
        popover: {
          title: "📔 Lista de bancos",
          description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">
                  Aquí se mostraran todos los bancos previamente registrados".
                </p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                            border-left: 4px solid #3b82f6; 
                            padding: 12px; 
                            border-radius: 6px; 
                            margin-top: 12px;">
                  <strong style="color: #1e40af;">💡 Tip:</strong>
                  <span style="color: #1e3a8a; font-size: 0.875rem;">
                    Puedes editar cualquier registro desde el campo de acciones.
                  </span>
                </div>
              </div>
            `,
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="bodyForm"]',
        popover: {
          title: "🎉 ¡Tour Completado!",
          description: `
        <div style="line-height: 1.6;">
          <p style="margin-bottom: 16px;  font-size: 0.9375rem;">
            ¡Excelente! Ya conoces las funciones principales del módulo de Bancos.
            Ahora puedes comenzar a crear y gestionar todos los bancos.
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
