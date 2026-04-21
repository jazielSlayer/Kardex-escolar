import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Login.css";
import { loginService } from "./Api/Api-Admin/Login";
import { useAuth } from "./Authcontext"; // agregar

function LoginPantalla() {
  const navigate = useNavigate();

   const { guardarSesion } = useAuth();
  const [correo, setCorreo]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await loginService(correo, password);

      if (!res.ok) {
        setError(res.mensaje);
        return;
      }

      // Sin 2FA: Estudiante o Padre → dashboard directo
      if (!res.requiere_2fa) {
         guardarSesion(res.data);
        navigate("/dashboard");
        return;
      }

      // Con 2FA: Admin, Docente, Director, Secretaria → verificación
      sessionStorage.setItem("sesion_2fa", JSON.stringify(res.data));
      navigate("/verificacion");

    } catch (err) {
      setError("No se pudo conectar con el servidor. Intente nuevamente.");
      console.error("[LoginPantalla]", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="Page">
      <div className="formulario">
        <h1>Inicio de sesión</h1>
        <form onSubmit={handleLogin}>

          <div className="username">
            <input
              type="text"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={cargando}
              autoComplete="email"
            />
            <label>Correo</label>
            <span></span>
          </div>

          <div className="username">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
              autoComplete="current-password"
            />
            <label>Contraseña</label>
            <span></span>
          </div>

          {error && <p className="error">{error}</p>}

          <input
            type="submit"
            value={cargando ? "Verificando..." : "Iniciar"}
            disabled={cargando}
          />

        </form>
      </div>
    </div>
  );
}

export default LoginPantalla;