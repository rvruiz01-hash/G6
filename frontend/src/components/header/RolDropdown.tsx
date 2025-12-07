import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import api from "../../../services/api";
import { useDropdown } from "../../context/DropdownContext";
import { useModules } from "../../context/ModuleContext"; // 👈 Nuevo contexto para módulos
import userRoleIcon from "/images/rolDropDown/UserRole.svg";

interface Module {
  id: number;
  name: string;
  icon_svg: string;
  path: string;
  parent_id: number | null;
  status: boolean;
  // Puedes agregar más campos si aparecen otros
}

interface Role {
  id: number;
  name: string;
  icono_svg: string;
  modules: Module[]; // ✅ Tipado correctamente
  pivot?: {
    is_primary: boolean;
  };
}

export default function RolDropdown() {
  const { openDropdown, setOpenDropdown } = useDropdown();
  const { setModules } = useModules(); // 👈 actualiza módulos dinámicos
  const isOpen = openDropdown === "role";
  // const [roles, setRoles] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  function toggleDropdown() {
    setOpenDropdown(isOpen ? null : "role");
  }

  function closeDropdown() {
    setOpenDropdown(null);
  }

  // async function handleRoleSelect(role: any) {
  async function handleRoleSelect(role: Role) {
    try {
      // 1. Guardamos módulos de ese rol en el contexto
      // const response = await api.get(`/roles/${role.id}/modules`);
      // console.log("modules del rol:", role.modules);

      setModules(role.modules);

      // 2. Cerramos el dropdown
      closeDropdown();
    } catch (error) {
      console.error("Error al cargar módulos del rol:", error);
    }
  }

  useEffect(() => {
  async function fetchRoles() {
    try {
      const response = await api.get("Logged_User_Roles");
      const rolesFromApi = response.data.data.roles;
      setRoles(rolesFromApi);

      const primaryRole = rolesFromApi.find(
        (role: Role) => role.pivot?.is_primary
      );

      if (primaryRole) {
        setModules(primaryRole.modules); // ✅ ok usar aquí
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }
  fetchRoles();
}, []); // ✅ se ejecuta solo una vez al montar

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <img
          src={userRoleIcon}
          alt="Roles de Usuario"
          className="w-6 h-6 group-hover:opacity-80"
          title="Seleccionar Rol"
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute left-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          {Array.isArray(roles) &&
            roles.map((role) => (
              <li key={role.id}>
                <DropdownItem
                  onItemClick={() => handleRoleSelect(role)} // 👈 aquí seleccionamos rol y cargamos módulos
                  tag="button"
                  className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <img
                    src={`/images/rolDropDown/${role.icono_svg}`}
                    alt={role.name}
                    className="w-6 h-6 group-hover:opacity-80"
                  />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {role.name}
                  </span>

                  {role.pivot?.is_primary && (
                    <span className="ml-auto text-green-500">(Principal)</span>
                  )}
                </DropdownItem>
              </li>
            ))}
        </ul>
      </Dropdown>
    </div>
  );
}
