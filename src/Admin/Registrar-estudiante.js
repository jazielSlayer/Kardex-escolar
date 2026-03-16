import { useState } from "react";
import "../Css/Registrar-estudiante.css";
import ImportarNav from "../Navegacion/InportarNav";
import { registrarEstudiante } from "../Api/Api-Admin/Registrar";

/* ── Datos vacíos ───────────────────────────────────────── */
const ESTUDIANTE_INIT = {
  nombre: "", apellido: "", ci: "", fecha_nacimiento: "",
  genero: "", direccion: "", telefono: "", email_personal: "",
  nacionalidad: "Boliviana", estado_civil: "",
  correo: "", password: "",
  tipo_sangre: "", alergias: "", condiciones_medicas: "",
  medicamentos: "", seguro_medico: "", numero_hermanos: 0,
  posicion_hermanos: "", vive_con: "", necesidades_especiales: "",
  transporte: "",
};

const INSCRIPCION_INIT = {
  id_grado: "", tipo_inscripcion: "Nueva",
  colegio_procedencia: "", motivo_traslado: "",
  monto_matricula: 0, descuento_matricula: 0,
  tipo_estudiante: "Regular", requiere_apoyo: 0,
  observaciones: "",
};

const TUTOR_INIT = {
  nombre: "", apellido: "", ci: "", fecha_nacimiento: "",
  genero_persona: "", direccion: "", telefono: "",
  email_personal: "", nacionalidad: "Boliviana", estado_civil: "",
  correo: "", password: "",
  genero_padre: "", ocupacion: "", lugar_trabajo: "",
  telefono_trabajo: "", nivel_educativo: "", ingreso_mensual: "",
  parentesco: "Padre",
  es_responsable_economico: 1, es_contacto_emergencia: 1,
  puede_retirar: 1, vive_con_estudiante: 1,
};

/* ── Grados disponibles (ajusta según tu BD) ── */
const GRADOS = [
  { id: 1, nombre: "Inicial 3 años A" },
  { id: 2, nombre: "Inicial 4 años A" },
  { id: 3, nombre: "Inicial 5 años A" },
  { id: 4, nombre: "1ro de Primaria A" },
  { id: 5, nombre: "2do de Primaria A" },
  { id: 6, nombre: "3ro de Primaria A" },
  { id: 7, nombre: "4to de Primaria A" },
  { id: 8, nombre: "5to de Primaria A" },
  { id: 9, nombre: "6to de Primaria A" },
  { id: 10, nombre: "1ro de Secundaria A" },
  { id: 11, nombre: "2do de Secundaria A" },
  { id: 12, nombre: "3ro de Secundaria A" },
  { id: 13, nombre: "4to de Secundaria A" },
  { id: 14, nombre: "5to de Secundaria A" },
  { id: 15, nombre: "6to de Secundaria A" },
];



/* ── Helpers ── */
const Campo = ({ label, req, error, children }) => (
  <div className="re-campo">
    <label>{label}{req && <span className="req">*</span>}</label>
    {children}
    {error && <span className="error-msg">⚠ {error}</span>}
  </div>
);

const Input = ({ value, onChange, type = "text", placeholder, className }) => (
  <input type={type} value={value} onChange={onChange}
    placeholder={placeholder} className={className} />
);

const Select = ({ value, onChange, children, className }) => (
  <select value={value} onChange={onChange} className={className}>
    {children}
  </select>
);

/* ══════════════════════════════════════════════════════════ */
function RegistrarEstudiante() {

  const [paso, setPaso]               = useState(0);
  const [estudiante, setEstudiante]   = useState(ESTUDIANTE_INIT);
  const [inscripcion, setInscripcion] = useState(INSCRIPCION_INIT);
  const [tutor1, setTutor1]           = useState(TUTOR_INIT);
  const [tutor2, setTutor2]           = useState(TUTOR_INIT);
  const [conTutor2, setConTutor2]     = useState(false);
  const [errores, setErrores]         = useState({});
  const [loading, setLoading]         = useState(false);
  const [alerta, setAlerta]           = useState(null);   // { tipo, msg }
  const [resultado, setResultado]     = useState(null);   // datos del servidor

  /* ── Setters genéricos ── */
  const setE  = (k) => (e) => {
    const value = e.target.value;
    setEstudiante(p => ({ ...p, [k]: value }));
    if (value) setErrores(prev => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const setI  = (k) => (e) => {
    const value = e.target.value;
    setInscripcion(p => ({ ...p, [k]: value }));
    if (value) setErrores(prev => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const setT1 = (k) => (e) => {
    const value = e.target.value;
    setTutor1(p => ({ ...p, [k]: value }));
    const errKey = `t1_${k}`;
    if (value) setErrores(prev => {
      if (!prev[errKey]) return prev;
      const next = { ...prev };
      delete next[errKey];
      return next;
    });
  };

  const setT2 = (k) => (e) => {
    const value = e.target.value;
    setTutor2(p => ({ ...p, [k]: value }));
    const errKey = `t2_${k}`;
    if (value) setErrores(prev => {
      if (!prev[errKey]) return prev;
      const next = { ...prev };
      delete next[errKey];
      return next;
    });
  };

  /* ── Validaciones por paso ── */
  const validar = () => {
    const err = {};

    if (paso === 0) {
      if (!estudiante.nombre)          err.nombre          = "Requerido";
      if (!estudiante.apellido)        err.apellido        = "Requerido";
      if (!estudiante.ci)              err.ci              = "Requerido";
      if (!estudiante.fecha_nacimiento) err.fecha_nacimiento = "Requerido";
      if (!estudiante.genero)          err.genero          = "Requerido";
      if (!estudiante.correo)          err.correo          = "Requerido";
      if (!estudiante.password || estudiante.password.length < 6)
                                        err.password       = "Mínimo 6 caracteres";
    }

    if (paso === 2) {
      if (!inscripcion.id_grado)        err.id_grado       = "Seleccione un grado";
      if (!inscripcion.tipo_inscripcion) err.tipo_inscripcion = "Requerido";
    }

    if (paso === 3) {
      if (!tutor1.nombre)    err.t1_nombre    = "Requerido";
      if (!tutor1.apellido)  err.t1_apellido  = "Requerido";
      if (!tutor1.ci)        err.t1_ci        = "Requerido";
      if (!tutor1.correo)    err.t1_correo    = "Requerido";
      if (!tutor1.password || tutor1.password.length < 6)
                              err.t1_password  = "Mínimo 6 caracteres";
      if (!tutor1.parentesco) err.t1_parentesco = "Requerido";
    }

    if (paso === 4 && conTutor2) {
      if (!tutor2.nombre)    err.t2_nombre    = "Requerido";
      if (!tutor2.apellido)  err.t2_apellido  = "Requerido";
      if (!tutor2.ci)        err.t2_ci        = "Requerido";
      if (!tutor2.correo)    err.t2_correo    = "Requerido";
      if (!tutor2.password || tutor2.password.length < 6)
                              err.t2_password  = "Mínimo 6 caracteres";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  /* ── Navegación ── */
  const siguiente = () => {
    if (!validar()) return;
    setAlerta(null);
    setPaso(p => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const anterior = () => {
    setAlerta(null);
    setPaso(p => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Envío ── */
  const enviar = async () => {
    setLoading(true);
    setAlerta(null);

    const payload = {
      ...estudiante,
      numero_hermanos:  Number(estudiante.numero_hermanos)  || 0,
      posicion_hermanos: Number(estudiante.posicion_hermanos) || null,
      ...inscripcion,
      id_grado:          Number(inscripcion.id_grado),
      monto_matricula:   Number(inscripcion.monto_matricula)  || 0,
      descuento_matricula: Number(inscripcion.descuento_matricula) || 0,
      requiere_apoyo:    Number(inscripcion.requiere_apoyo)  || 0,
      usuario_registra:  1, // 🔴 reemplaza con el ID del usuario logueado
      tutor1: {
        ...tutor1,
        ingreso_mensual: Number(tutor1.ingreso_mensual) || null,
        es_responsable_economico: Number(tutor1.es_responsable_economico),
        es_contacto_emergencia:   Number(tutor1.es_contacto_emergencia),
        puede_retirar:            Number(tutor1.puede_retirar),
        vive_con_estudiante:      Number(tutor1.vive_con_estudiante),
      },
      tutor2: conTutor2 ? {
        ...tutor2,
        ingreso_mensual: Number(tutor2.ingreso_mensual) || null,
        es_responsable_economico: Number(tutor2.es_responsable_economico),
        es_contacto_emergencia:   Number(tutor2.es_contacto_emergencia),
        puede_retirar:            Number(tutor2.puede_retirar),
        vive_con_estudiante:      Number(tutor2.vive_con_estudiante),
      } : null,
    };

    try {
      const resp = await registrarEstudiante(payload);
      if (resp.ok) {
        setResultado(resp.data);
        setPaso(6); // pantalla de éxito
      } else {
        setAlerta({ tipo: "error", msg: resp.mensaje });
      }
    } catch (err) {
      setAlerta({ tipo: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ── Reiniciar ── */
  const reiniciar = () => {
    setEstudiante(ESTUDIANTE_INIT);
    setInscripcion(INSCRIPCION_INIT);
    setTutor1(TUTOR_INIT);
    setTutor2(TUTOR_INIT);
    setConTutor2(false);
    setErrores({});
    setAlerta(null);
    setResultado(null);
    setPaso(0);
  };

  

  /* ══ RENDER ══════════════════════════════════════════════ */
  return (
    <div className="contenedor">
      <ImportarNav />

      

      <div className="re-content">

        {/* ── Alerta ── */}
        {alerta && (
          <div className={`re-alerta re-alerta-${alerta.tipo}`}>
            {alerta.tipo === "error" ? "❌" : "✅"} {alerta.msg}
          </div>
        )}

       
        {paso === 0 && (
          <div className="re-card">
            <div className="re-card-title"> Datos Personales del Estudiante</div>
            
            <div className="re-grid re-grid-2">
              <Campo label="Nombre" req error={errores.nombre}>
                <Input value={estudiante.nombre} onChange={setE("nombre")}
                  placeholder="Nombre(s)" className={errores.nombre ? "error" : ""} />
              </Campo>
              <Campo label="Apellido" req error={errores.apellido}>
                <Input value={estudiante.apellido} onChange={setE("apellido")}
                  placeholder="Apellido(s)" className={errores.apellido ? "error" : ""} />
              </Campo>
              <Campo label="CI / Documento" req error={errores.ci}>
                <Input value={estudiante.ci} onChange={setE("ci")}
                  placeholder="Ej: 1234567-LP" className={errores.ci ? "error" : ""} />
              </Campo>
              <Campo label="Fecha de nacimiento" req error={errores.fecha_nacimiento}>
                <Input type="date" value={estudiante.fecha_nacimiento}
                  onChange={setE("fecha_nacimiento")}
                  className={errores.fecha_nacimiento ? "error" : ""} />
              </Campo>
              <Campo label="Género" req error={errores.genero}>
                <Select value={estudiante.genero} onChange={setE("genero")}
                  className={errores.genero ? "error" : ""}>
                  <option value="">-- Seleccionar --</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </Select>
              </Campo>
              <Campo label="Estado civil">
                <Select value={estudiante.estado_civil} onChange={setE("estado_civil")}>
                  <option value="">-- Opcional --</option>
                  <option value="Soltero">Soltero/a</option>
                  <option value="Casado">Casado/a</option>
                </Select>
              </Campo>
              <Campo label="Teléfono">
                <Input value={estudiante.telefono} onChange={setE("telefono")} placeholder="7XXXXXXX" />
              </Campo>
              <Campo label="Nacionalidad">
                <Input value={estudiante.nacionalidad} onChange={setE("nacionalidad")} placeholder="Boliviana" />
              </Campo>
            </div>

            <Campo label="Dirección">
              <Input value={estudiante.direccion} onChange={setE("direccion")} placeholder="Calle, número, zona..." />
            </Campo>

            <Campo label="Email personal">
              <Input type="email" value={estudiante.email_personal} onChange={setE("email_personal")}
                placeholder="correo@ejemplo.com" />
            </Campo>

            <div className="re-divider" />
            <div className="re-card-title"> Credenciales de Acceso</div>
            

            <div className="re-grid re-grid-2">
              <Campo label="Correo institucional" req error={errores.correo}>
                <Input type="email" value={estudiante.correo} onChange={setE("correo")}
                  placeholder="nombre@estudiante.colegio.edu.bo"
                  className={errores.correo ? "error" : ""} />
              </Campo>
              <Campo label="Contraseña" req error={errores.password}>
                <Input type="password" value={estudiante.password} onChange={setE("password")}
                  placeholder="Mínimo 6 caracteres"
                  className={errores.password ? "error" : ""} />
              </Campo>
            </div>
          </div>
        )}

        {/* ════ PASO 1: Datos médicos ════ */}
        {paso === 1 && (
          <div className="re-card">
            <div className="re-card-title"> Información Médica</div>
            

            <div className="re-grid re-grid-3">
              <Campo label="Tipo de sangre">
                <Select value={estudiante.tipo_sangre} onChange={setE("tipo_sangre")}>
                  <option value="">-- Desconocido --</option>
                  {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </Campo>
              <Campo label="Seguro médico">
                <Input value={estudiante.seguro_medico} onChange={setE("seguro_medico")}
                  placeholder="Nombre del seguro" />
              </Campo>
              <Campo label="Transporte">
                <Select value={estudiante.transporte} onChange={setE("transporte")}>
                  <option value="">-- Seleccionar --</option>
                  <option value="Propio">Propio</option>
                  <option value="Escolar">Escolar</option>
                  <option value="Publico">Público</option>
                  <option value="A_pie">A pie</option>
                </Select>
              </Campo>
              <Campo label="N° de hermanos">
                <Input type="number" value={estudiante.numero_hermanos}
                  onChange={setE("numero_hermanos")} placeholder="0" />
              </Campo>
              <Campo label="Posición entre hermanos">
                <Input type="number" value={estudiante.posicion_hermanos}
                  onChange={setE("posicion_hermanos")} placeholder="Ej: 1 (primero)" />
              </Campo>
              <Campo label="Vive con">
                <Input value={estudiante.vive_con} onChange={setE("vive_con")}
                  placeholder="Ambos padres / Madre / Padre..." />
              </Campo>
            </div>

            <div className="re-divider" />

            <div className="re-grid re-grid-2">
              <Campo label="Alergias">
                <textarea value={estudiante.alergias} onChange={setE("alergias")}
                  placeholder="Describe las alergias o escribe 'Ninguna'" />
              </Campo>
              <Campo label="Condiciones médicas">
                <textarea value={estudiante.condiciones_medicas} onChange={setE("condiciones_medicas")}
                  placeholder="Asma, diabetes, etc. o 'Ninguna'" />
              </Campo>
              <Campo label="Medicamentos">
                <textarea value={estudiante.medicamentos} onChange={setE("medicamentos")}
                  placeholder="Medicamentos que toma habitualmente" />
              </Campo>
              <Campo label="Necesidades especiales">
                <textarea value={estudiante.necesidades_especiales} onChange={setE("necesidades_especiales")}
                  placeholder="Apoyos educativos requeridos" />
              </Campo>
            </div>
          </div>
        )}

        
        {paso === 2 && (
          <div className="re-card">
            <div className="re-card-title"> Datos de Inscripción</div>
            

            <div className="re-grid re-grid-2">
              <Campo label="Grado" req error={errores.id_grado}>
                <Select value={inscripcion.id_grado} onChange={setI("id_grado")}
                  className={errores.id_grado ? "error" : ""}>
                  <option value="">-- Seleccionar grado --</option>
                  {GRADOS.map(g => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </Select>
              </Campo>
              <Campo label="Tipo de inscripción" req error={errores.tipo_inscripcion}>
                <Select value={inscripcion.tipo_inscripcion} onChange={setI("tipo_inscripcion")}
                  className={errores.tipo_inscripcion ? "error" : ""}>
                  <option value="Nueva">Nueva</option>
                  <option value="Renovacion">Renovación</option>
                  <option value="Reingreso">Reingreso</option>
                  <option value="Traslado">Traslado</option>
                </Select>
              </Campo>
              <Campo label="Tipo de estudiante">
                <Select value={inscripcion.tipo_estudiante} onChange={setI("tipo_estudiante")}>
                  <option value="Regular">Regular</option>
                  <option value="Repitente">Repitente</option>
                  <option value="Traslado">Traslado</option>
                  <option value="Oyente">Oyente</option>
                </Select>
              </Campo>
              <Campo label="Colegio de procedencia">
                <Input value={inscripcion.colegio_procedencia} onChange={setI("colegio_procedencia")}
                  placeholder="Si viene de otro colegio" />
              </Campo>
              <Campo label="Monto matrícula (Bs)">
                <Input type="number" value={inscripcion.monto_matricula} onChange={setI("monto_matricula")}
                  placeholder="0.00" />
              </Campo>
              <Campo label="Descuento (%)">
                <Input type="number" value={inscripcion.descuento_matricula}
                  onChange={setI("descuento_matricula")} placeholder="0" />
              </Campo>
            </div>

            <div className="re-campo" style={{ marginTop: "16px" }}>
              <label>
                <input type="checkbox"
                  checked={Boolean(inscripcion.requiere_apoyo)}
                  onChange={(e) => setInscripcion(p => ({ ...p, requiere_apoyo: e.target.checked ? 1 : 0 }))}
                  style={{ marginRight: 8 }} />
                El estudiante requiere apoyo académico especial
              </label>
            </div>

            {inscripcion.tipo_inscripcion === "Traslado" && (
              <Campo label="Motivo del traslado" style={{ marginTop: 16 }}>
                <textarea value={inscripcion.motivo_traslado} onChange={setI("motivo_traslado")}
                  placeholder="Describa el motivo del traslado..." />
              </Campo>
            )}

            <Campo label="Observaciones generales">
              <textarea value={inscripcion.observaciones} onChange={setI("observaciones")}
                placeholder="Información adicional relevante..." />
            </Campo>
          </div>
        )}

        {/* ════ PASO 3: Tutor 1 ════ */}
        {paso === 3 && (
          <div className="re-card">
            <div className="re-card-title"> Tutor Principal (Obligatorio)</div>
            

            <div className="re-grid re-grid-2">
              <Campo label="Nombre" req error={errores.t1_nombre}>
                <Input value={tutor1.nombre} onChange={setT1("nombre")}
                  placeholder="Nombre(s)" className={errores.t1_nombre ? "error" : ""} />
              </Campo>
              <Campo label="Apellido" req error={errores.t1_apellido}>
                <Input value={tutor1.apellido} onChange={setT1("apellido")}
                  placeholder="Apellido(s)" className={errores.t1_apellido ? "error" : ""} />
              </Campo>
              <Campo label="CI / Documento" req error={errores.t1_ci}>
                <Input value={tutor1.ci} onChange={setT1("ci")}
                  placeholder="Ej: 4567890" className={errores.t1_ci ? "error" : ""} />
              </Campo>
              <Campo label="Fecha de nacimiento">
                <Input type="date" value={tutor1.fecha_nacimiento} onChange={setT1("fecha_nacimiento")} />
              </Campo>
              <Campo label="Género (persona)">
                <Select value={tutor1.genero_persona} onChange={setT1("genero_persona")}>
                  <option value="">-- Seleccionar --</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </Select>
              </Campo>
              <Campo label="Parentesco" req error={errores.t1_parentesco}>
                <Select value={tutor1.parentesco} onChange={setT1("parentesco")}
                  className={errores.t1_parentesco ? "error" : ""}>
                  {["Padre","Madre","Abuelo","Abuela","Tio","Tia","Hermano","Hermana","Tutor_legal","Otro"].map(p => (
                    <option key={p} value={p}>{p.replace("_", " ")}</option>
                  ))}
                </Select>
              </Campo>
              <Campo label="Teléfono">
                <Input value={tutor1.telefono} onChange={setT1("telefono")} placeholder="7XXXXXXX" />
              </Campo>
              <Campo label="Email personal">
                <Input type="email" value={tutor1.email_personal} onChange={setT1("email_personal")}
                  placeholder="correo@ejemplo.com" />
              </Campo>
              <Campo label="Dirección">
                <Input value={tutor1.direccion} onChange={setT1("direccion")} placeholder="Calle, número, zona..." />
              </Campo>
              <Campo label="Ocupación">
                <Input value={tutor1.ocupacion} onChange={setT1("ocupacion")} placeholder="Profesión / oficio" />
              </Campo>
              <Campo label="Lugar de trabajo">
                <Input value={tutor1.lugar_trabajo} onChange={setT1("lugar_trabajo")} placeholder="Empresa o institución" />
              </Campo>
              <Campo label="Teléfono trabajo">
                <Input value={tutor1.telefono_trabajo} onChange={setT1("telefono_trabajo")} />
              </Campo>
              <Campo label="Nivel educativo">
                <Select value={tutor1.nivel_educativo} onChange={setT1("nivel_educativo")}>
                  <option value="">-- Seleccionar --</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria / Bachiller</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Licenciatura">Licenciatura</option>
                  <option value="Maestría">Maestría</option>
                  <option value="Doctorado">Doctorado</option>
                </Select>
              </Campo>
              <Campo label="Ingreso mensual aprox. (Bs)">
                <Input type="number" value={tutor1.ingreso_mensual} onChange={setT1("ingreso_mensual")} placeholder="0.00" />
              </Campo>
            </div>

            <div className="re-divider" />
            <div className="re-card-title"> Acceso del Tutor</div>
            <div className="re-grid re-grid-2">
              <Campo label="Correo" req error={errores.t1_correo}>
                <Input type="email" value={tutor1.correo} onChange={setT1("correo")}
                  placeholder="correo@gmail.com" className={errores.t1_correo ? "error" : ""} />
              </Campo>
              <Campo label="Contraseña" req error={errores.t1_password}>
                <Input type="password" value={tutor1.password} onChange={setT1("password")}
                  placeholder="Mínimo 6 caracteres" className={errores.t1_password ? "error" : ""} />
              </Campo>
            </div>

            <div className="re-divider" />
            <div className="re-card-title"> Relación con el estudiante</div>
            <div className="re-grid re-grid-2" style={{ marginTop: 14 }}>
              {[
                ["es_responsable_economico", "Responsable económico"],
                ["es_contacto_emergencia",   "Contacto de emergencia"],
                ["puede_retirar",            "Puede retirar al estudiante"],
                ["vive_con_estudiante",      "Vive con el estudiante"],
              ].map(([key, lbl]) => (
                <div className="re-campo" key={key}>
                  <label>
                    <input type="checkbox"
                      checked={Boolean(tutor1[key])}
                      onChange={(e) => setTutor1(p => ({ ...p, [key]: e.target.checked ? 1 : 0 }))}
                      style={{ marginRight: 8 }} />
                    {lbl}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PASO 4: Tutor 2 ════ */}
        {paso === 4 && (
          <>
            <div className="re-toggle" onClick={() => setConTutor2(p => !p)}>
              <input type="checkbox" checked={conTutor2} onChange={() => {}} />
              <label>Registrar un segundo tutor (opcional)</label>
            </div>

            {conTutor2 && (
              <div className="re-card">
                <div className="re-card-title"> Tutor Secundario (Opcional)</div>
                
                <div className="re-grid re-grid-2">
                  <Campo label="Nombre" req error={errores.t2_nombre}>
                    <Input value={tutor2.nombre} onChange={setT2("nombre")}
                      placeholder="Nombre(s)" className={errores.t2_nombre ? "error" : ""} />
                  </Campo>
                  <Campo label="Apellido" req error={errores.t2_apellido}>
                    <Input value={tutor2.apellido} onChange={setT2("apellido")}
                      placeholder="Apellido(s)" className={errores.t2_apellido ? "error" : ""} />
                  </Campo>
                  <Campo label="CI / Documento" req error={errores.t2_ci}>
                    <Input value={tutor2.ci} onChange={setT2("ci")}
                      placeholder="Ej: 5678901" className={errores.t2_ci ? "error" : ""} />
                  </Campo>
                  <Campo label="Parentesco">
                    <Select value={tutor2.parentesco} onChange={setT2("parentesco")}>
                      {["Padre","Madre","Abuelo","Abuela","Tio","Tia","Hermano","Hermana","Tutor_legal","Otro"].map(p => (
                        <option key={p} value={p}>{p.replace("_", " ")}</option>
                      ))}
                    </Select>
                  </Campo>
                  <Campo label="Teléfono">
                    <Input value={tutor2.telefono} onChange={setT2("telefono")} placeholder="7XXXXXXX" />
                  </Campo>
                  <Campo label="Ocupación">
                    <Input value={tutor2.ocupacion} onChange={setT2("ocupacion")} placeholder="Profesión / oficio" />
                  </Campo>
                  <Campo label="Lugar de trabajo">
                    <Input value={tutor2.lugar_trabajo} onChange={setT2("lugar_trabajo")} />
                  </Campo>
                  <Campo label="Nivel educativo">
                    <Select value={tutor2.nivel_educativo} onChange={setT2("nivel_educativo")}>
                      <option value="">-- Seleccionar --</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria / Bachiller</option>
                      <option value="Técnico">Técnico</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Maestría">Maestría</option>
                      <option value="Doctorado">Doctorado</option>
                    </Select>
                  </Campo>
                </div>

                <div className="re-divider" />
                <div className="re-card-title"> Acceso del Tutor 2</div>
                <div className="re-grid re-grid-2">
                  <Campo label="Correo" req error={errores.t2_correo}>
                    <Input type="email" value={tutor2.correo} onChange={setT2("correo")}
                      placeholder="correo@gmail.com" className={errores.t2_correo ? "error" : ""} />
                  </Campo>
                  <Campo label="Contraseña" req error={errores.t2_password}>
                    <Input type="password" value={tutor2.password} onChange={setT2("password")}
                      placeholder="Mínimo 6 caracteres" className={errores.t2_password ? "error" : ""} />
                  </Campo>
                </div>

                <div className="re-divider" />
                <div className="re-grid re-grid-2" style={{ marginTop: 6 }}>
                  {[
                    ["es_responsable_economico", "Responsable económico"],
                    ["es_contacto_emergencia",   "Contacto de emergencia"],
                    ["puede_retirar",            "Puede retirar al estudiante"],
                    ["vive_con_estudiante",      "Vive con el estudiante"],
                  ].map(([key, lbl]) => (
                    <div className="re-campo" key={key}>
                      <label>
                        <input type="checkbox"
                          checked={Boolean(tutor2[key])}
                          onChange={(e) => setTutor2(p => ({ ...p, [key]: e.target.checked ? 1 : 0 }))}
                          style={{ marginRight: 8 }} />
                        {lbl}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        
        {paso === 5 && (
          <>
            <div className="re-resumen">
              <h2> Resumen de Inscripción</h2>
              <div className="re-resumen-grid">
                <div className="re-resumen-item">
                  <label>Nombre completo</label>
                  <span>{estudiante.nombre} {estudiante.apellido}</span>
                </div>
                <div className="re-resumen-item">
                  <label>CI</label>
                  <span>{estudiante.ci}</span>
                </div>
                <div className="re-resumen-item">
                  <label>Correo</label>
                  <span>{estudiante.correo}</span>
                </div>
                <div className="re-resumen-item">
                  <label>Grado</label>
                  <span>{GRADOS.find(g => g.id === inscripcion.id_grado)?.nombre || "-"}</span>
                </div>
                <div className="re-resumen-item">
                  <label>Tipo inscripción</label>
                  <span>{inscripcion.tipo_inscripcion}</span>
                </div>
                <div className="re-resumen-item">
                  <label>Tutor principal</label>
                  <span>{tutor1.nombre} {tutor1.apellido}</span>
                </div>
                <div className="re-resumen-item">
                  <label>Tutor secundario</label>
                  <span>{conTutor2 ? `${tutor2.nombre} ${tutor2.apellido}` : "No registrado"}</span>
                </div>
                <div className="re-resumen-item">
                  <label>Monto matrícula</label>
                  <span>Bs {Number(inscripcion.monto_matricula).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="re-card">
              <p style={{ fontSize: "0.9rem", color: "var(--gris-3)", textAlign: "center" }}>
                Revise la información antes de confirmar. Una vez enviado, el estudiante
                quedará inscrito en el sistema.
              </p>
            </div>
          </>
        )}

        {/* ════ PASO 6: Éxito ════ */}
        {paso === 6 && resultado && (
          <div className="re-card re-success-box">
            <div className="re-success-icon">🎉</div>
            <h2>¡Inscripción completada!</h2>
            <p>El estudiante ha sido registrado exitosamente.</p>
            <div className="re-codigo">{resultado.codigo_estudiante}</div>
            <p style={{ fontSize: "0.85rem" }}>
              Matrícula: <strong>{resultado.numero_matricula}</strong>
            </p>
            <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="re-btn re-btn-primary" onClick={reiniciar}>
                Registrar otro estudiante
              </button>
            </div>
          </div>
        )}

        {/* ── Navegación ── */}
        {paso < 6 && (
          <div className="re-nav">
            {paso > 0 && (
              <button className="re-btn re-btn-outline" onClick={anterior}>
                ← Anterior
              </button>
            )}

            {paso < 5 && (
              <button className="re-btn re-btn-primary" onClick={siguiente}>
                Siguiente →
              </button>
            )}

            {paso === 5 && (
              <button className="re-btn re-btn-primary" onClick={enviar} disabled={loading}>
                {loading
                  ? <><div className="re-spinner" /> Registrando...</>
                  : " Confirmar inscripción"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default RegistrarEstudiante;