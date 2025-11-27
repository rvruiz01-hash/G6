import { createContext, useState, useContext, ReactNode } from "react";

type DropdownType = "user" | "role" | "notifications" | null;

interface DropdownContextType {
  openDropdown: DropdownType;
  setOpenDropdown: (dropdown: DropdownType) => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined
);

export function DropdownProvider({ children }: { children: ReactNode }) {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  return (
    <DropdownContext.Provider value={{ openDropdown, setOpenDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context)
    throw new Error("useDropdown debe usarse dentro de DropdownProvider");
  return context;
}
