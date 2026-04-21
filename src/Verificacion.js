import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Css/Verificacion.css";
import {
  generarCodigo2FAService,
  verificarCodigo2FAService,
} from "./Api/Api-Admin/Login";
import { useAuth } from "./Authcontext"; // agregar

function Verificacion() {
  const navigate = useNavigate();

  const { guardarSesion } = useAuth();
  const [paso, setPaso]                 = useState("metodo");
  const [metodo, setMetodo]             = useState("Email");
  const [codigo, setCodigo]             = useState("");
  const [error, setError]               = useState(null);
  const [exito, setExito]               = useState(null);
  const [cargando, setCargando]         = useState(false);
  const [sesion, setSesion]             = useState(null);
  const [verificacion, setVerificacion] = useState(null);

  // Recuperar sesión temporal desde el login
  useEffect(() => {
    const datos = sessionStorage.getItem("sesion_2fa");
    if (!datos) {
      navigate("/");
      return;
    }
    setSesion(JSON.parse(datos));
  }, [navigate]);

  // ── Paso 1: Elegir método y enviar código ──────────────────
  const handleEnviarCodigo = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    setCargando(true);

    try {
      const res = await generarCodigo2FAService(sesion.id_user, metodo);

      if (!res.ok) {
        setError(res.mensaje);
        return;
      }

      setVerificacion(res.data);
      setExito(`Código enviado a ${res.data.destino_parcial}`);
      setPaso("codigo");

    } catch (err) {
      setError("No se pudo enviar el código. Intente nuevamente.");
      console.error("[Verificacion] handleEnviarCodigo:", err);
    } finally {
      setCargando(false);
    }
  };

  // ── Paso 2: Verificar código ingresado ─────────────────────
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    setCargando(true);

    try {
      const res = await verificarCodigo2FAService(
        sesion.id_user,
        verificacion.id_verificacion,
        codigo
      );

      if (!res.ok) {
        setError(res.mensaje);
        return;
      }

      // Verificación exitosa
      sessionStorage.removeItem("sesion_2fa");
      guardarSesion(sesion);
      navigate("/admin");

    } catch (err) {
      setError("No se pudo verificar el código. Intente nuevamente.");
      console.error("[Verificacion] handleVerificarCodigo:", err);
    } finally {
      setCargando(false);
    }
  };

  // ── Reenviar código ────────────────────────────────────────
  const handleReenviar = () => {
    setPaso("metodo");
    setError(null);
    setExito(null);
    setCodigo("");
    setVerificacion(null);
  };

  const volverAlLogin = () => {
    sessionStorage.removeItem("sesion_2fa");
    navigate("/");
  };

  if (!sesion) return null;

  return (
    <div className="Page">
      <div className="formulario">

        {/* ── PASO 1: Elegir método ── */}
        {paso === "metodo" && (
          <>
            <h1>Verificación</h1>
            <form onSubmit={handleEnviarCodigo}>

              <div className="bienvenida">
                
                <p>Elige cómo recibir tu código de seguridad:</p>
              </div>

              <div className="username">
                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  disabled={cargando}
                  className="select-metodo"
                >
                  <option value="Email">Correo electrónico</option>
                  <option value="Telefono">Teléfono</option>
                </select>
                <label className="label-activo">Método de verificación</label>
                <span></span>
              </div>

              {error && <p className="error">{error}</p>}

              <input
                type="submit"
                value={cargando ? "Enviando..." : "Enviar código"}
                disabled={cargando}
              />

              <button
                type="button"
                className="btn-volver"
                onClick={volverAlLogin}
                disabled={cargando}
              >
                ← Volver al inicio de sesión
              </button>

            </form>
          </>
        )}

        {/* ── PASO 2: Ingresar código ── */}
        {paso === "codigo" && (
          <>
            <h1>Ingresa el código</h1>
            <form onSubmit={handleVerificarCodigo}>

              <div className="bienvenida">
                {exito && <p className="exito">✓ {exito}</p>}
                <p>El código expira en <strong>10 minutos</strong>.</p>
              </div>

              <div className="username">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  
                  disabled={cargando}
                  autoComplete="one-time-code"
                />
                <label className={codigo ? "label-activo" : ""}>
                  Código de 6 dígitos
                </label>
                <span></span>
              </div>

              {error && <p className="error">{error}</p>}

              <input
                type="submit"
                value={cargando ? "Verificando..." : "Verificar"}
                disabled={cargando || codigo.length < 6}
              />

              <button
                type="button"
                className="btn-volver"
                onClick={handleReenviar}
                disabled={cargando}
              >
                ← Reenviar código
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default Verificacion;