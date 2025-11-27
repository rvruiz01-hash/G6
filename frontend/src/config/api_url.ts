export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getEmployeePhotoUrl = (
  filename: string | null | undefined
): string => {
  if (!filename) {
    return "/images/user/default.jpg";
  }
  
  return `${API_URL}/api/employee-photo/${filename}`; // ← Agregar /api aquí
};