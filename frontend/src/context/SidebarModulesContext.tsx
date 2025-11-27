import { createContext, useContext, useState, ReactNode } from "react";

type Module = {
  id: number;
  name: string;
  icon_svg: string;
  path?: string;
};

interface SidebarModulesContextType {
  modules: Module[];
  setModules: (modules: Module[]) => void;
}

const SidebarModulesContext = createContext<
  SidebarModulesContextType | undefined
>(undefined);

export function SidebarModulesProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<Module[]>([]);

  return (
    <SidebarModulesContext.Provider value={{ modules, setModules }}>
      {children}
    </SidebarModulesContext.Provider>
  );
}

export function useSidebarModules() {
  const context = useContext(SidebarModulesContext);
  if (!context)
    throw new Error(
      "useSidebarModules debe usarse dentro de SidebarModulesProvider"
    );
  return context;
}
