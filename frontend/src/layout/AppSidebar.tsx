import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useModules } from "../context/ModuleContext";
import logoIcon from "/images/logo/g6_sin_fondo.ico";

type ModuleType = {
  id: number;
  name: string;
  icon_svg: string;
  path?: string;
  subModules?: ModuleType[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { modules }: { modules: ModuleType[] } = useModules();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string | undefined) =>
      path
        ? location.pathname === `/dashboard/${path.replace(/^\//, "")}`
        : false,
    [location.pathname]
  );

  // 👇 ESTA ES LA FUNCIÓN QUE TE FALTA
  const isModuleActive = useCallback(
    (module: ModuleType) => {
      // Si el módulo tiene path directo y está activo
      if (module.path && isActive(module.path)) {
        return true;
      }
      // Si alguno de sus submódulos está activo
      if (module.subModules && module.subModules.length > 0) {
        return module.subModules.some((sub) => isActive(sub.path));
      }
      return false;
    },
    [isActive]
  );

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  // 👇 Nuevo handler para cerrar submenús al dar click en un submódulo
  const handleSubModuleClick = () => {
    setOpenSubmenu(null);
  };

  // Nuevo handler para módulos sin hijos
  const handleModuleClick = () => {
    setOpenSubmenu(null);
  };

  useEffect(() => {
    if (openSubmenu !== null) {
      const el = subMenuRefs.current[openSubmenu];
      if (el) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [openSubmenu]: el.scrollHeight,
        }));
      }
    }
  }, [openSubmenu]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setOpenSubmenu(null);
      }}
    >
      <div className="py-8 flex justify-center">
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src={logoIcon}
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src={logoIcon}
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img src={logoIcon} alt="Logo" width={50} height={50} />
          )}
        </Link>
      </div>

      <nav className="mb-6 flex-1 overflow-y-auto no-scrollbar">
        <ul className="flex flex-col gap-4">
          {modules.map((module, index) => (
            <li key={module.id}>
              {module.subModules && module.subModules.length > 0 ? (
                <>
                  <button
                    onClick={() => handleSubmenuToggle(index)}
                    className={`menu-item group cursor-pointer ${
                      isModuleActive(module)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span className="menu-item-icon-size">
                      <img
                        src={`/images/modules/${module.icon_svg}`}
                        className="w-6 h-6 group-hover:opacity-80"
                      />
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="ml-2">{module.name}</span>
                    )}
                  </button>
                  <div
                    ref={(el) => {
                      subMenuRefs.current[index] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        openSubmenu === index
                          ? `${subMenuHeight[index] || 0}px`
                          : "0px",
                    }}
                  >
                    <ul className="ml-6 mt-2 flex flex-col gap-1">
                      {module.subModules.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            to={`/dashboard/${
                              sub.path?.replace(/^\//, "") || "#"
                            }`}
                            className={`menu-dropdown-item ${
                              isActive(
                                `/dashboard/${sub.path?.replace(/^\//, "")}`
                              )
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive"
                            }`}
                            onClick={handleSubModuleClick}
                          >
                            <span className="menu-item-icon-size">
                              <img
                                src={`/images/modules/${sub.icon_svg}`}
                                className="w-4 h-4 group-hover:opacity-80"
                              />
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                              <span className="ml-2">{sub.name}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <Link
                  to={`/dashboard/${module.path?.replace(/^\//, "") || "#"}`}
                  className={`menu-item group ${
                    isActive(`/dashboard/${module.path?.replace(/^\//, "")}`)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                  onClick={handleModuleClick} // 👈 aquí cierras submenús al click en módulos simples
                >
                  <span className="menu-item-icon-size">
                    <img
                      src={`/images/modules/${module.icon_svg}`}
                      className="w-6 h-6 group-hover:opacity-80"
                    />
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="ml-2">{module.name}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;
