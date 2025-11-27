// src/types/axios.d.ts
import { AxiosRequestConfig } from "axios";

// Extiende la configuración de Axios para incluir 'ignoreSessionExpired'
declare module "axios" {
  interface AxiosRequestConfig {
    ignoreSessionExpired?: boolean;
  }
}
