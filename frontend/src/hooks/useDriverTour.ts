// src/hooks/useDriverTour.ts
import { useCallback, useState } from "react";
import { driver, DriveStep, Config } from "driver.js";
import "driver.js/dist/driver.css";

export interface TourConfig {
  showProgress?: boolean;
  showButtons?: string[];
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;
}

export function useDriverTour(tourKey: string, config?: TourConfig) {
  const [isRunning, setIsRunning] = useState(false);

  // Verificar si el usuario ya vio el tour
  const hasSeenTour = useCallback(() => {
    return localStorage.getItem(`tour_${tourKey}_completed`) === "true";
  }, [tourKey]);

  // Marcar tour como completado
  const completeTour = useCallback(() => {
    localStorage.setItem(`tour_${tourKey}_completed`, "true");
    setIsRunning(false);
    console.log(`✅ Tour "${tourKey}" completado`);
  }, [tourKey]);

  // Iniciar el tour
  const startTour = useCallback(
    (steps: DriveStep[]) => {
      const driverObj = driver({
        showProgress: config?.showProgress ?? true,
        showButtons: config?.showButtons ?? ["next", "previous", "close"],
        nextBtnText: config?.nextBtnText ?? "Siguiente →",
        prevBtnText: config?.prevBtnText ?? "← Atrás",
        doneBtnText: config?.doneBtnText ?? "✓ Finalizar",

        // Configuración de estilos
        popoverClass: "driver-popover-custom",

        // Callbacks
        onDestroyStarted: () => {
          if (driverObj.isLastStep()) {
            completeTour();
          }
          driverObj.destroy();
        },

        onNextClick: () => {
          driverObj.moveNext();
        },

        onPrevClick: () => {
          driverObj.movePrevious();
        },

        onCloseClick: () => {
          driverObj.destroy();
          setIsRunning(false);
        },

        steps: steps,
      });

      setIsRunning(true);
      driverObj.drive();
    },
    [config, completeTour]
  );

  // Reiniciar el tour
  const resetTour = useCallback(
    (steps: DriveStep[]) => {
      localStorage.removeItem(`tour_${tourKey}_completed`);
      startTour(steps);
    },
    [tourKey, startTour]
  );

  return {
    isRunning,
    startTour,
    resetTour,
    completeTour,
    hasSeenTour,
  };
}
