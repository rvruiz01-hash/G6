import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { DropdownProvider } from "./context/DropdownContext";
import { SidebarModulesProvider } from "./context/SidebarModulesContext";
import { ModuleProvider } from "./context/ModuleContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DropdownProvider>
          <ThemeProvider>
            <SidebarModulesProvider>
              <ModuleProvider>
                <AppWrapper>
                  <App />
                </AppWrapper>
              </ModuleProvider>
            </SidebarModulesProvider>
          </ThemeProvider>
        </DropdownProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
