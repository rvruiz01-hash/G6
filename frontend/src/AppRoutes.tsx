// AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import { useModules } from "./context/ModuleContext";

// Páginas fijas
import Home from "./pages/Dashboard/Home";
import RegistroAsistencia from "./pages/RegistroAsistencia";
import Plantillas from "./pages/Plantillas/PlantillaSemanal";
import LineaDeNegocio from "./pages/Catalogos/BusinessLines";
import PartesCorporales from "./pages/Catalogos/BodyParts/BodyPart";
import Colores from "./pages/Catalogos/Color/Color";
import Tallas from "./pages/Catalogos/Size/Size";
import TiposUniformes from "./pages/Catalogos/TypeUniform/TypesUniforms";
import Bancos from "./pages/Catalogos/Bank/Bank";
import Proveedor from "./pages/Supplier";
import Sucursales from "./pages/Catalogos/branch";
import Factura from "./pages/Invoice";
import Quoter from "./pages/Quoter";
import OrganizationalChart from "./pages/OrganizationalChart/OrganizationalChart";
import Departments from "./pages/Catalogos/Departments/Departments";
import Positions from "./pages/Catalogos/Positions/Positions";
import DepartmentsAndPositions from "./pages/Catalogos/OrganizationalStructure/DepartmentsAndPositions";
import UniformParameters from "./pages/Catalogos/UniformParameters/UniformParameters";

export default function AppRoutes() {
  const { modules } = useModules();

  return (
    <Routes>
      {/* Rutas fijas */}
      <Route index element={<Home />} />
      <Route path="registro-asistencia" element={<RegistroAsistencia />} />
      <Route path="plantillas/semanal" element={<Plantillas />} />
      <Route path="catalogos/lineas_de_negocio" element={<LineaDeNegocio />} />
      <Route path="catalogos/lugar_corporal" element={<PartesCorporales />} />
      <Route path="catalogos/Colores" element={<Colores />} />
      <Route path="catalogos/Tallas" element={<Tallas />} />
      <Route path="catalogos/tipos_uniformes" element={<TiposUniformes />} />
      <Route path="catalogos/bancos" element={<Bancos />} />
      <Route path="proveedores" element={<Proveedor />} />
      <Route path="catalogos/sucursales" element={<Sucursales />} />
      <Route path="Facturas" element={<Factura />} />
      <Route path="Organigrama" element={<OrganizationalChart />} />
      <Route path="cotizador" element={<Quoter />} />
      <Route
        path="/estructura_organizacional"
        element={<DepartmentsAndPositions />}
      />
      <Route path="/catalogos/departamentos" element={<Departments />} />
      <Route path="/catalogos/posiciones" element={<Positions />} />
      <Route
        path="/Parametros_Uniformes"
        element={<UniformParameters />}
      />
      {/* Rutas dinámicas desde la API */}
      {modules.flatMap((module) => {
        const routes = [];

        // Ruta para el módulo principal (si tiene path)
        if (module.path) {
          routes.push(
            <Route
              key={`module-${module.id}`}
              path={module.path.replace(/^\//, "")}
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {module.name}
                  </h1>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    Vista dinámica del módulo <b>{module.name}</b>
                  </p>
                </div>
              }
            />
          );
        }

        // Rutas para submódulos (si existen y tienen path)
        if (Array.isArray(module.subModules)) {
          module.subModules.forEach((sub) => {
            if (sub.path) {
              routes.push(
                <Route
                  key={`submodule-${sub.id}`}
                  path={sub.path.replace(/^\//, "")}
                  element={
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sub.name}
                      </h1>
                      <p className="mt-4 text-gray-600 dark:text-gray-300">
                        Vista dinámica del submódulo <b>{sub.name}</b>
                      </p>
                    </div>
                  }
                />
              );
            }
          });
        }

        return routes;
      })}
      <Route path="*" element={<Home />} /> {/* 👈 fallback */}
    </Routes>
  );
}
