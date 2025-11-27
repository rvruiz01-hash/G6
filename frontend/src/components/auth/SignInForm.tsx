import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // Se agrega useNavigate

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  // const { login } = useContext(AuthContext);
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error(
      "AuthContext no está disponible. ¿Olvidaste envolver tu app en <AuthProvider>?"
    );
  }

  const { login } = auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate(); // Inicializa el hook useNavigate

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, "");
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    // navigate("/dashboard");
    event.preventDefault();
    setErrorMsg(""); // Limpia el error anterior
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    try {
      const success = await login(sanitizedEmail, sanitizedPassword);
      if (success) {
        console.log("Login correcto: Redirigiendo...");
        navigate("/dashboard", { replace: true }); // <--- Redirige aquí
      }
    } catch (error) {
      setErrorMsg("Credenciales incorrectas. Intenta de nuevo.");
      console.error("Error al enviar el formulario", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 mb-30">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Pagina Principal
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto mt-4">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            </div>
            <form onSubmit={handleSignIn}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Usuario <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Usuario"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ¿Olvidaste Tu Contraseña?
                  </Link>
                </div>
                <div>
                  <Button
                    theme="login"
                    text="Iniciar Sesión"
                  />
                </div>
              </div>
              {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
