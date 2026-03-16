import { useState } from "react";
import "../Css/Anotacion-Registro.css";
import ImportarNav from "../Navegacion/InportarNav";
import { registrarAnotacion } from "../Api/Api-Admin/Anotaciones";

const FORM_INIT = {
  nombre_estudiante:   "",
  apellido_estudiante: "",
  nombre_reporta:      "",
  apellido_reporta:    "",
  fecha_incidente:     "",
  tipo_falta:          "",
  categoria:           "",
  descripcion:         "",
  sancion:             "",
  fecha_sancion:       "",
  notificado_padres:   0,
  fecha_notificacion:  "",
  seguimiento:         "",
};

const CATEGORIAS = [
  "Académica", "Disciplinaria", "Asistencia",
  "Conducta", "Propiedad", "Uniforme", "Otra",
];

const Campo = ({ label, req, error, children, full }) => (
  <div className={`ao-campo${full ? " ao-campo-full" : ""}`}>
    <label>{label}{req && <span className="req">*</span>}</label>
    {children}
    {error && <span className="error-msg">⚠ {error}</span>}
  </div>
);

const Input = ({ value, onChange, type = "text", placeholder, className = "" }) => (
  <input type={type} value={value} onChange={onChange}
    placeholder={placeholder} className={className} />
);

const AoSelect = ({ value, onChange, children, className = "" }) => (
  <select value={value} onChange={onChange} className={className}>
    {children}
  </select>
);

function Anotacion() {

  const [paso, setPaso]           = useState(0);
  const [form, setForm]           = useState(FORM_INIT);
  const [errores, setErrores]     = useState({});
  const [loading, setLoading]     = useState(false);
  const [alerta, setAlerta]       = useState(null);
  const [resultado, setResultado] = useState(null);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, [k]: v }));
    if (v) setErrores(prev => {
      if (!prev[k]) return prev;
      const next = { ...prev }; delete next[k]; return next;
    });
  };

  const validar = () => {
    const err = {};

    if (paso === 0) {
      if (!form.nombre_estudiante.trim())   err.nombre_estudiante   = "Requerido";
      if (!form.apellido_estudiante.trim()) err.apellido_estudiante = "Requerido";
      if (!form.nombre_reporta.trim())      err.nombre_reporta      = "Requerido";
      if (!form.apellido_reporta.trim())    err.apellido_reporta    = "Requerido";
    }

    if (paso === 1) {
      if (!form.tipo_falta)         err.tipo_falta  = "Seleccione el tipo de falta";
      if (!form.descripcion.trim()) err.descripcion = "La descripción es obligatoria";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

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

  /* ── Envío con manejo inteligente de errores ── */
  const enviar = async () => {
    setLoading(true);
    setAlerta(null);

    const payload = {
      ...form,
      fecha_incidente:    form.fecha_incidente    || null,
      categoria:          form.categoria          || null,
      sancion:            form.sancion.trim()     || null,
      fecha_sancion:      form.fecha_sancion      || null,
      notificado_padres:  Number(form.notificado_padres),
      fecha_notificacion: form.fecha_notificacion || null,
      seguimiento:        form.seguimiento.trim() || null,
    };

    try {
      const resp = await registrarAnotacion(payload);

      if (resp.ok) {
        setResultado(resp.data);
        setPaso(4);
        return;
      }

      const msg = resp.mensaje ?? "";

      /* ── Error sobre el estudiante → volver al paso 0 ── */
      if (
        msg.toLowerCase().includes("estudiante") &&
        (msg.includes("No se encontró") || msg.includes("encontraron"))
      ) {
        setPaso(0);
        setErrores({
          nombre_estudiante:   "No encontrado en el sistema",
          apellido_estudiante: "Verifique el nombre ingresado",
        });
        setAlerta({ tipo: "error", msg });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      /* ── Error sobre el docente/admin → volver al paso 0 ── */
      if (
        (msg.toLowerCase().includes("docente") || msg.toLowerCase().includes("administrativo")) &&
        (msg.includes("No se encontró") || msg.includes("encontraron"))
      ) {
        setPaso(0);
        setErrores({
          nombre_reporta:   "No encontrado en el sistema",
          apellido_reporta: "Verifique el nombre ingresado",
        });
        setAlerta({ tipo: "error", msg });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      /* ── Cualquier otro error → mostrar en el resumen ── */
      setAlerta({ tipo: "error", msg });

    } catch (err) {
      setAlerta({ tipo: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setForm(FORM_INIT);
    setErrores({});
    setAlerta(null);
    setResultado(null);
    setPaso(0);
  };

  const badgeClass = (tipo) =>
    `ao-badge ao-badge-${tipo.toLowerCase()}${form.tipo_falta === tipo ? " selected" : ""}`;

  return (
    <div className="contenedor">
      <ImportarNav />

      <div className="ao-content">

        {alerta && (
          <div className={`ao-alerta ao-alerta-${alerta.tipo}`}>
            {alerta.tipo === "error" ? "" : ""} {alerta.msg}
          </div>
        )}

        {/* ════ PASO 0: Identificación ════ */}
        {paso === 0 && (
          <div className="ao-card">
            <div className="ao-card-title">Identificación</div>

            {/* Aviso genérico si hubo error de identificación */}
            {(errores.nombre_estudiante === "No encontrado en el sistema" ||
              errores.nombre_reporta    === "No encontrado en el sistema") && (
              <div className="ao-alerta ao-alerta-error" style={{ marginBottom: 18 }}>
                Corrija los nombres marcados y vuelva a intentarlo.
              </div>
            )}

            <div className="ao-grid ao-grid-2">
              <Campo label="Nombre del estudiante" req error={errores.nombre_estudiante}>
                <Input value={form.nombre_estudiante} onChange={set("nombre_estudiante")}
                  placeholder="Nombre(s)"
                  className={errores.nombre_estudiante ? "error" : ""} />
              </Campo>
              <Campo label="Apellido del estudiante" req error={errores.apellido_estudiante}>
                <Input value={form.apellido_estudiante} onChange={set("apellido_estudiante")}
                  placeholder="Apellido(s)"
                  className={errores.apellido_estudiante ? "error" : ""} />
              </Campo>
            </div>

            <div className="ao-divider" />
            <div className="ao-card-title" style={{ fontSize: "1rem", marginBottom: 18 }}>
              Quien reporta
            </div>

            <div className="ao-grid ao-grid-2">
              <Campo label="Nombre" req error={errores.nombre_reporta}>
                <Input value={form.nombre_reporta} onChange={set("nombre_reporta")}
                  placeholder="Nombre(s)"
                  className={errores.nombre_reporta ? "error" : ""} />
              </Campo>
              <Campo label="Apellido" req error={errores.apellido_reporta}>
                <Input value={form.apellido_reporta} onChange={set("apellido_reporta")}
                  placeholder="Apellido(s)"
                  className={errores.apellido_reporta ? "error" : ""} />
              </Campo>
            </div>
          </div>
        )}

        {/* ════ PASO 1: Incidente ════ */}
        {paso === 1 && (
          <div className="ao-card">
            <div className="ao-card-title">Datos del Incidente</div>

            <div className="ao-grid ao-grid-2" style={{ marginBottom: 18 }}>
              <Campo label="Fecha del incidente">
                <Input type="date" value={form.fecha_incidente} onChange={set("fecha_incidente")} />
              </Campo>
              <Campo label="Categoría">
                <AoSelect value={form.categoria} onChange={set("categoria")}>
                  <option value="">-- Seleccionar --</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </AoSelect>
              </Campo>
            </div>

            <Campo label="Tipo de falta" req error={errores.tipo_falta}>
              <div className="ao-badge-group">
                {["Leve", "Moderada", "Grave", "Muy_grave"].map((tipo) => (
                  <button key={tipo} type="button"
                    className={badgeClass(tipo)}
                    onClick={() => {
                      setForm(p => ({ ...p, tipo_falta: tipo }));
                      setErrores(prev => { const n = { ...prev }; delete n.tipo_falta; return n; });
                    }}>
                    {tipo === "Muy_grave" ? "Muy grave" : tipo}
                  </button>
                ))}
              </div>
              {errores.tipo_falta && (
                <span className="error-msg" style={{ marginTop: 6 }}>⚠ {errores.tipo_falta}</span>
              )}
            </Campo>

            <div style={{ marginTop: 20 }}>
              <Campo label="Descripción del incidente" req error={errores.descripcion}>
                <textarea value={form.descripcion} onChange={set("descripcion")}
                  placeholder="Describa detalladamente lo ocurrido..."
                  className={errores.descripcion ? "error" : ""}
                  style={{ minHeight: 120 }} />
              </Campo>
            </div>
          </div>
        )}

        {/* ════ PASO 2: Sanción ════ */}
        {paso === 2 && (
          <div className="ao-card">
            <div className="ao-card-title">Sanción y Seguimiento</div>

            <div className="ao-grid ao-grid-2">
              <Campo label="Sanción aplicada">
                <Input value={form.sancion} onChange={set("sancion")}
                  placeholder="Ej: Amonestación escrita, suspensión..." />
              </Campo>
              <Campo label="Fecha de sanción">
                <Input type="date" value={form.fecha_sancion} onChange={set("fecha_sancion")} />
              </Campo>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="ao-check-row" onClick={() =>
                setForm(p => ({ ...p, notificado_padres: p.notificado_padres ? 0 : 1 }))}>
                <input type="checkbox" readOnly checked={Boolean(form.notificado_padres)} />
                <label>Padres / tutores han sido notificados</label>
              </div>
            </div>

            {Boolean(form.notificado_padres) && (
              <div style={{ marginTop: 14 }}>
                <Campo label="Fecha de notificación">
                  <Input type="date" value={form.fecha_notificacion}
                    onChange={set("fecha_notificacion")} />
                </Campo>
              </div>
            )}

            <div className="ao-divider" />

            <Campo label="Seguimiento / Observaciones">
              <textarea value={form.seguimiento} onChange={set("seguimiento")}
                placeholder="Acciones de seguimiento, compromisos del estudiante o familia..."
                style={{ minHeight: 100 }} />
            </Campo>
          </div>
        )}

        {/* ════ PASO 3: Resumen ════ */}
        {paso === 3 && (
          <>
            <div className="ao-resumen">
              <h2>Resumen de la Anotación</h2>
              <div className="ao-resumen-grid">
                <div className="ao-resumen-item">
                  <label>Estudiante</label>
                  <span>{form.nombre_estudiante} {form.apellido_estudiante}</span>
                </div>
                <div className="ao-resumen-item">
                  <label>Reportado por</label>
                  <span>{form.nombre_reporta} {form.apellido_reporta}</span>
                </div>
                <div className="ao-resumen-item">
                  <label>Fecha del incidente</label>
                  <span>{form.fecha_incidente || "No especificada"}</span>
                </div>
                <div className="ao-resumen-item">
                  <label>Tipo de falta</label>
                  <span className={`falta-${form.tipo_falta.toLowerCase()}`}>
                    {form.tipo_falta === "Muy_grave" ? "Muy grave" : form.tipo_falta}
                  </span>
                </div>
                <div className="ao-resumen-item">
                  <label>Categoría</label>
                  <span>{form.categoria || "Sin categoría"}</span>
                </div>
                <div className="ao-resumen-item">
                  <label>Padres notificados</label>
                  <span>{form.notificado_padres ? "Sí" : "No"}</span>
                </div>
                <div className="ao-resumen-item" style={{ gridColumn: "1 / -1" }}>
                  <label>Descripción</label>
                  <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{form.descripcion}</span>
                </div>
                {form.sancion && (
                  <div className="ao-resumen-item">
                    <label>Sanción</label>
                    <span>{form.sancion}</span>
                  </div>
                )}
                {form.seguimiento && (
                  <div className="ao-resumen-item" style={{ gridColumn: "1 / -1" }}>
                    <label>Seguimiento</label>
                    <span style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{form.seguimiento}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="ao-card">
              <p style={{ fontSize: "0.88rem", color: "var(--muted)", textAlign: "center" }}>
                Revise la información antes de confirmar. Una vez registrada, la anotación
                quedará guardada en el historial del estudiante.
              </p>
            </div>
          </>
        )}

        {/* ════ PASO 4: Éxito ════ */}
        {paso === 4 && resultado && (
          <div className="ao-card ao-success-box">
            
            <h2>Anotación registrada</h2>
            <p>El incidente ha sido guardado correctamente en el sistema.</p>

            <div className="ao-success-meta">
              <span>Estudiante</span>
              <strong>{resultado.estudiante}</strong>
              <span style={{ marginTop: 8 }}>Reporte N°</span>
              <strong>{resultado.id_reporte}</strong>
            </div>

            <p style={{ color: "var(--muted-2)", fontSize: "0.82rem" }}>
              Código: <strong style={{ color: "var(--accent-light)" }}>{resultado.codigo_estudiante}</strong>
              &nbsp;· Reportado por: <strong style={{ color: "var(--accent-light)" }}>{resultado.reportado_por}</strong>
            </p>

            <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="ao-btn ao-btn-primary" onClick={reiniciar}>
                + Nueva anotación
              </button>
            </div>
          </div>
        )}

        {/* ── Navegación ── */}
        {paso < 4 && (
          <div className="ao-nav">
            {paso > 0
              ? <button className="ao-btn ao-btn-outline" onClick={anterior}>← Anterior</button>
              : <span />}

            {paso < 3 && (
              <button className="ao-btn ao-btn-primary" onClick={siguiente}>
                Siguiente →
              </button>
            )}

            {paso === 3 && (
              <button className="ao-btn ao-btn-danger" onClick={enviar} disabled={loading}>
                {loading
                  ? <><div className="ao-spinner" /> Registrando...</>
                  : " Confirmar anotación"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Anotacion;