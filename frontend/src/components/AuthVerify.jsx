import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthVerify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const { exp } = jwtDecode(token);
      if (exp * 1000 < Date.now()) {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      }
    }
  }, [navigate]); // solo se ejecuta al montar, o cuando navigate cambia

  return null;
};
export default AuthVerify;
