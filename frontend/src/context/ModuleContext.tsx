import { createContext, useContext, useState, ReactNode } from "react";

export type ModuleType = {
  id: number;
  name: string;
  icon_svg: string;
  path?: string;
  parent_id: number | null;
  status: boolean;
  subModules?: ModuleType[];
};

type ModuleContextType = {
  modules: ModuleType[];
  setModules: (modules: ModuleType[]) => void;
};

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

// 🧩 Función recursiva para ordenar módulos y submódulos alfabéticamente
function sortModulesRecursively(modules: ModuleType[]): ModuleType[] {
  return [...modules]
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
    .map((mod) => ({
      ...mod,
      subModules: mod.subModules
        ? sortModulesRecursively(mod.subModules)
        : [],
    }));
}

export const ModuleProvider = ({ children }: { children: ReactNode }) => {
  const [modules, setModulesState] = useState<ModuleType[]>([]);

  // ✅ Siempre guarda los módulos ya ordenados
  const setModules = (newModules: ModuleType[]) => {
    const sortedModules = sortModulesRecursively(newModules);
    setModulesState(sortedModules);
  };

  return (
    <ModuleContext.Provider value={{ modules, setModules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModules must be used within a ModuleProvider");
  }
  return context;
};
