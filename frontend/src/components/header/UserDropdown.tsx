import { useContext } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
// import { Link } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import { getEmployeePhotoUrl } from "../../config/api_url";
import { useDropdown } from "../../context/DropdownContext";
import settingsUserIcon from "/images/userDropDown/settingsUser.svg";
import passwordIcon from "/images/userDropDown/password.svg";
import supportIcon from "/images/userDropDown/support.svg";
import LogOutIcon from "/images/userDropDown/logOutIcon.svg";
export default function UserDropdown() {
  const { openDropdown, setOpenDropdown } = useDropdown();
  const isOpen = openDropdown === "user";

  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error(
      "AuthContext no está disponible. ¿Olvidaste envolver tu app en <AuthProvider>?"
    );
  }

  const { user, logout, isSessionChecked } = auth;

  if (!isSessionChecked) {
    return <div className="h-11 w-11 rounded-full bg-gray-200 animate-pulse" />;
  }

  function toggleDropdown() {
    setOpenDropdown(isOpen ? null : "user");
  }

  function closeDropdown() {
    setOpenDropdown(null);
  }

  function handleLogout() {
    closeDropdown();
    logout();
  }

  // Valores con fallback si no hay usuario
  const displayName = user?.name || "Usuario";
  const displayEmail = user?.email || "usuario@ejemplo.com";
  const displayPhoto = getEmployeePhotoUrl(user?.photo);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src={displayPhoto} alt="User" title="Usuario" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {displayName}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {displayName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {displayEmail}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <img
                src={settingsUserIcon}
                alt="Editar Información"
                className="w-6 h-6 group-hover:opacity-80"
              />
              Editar Información
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <img
                src={passwordIcon}
                alt="Actualizar Contraseña"
                className="w-6 h-6 group-hover:opacity-80"
              />
              Actualizar Contraseña
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <img
                src={supportIcon}
                alt="Soporte"
                className="w-6 h-6 group-hover:opacity-80"
              />
              Soporte
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
        >
          <img src={LogOutIcon} alt="Cerrar sesión" className="w-6 h-6" />
          Cerrar Sesión
        </button>
      </Dropdown>
    </div>
  );
}
