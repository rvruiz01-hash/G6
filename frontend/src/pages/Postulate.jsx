import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api from "../../services/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Postulate = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  // Función para consultar usuarios
  const consultarUsuarios = async () => {
    try {
      const response = await api.get("/users");
      console.log("Usuarios:", response.data);
    } catch (error) {
      console.error("Error al consultar usuarios:", error);
    }
  };
  return (
    <>
      <h1>Bienvenido {user?.name ?? "usuario"} a la página de postulación</h1>
      <Button
        clase="button button--animation-left"
        onSubmit={consultarUsuarios}
      >
        Consultar Usuarios
      </Button>
      <Button clase="button button--animation-left" onSubmit={logout}>
        Cerrar sesión
      </Button>
    </>
  );
};

export default Postulate;
