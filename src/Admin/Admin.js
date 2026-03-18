// pages/Admin.jsx
import { useEffect, useState, useCallback } from "react";
import ImportarNav from "../Navegacion/InportarNav";
import {
  fetchDashboardKpi,
  fetchResumenEstudiantes,
  fetchResumenAnotaciones,
  fetchResumenMovimientos,
  fetchReporteFinanciero,
  fetchReporteRendimiento,
  fetchCardexLista,
} from "../Api/Api-Admin/Datos-Admin";
import "../Css/Admin.css";

// ── Helpers ─────────────────────────────────────────────────
const fmt = (n) =>
  n !== undefined && n !== null
    ? Number(n).toLocaleString("es-BO")
    : "—";

const fmtPct = (n) =>
  n !== undefined && n !== null ? `${Number(n).toFixed(1)}%` : "—";

const fmtBs = (n) =>
  n !== undefined && n !== null
    ? `Bs. ${Number(n).toLocaleString("es-BO", { minimumFractionDigits: 2 })}`
    : "—";

// ── Sub-components ───────────────────────────────────────────
const Spinner = () => (
  <div className="adm-spinner">
    <span className="adm-spinner__ring" />
  </div>
);

const ErrorMsg = ({ msg }) => (
  <div className="adm-error">
    <span className="adm-error__icon">⚠</span>
    <p>{msg}</p>
  </div>
);

const KpiCard = ({ label, value, sub, accent }) => (
  <div className={`adm-kpi adm-kpi--${accent}`}>
    <p className="adm-kpi__label">{label}</p>
    <p className="adm-kpi__value">{value}</p>
    {sub && <p className="adm-kpi__sub">{sub}</p>}
  </div>
);

const SectionTitle = ({ children, icon }) => (
  <div className="adm-section-title">
    <span className="adm-section-title__icon">{icon}</span>
    <h2>{children}</h2>
  </div>
);

const MiniBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="adm-minibar">
      <div className="adm-minibar__header">
        <span className="adm-minibar__label">{label}</span>
        <span className="adm-minibar__val">{fmt(value)}</span>
      </div>
      <div className="adm-minibar__track">
        <div
          className="adm-minibar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

const Table = ({ cols, rows, emptyMsg = "Sin datos" }) => (
  <div className="adm-table-wrap">
    {rows.length === 0 ? (
      <p className="adm-empty">{emptyMsg}</p>
    ) : (
      <table className="adm-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

// ── Main Component ───────────────────────────────────────────
function Admin() {
  const [anio, setAnio] = useState(null);

  const [kpi, setKpi] = useState(null);
  const [estudiantes, setEstudiantes] = useState(null);
  const [anotaciones, setAnotaciones] = useState(null);
  const [movimientos, setMovimientos] = useState(null);
  const [financiero, setFinanciero] = useState(null);
  const [rendimiento, setRendimiento] = useState(null);
  const [cardex, setCardex] = useState({ data: [], total: 0 });

  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
  const setErr  = (key, val) => setErrors((p)  => ({ ...p, [key]: val }));

  const load = useCallback(async (key, fn, setter) => {
    setLoad(key, true);
    setErr(key, null);
    try {
      const data = await fn();
      setter(data);
    } catch (e) {
      setErr(key, e.message);
    } finally {
      setLoad(key, false);
    }
  }, []);

  const loadAll = useCallback(() => {
    load("kpi", () => fetchDashboardKpi(),              setKpi);
    load("est", () => fetchResumenEstudiantes(anio),    setEstudiantes);
    load("ano", () => fetchResumenAnotaciones(),        setAnotaciones);
    load("mov", () => fetchResumenMovimientos(anio),    setMovimientos);
    load("fin", () => fetchReporteFinanciero(anio),     setFinanciero);
    load("ren", () => fetchReporteRendimiento(anio),    setRendimiento);
    load("cdx", () => fetchCardexLista({ anio }),       setCardex);
  }, [anio, load]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Render helper ──────────────────────────────────────────
  const section = (key, content) =>
    loading[key] ? <Spinner /> : errors[key] ? <ErrorMsg msg={errors[key]} /> : content;

  const maxEst = Math.max(
    ...(estudiantes?.totalesPorEstado?.map((r) => r.Total ?? 0) ?? [1])
  );
  const maxAno = Math.max(
    ...(anotaciones?.porGrado?.map((r) => r.Total_Anotaciones ?? 0) ?? [1])
  );

  const ACCENT_COLORS = ["#4f8ef7", "#f7994f", "#4fc98e", "#f74f6a", "#a44ff7"];


  const bajasRows = (() => {
    const b = movimientos?.bajasRetiros?.[0];
    if (!b) return [];
    return [
      { motivo: "Total retirados",       total: b.Total_Retirados },
      { motivo: "Matrículas retiradas",  total: b.Matriculas_Retiradas },
      { motivo: "Matrículas trasladadas",total: b.Matriculas_Trasladadas },
      { motivo: "Matrículas finalizadas",total: b.Matriculas_Finalizadas },
    ];
  })();

  // ── Resumen financiero general: el SP devuelve UNA fila con varios campos,
  //    la mostramos como lista de stats
  const resumenFinRows = (() => {
    const r = financiero?.resumenGeneral?.[0];
    if (!r) return [];
    return [
      { label: "Total facturado",    valor: fmtBs(r.Total_Facturado) },
      { label: "Total cobrado",      valor: fmtBs(r.Total_Cobrado) },
      { label: "Total pendiente",    valor: fmtBs(r.Total_Pendiente) },
      { label: "Monto atrasado",     valor: fmtBs(r.Monto_Atrasado) },
      { label: "% recaudo",          valor: fmtPct(r.Porcentaje_Recaudo) },
      { label: "Pagos atrasados",    valor: fmt(r.Pagos_Atrasados) },
    ];
  })();

  return (
    <>
      <ImportarNav />
      <div className="contenedor">

        <section className="adm-block">
          <SectionTitle icon="⚡">KPIs Globales</SectionTitle>
          {section(
            "kpi",
            <div className="adm-kpi-grid">
              <KpiCard
                label="Estudiantes activos"
                value={fmt(kpi?.Total_Estudiantes_Activos)}
                sub={`Matriculados: ${fmt(kpi?.Total_Matriculados)}`}
                accent="blue"
              />
              <KpiCard
                label="Retirados"
                value={fmt(kpi?.Total_Retirados)}
                sub="este año"
                accent="orange"
              />
              <KpiCard
                label="Anotaciones activas"
                value={fmt(kpi?.Anotaciones_Activas)}
                sub={`Críticas: ${fmt(kpi?.Anotaciones_Criticas)}`}
                accent="red"
              />
              <KpiCard
                label="Total recaudado"
                value={fmtBs(kpi?.Total_Recaudado)}
                sub="cobrado en el año"
                accent="green"
              />
              <KpiCard
                label="Mora total"
                value={fmtBs(kpi?.Monto_Total_Pendiente)}
                sub={`${fmt(kpi?.Pagos_Pendientes)} pagos pendientes`}
                accent="purple"
              />
              <KpiCard
                label="Ocupación global"
                value={fmtPct(kpi?.Porcentaje_Ocupacion_Global)}
                sub={`${fmt(kpi?.Ocupacion_Total)} / ${fmt(kpi?.Capacidad_Total)}`}
                accent="teal"
              />
            </div>
          )}
        </section>

        {/* ── Estudiantes + Movimientos ─────────── */}
        <div className="adm-row">

          {/* Estudiantes */}
          {/* SP: sp_admin_resumen_estudiantes
              TOTALES_POR_ESTADO          → Estado, Total, Porcentaje
              DISTRIBUCION_GENERO         → Genero, Total, Porcentaje
              MATRICULADOS_VS_NO_MATR.    → Condicion, Total, Porcentaje */}
          <section className="adm-block adm-block--half">
            <SectionTitle icon="🎓">Estudiantes</SectionTitle>
            {section(
              "est",
              <>
                <div className="adm-subsection">
                  <h3 className="adm-label">Por estado</h3>
                  {estudiantes?.totalesPorEstado?.map((r, i) => (
                    <MiniBar
                      key={i}
                      label={r.Estado}
                      value={r.Total}
                      max={maxEst}
                      color={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                    />
                  ))}
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Distribución por género</h3>
                  <div className="adm-pills">
                    {estudiantes?.distribucionGenero?.map((r, i) => (
                      <div className="adm-pill" key={i}>
                        <span className="adm-pill__label">{r.Genero}</span>
                        <span className="adm-pill__val">
                          {fmt(r.Total)} <em>({fmtPct(r.Porcentaje)})</em>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Matriculados vs sin matrícula</h3>
                  <div className="adm-pills">
                    {estudiantes?.matriculadosVsNoMatriculados?.map((r, i) => (
                      <div className="adm-pill" key={i}>
                        <span className="adm-pill__label">{r.Condicion}</span>
                        <span className="adm-pill__val">
                          {fmt(r.Total)} <em>({fmtPct(r.Porcentaje)})</em>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Movimientos */}
          {/* SP: sp_admin_resumen_movimientos
              INSCRIPCIONES_POR_TIPO → Tipo_inscripcion, Total, Porcentaje
              BAJAS_RETIROS          → objeto único (Total_Retirados, Matriculas_*)
              REINGRESOS_POR_GRADO   → Grado, Paralelo, Total_Reingresos */}
          <section className="adm-block adm-block--half">
            <SectionTitle icon="🔄">Movimientos</SectionTitle>
            {section(
              "mov",
              <>
                <div className="adm-subsection">
                  <h3 className="adm-label">Inscripciones por tipo</h3>
                  <div className="adm-pills">
                    {movimientos?.inscripcionesPorTipo?.map((r, i) => (
                      <div className="adm-pill" key={i}>
                        <span className="adm-pill__label">{r.Tipo_inscripcion}</span>
                        <span className="adm-pill__val">
                          {fmt(r.Total)} <em>({fmtPct(r.Porcentaje)})</em>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Bajas y retiros</h3>
                  <Table
                    cols={[
                      { key: "motivo", label: "Concepto" },
                      { key: "total",  label: "Total", render: (r) => fmt(r.total) },
                    ]}
                    rows={bajasRows}
                  />
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Reingresos por grado</h3>
                  <Table
                    cols={[
                      { key: "Grado",            label: "Grado" },
                      { key: "Paralelo",         label: "Paralelo" },
                      { key: "Total_Reingresos", label: "Reingresos",
                        render: (r) => fmt(r.Total_Reingresos) },
                    ]}
                    rows={movimientos?.regresosPorGrado ?? []}
                  />
                </div>
              </>
            )}
          </section>
        </div>

        {/* ── Anotaciones ──────────────────────── */}
        {/* SP: sp_admin_resumen_anotaciones
            ANOTACIONES_POR_TIPO_FALTA       → Tipo_falta, Total, Porcentaje
            ANOTACIONES_POR_ESTADO           → Estado, Total, Porcentaje
            TOP10_ESTUDIANTES_MAS_ANOTACIONES→ Nombre_Estudiante, Grado, Total_Anotaciones, Leves, Moderadas, Graves, Muy_Graves
            ANOTACIONES_POR_GRADO            → Grado, Paralelo, Total_Anotaciones, Porcentaje */}
        <section className="adm-block">
          <SectionTitle icon="📋">Anotaciones Disciplinarias</SectionTitle>
          {section(
            "ano",
            <div className="adm-row adm-row--wrap">
              <div className="adm-block--third">
                <h3 className="adm-label">Por tipo de falta</h3>
                <div className="adm-pills">
                  {anotaciones?.porTipoFalta?.map((r, i) => (
                    <div className="adm-pill adm-pill--warn" key={i}>
                      <span className="adm-pill__label">{r.Tipo_falta}</span>
                      <span className="adm-pill__val">
                        {fmt(r.Total)} <em>({fmtPct(r.Porcentaje)})</em>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-block--third">
                <h3 className="adm-label">Por estado</h3>
                <div className="adm-pills">
                  {anotaciones?.porEstado?.map((r, i) => (
                    <div className="adm-pill" key={i}>
                      <span className="adm-pill__label">{r.Estado}</span>
                      <span className="adm-pill__val">
                        {fmt(r.Total)} <em>({fmtPct(r.Porcentaje)})</em>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-block--third">
                <h3 className="adm-label">Top 10 estudiantes</h3>
                <Table
                  cols={[
                    { key: "Nombre_Estudiante", label: "Estudiante" },
                    { key: "Total_Anotaciones", label: "#",
                      render: (r) => fmt(r.Total_Anotaciones) },
                  ]}
                  rows={anotaciones?.top10 ?? []}
                />
              </div>

              <div style={{ width: "100%" }}>
                <h3 className="adm-label">Por grado</h3>
                {anotaciones?.porGrado?.map((r, i) => (
                  <MiniBar
                    key={i}
                    label={`${r.Grado}${r.Paralelo ? " " + r.Paralelo : ""}`}
                    value={r.Total_Anotaciones}
                    max={maxAno}
                    color={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Financiero + Rendimiento ──────────── */}
        <div className="adm-row">

          {/* Financiero */}
          {/* SP: sp_admin_reporte_financiero
              RESUMEN_GENERAL → Anio_Academico, Total_Facturado, Total_Cobrado,
                                 Total_Pendiente, Porcentaje_Recaudo, Monto_Atrasado, Pagos_Atrasados
              POR_CONCEPTO    → Concepto, Total_Registros, Total_Facturado, Total_Cobrado, Total_Pendiente
              TOP_MOROSOS     → Nombre_Estudiante, Grado, Total_Deuda, Cuotas_Pendientes, Max_Dias_Vencido */}
          <section className="adm-block adm-block--half">
            <SectionTitle icon="💰">Reporte Financiero</SectionTitle>
            {section(
              "fin",
              <>
                <div className="adm-subsection">
                  <h3 className="adm-label">Resumen general</h3>
                  <div className="adm-stat-list">
                    {resumenFinRows.map((r, i) => (
                      <div className="adm-stat" key={i}>
                        <span>{r.label}</span>
                        <strong>{r.valor}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Por concepto</h3>
                  <Table
                    cols={[
                      { key: "Concepto",       label: "Concepto" },
                      { key: "Total_Cobrado",  label: "Cobrado",
                        render: (r) => fmtBs(r.Total_Cobrado) },
                      { key: "Total_Pendiente",label: "Pendiente",
                        render: (r) => fmtBs(r.Total_Pendiente) },
                    ]}
                    rows={financiero?.porConcepto ?? []}
                  />
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Top morosos</h3>
                  <Table
                    cols={[
                      { key: "Nombre_Estudiante", label: "Estudiante" },
                      { key: "Grado",             label: "Grado" },
                      { key: "Total_Deuda",        label: "Deuda",
                        render: (r) => fmtBs(r.Total_Deuda) },
                      { key: "Cuotas_Pendientes",  label: "Cuotas",
                        render: (r) => fmt(r.Cuotas_Pendientes) },
                    ]}
                    rows={financiero?.topMorosos ?? []}
                  />
                </div>
              </>
            )}
          </section>

          {/* Rendimiento */}
          {/* SP: sp_admin_reporte_rendimiento_academico
              PROMEDIO_POR_GRADO      → Grado, Paralelo, Nivel, Promedio_General, Porcentaje_Aprobacion
              MATERIAS_CRITICAS       → Nombre_de_la_materia, Promedio_General, Total_Reprobados, Porcentaje_Reprobacion
              RENDIMIENTO_POR_DOCENTE → Docente, Especialidad, Promedio_General, Porcentaje_Aprobacion */}
          <section className="adm-block adm-block--half">
            <SectionTitle icon="📊">Rendimiento Académico</SectionTitle>
            {section(
              "ren",
              <>
                <div className="adm-subsection">
                  <h3 className="adm-label">Promedio por grado</h3>
                  <Table
                    cols={[
                      { key: "Grado",                label: "Grado" },
                      { key: "Paralelo",             label: "Par." },
                      { key: "Promedio_General",     label: "Promedio",
                        render: (r) => r.Promedio_General ?? "—" },
                      { key: "Porcentaje_Aprobacion",label: "% Aprobación",
                        render: (r) => fmtPct(r.Porcentaje_Aprobacion) },
                    ]}
                    rows={rendimiento?.promedioPorGrado ?? []}
                  />
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Materias críticas</h3>
                  <Table
                    cols={[
                      { key: "Nombre_de_la_materia",  label: "Materia" },
                      { key: "Promedio_General",       label: "Prom.",
                        render: (r) => r.Promedio_General ?? "—" },
                      { key: "Total_Reprobados",       label: "Reprobados",
                        render: (r) => fmt(r.Total_Reprobados) },
                      { key: "Porcentaje_Reprobacion", label: "% Reprob.",
                        render: (r) => fmtPct(r.Porcentaje_Reprobacion) },
                    ]}
                    rows={rendimiento?.materiasCriticas ?? []}
                  />
                </div>

                <div className="adm-subsection">
                  <h3 className="adm-label">Rendimiento por docente</h3>
                  <Table
                    cols={[
                      { key: "Docente",              label: "Docente" },
                      { key: "Promedio_General",     label: "Promedio",
                        render: (r) => r.Promedio_General ?? "—" },
                      { key: "Porcentaje_Aprobacion",label: "% Aprobación",
                        render: (r) => fmtPct(r.Porcentaje_Aprobacion) },
                    ]}
                    rows={rendimiento?.rendimientoPorDocente ?? []}
                  />
                </div>
              </>
            )}
          </section>
        </div>

        {/* ── Lista Cárdex ─────────────────────── */}
        {/* SP: sp_admin_cardex_lista
            Campos: Nombre_Completo, Grado, Paralelo, Estado_Estudiante,
                    Promedio_General, Rendimiento, Deuda_Pendiente,
                    Total_Anotaciones, Anotaciones_Activas */}
        <section className="adm-block">
          <SectionTitle icon="📁">
            Lista de Cárdex{" "}
            <span className="adm-badge">{fmt(cardex.total)}</span>
          </SectionTitle>
          {section(
            "cdx",
            <Table
              cols={[
                { key: "Nombre_Completo",   label: "Nombre" },
                { key: "Grado",             label: "Grado" },
                { key: "Paralelo",          label: "Par." },
                { key: "Estado_Estudiante", label: "Estado" },
                { key: "Promedio_General",  label: "Promedio",
                  render: (r) => r.Promedio_General ?? "—" },
                { key: "Rendimiento",       label: "Rendimiento" },
                { key: "Deuda_Pendiente",   label: "Deuda",
                  render: (r) => fmtBs(r.Deuda_Pendiente) },
                { key: "Total_Anotaciones", label: "Anot.",
                  render: (r) => fmt(r.Total_Anotaciones) },
              ]}
              rows={cardex.data ?? []}
              emptyMsg="No hay estudiantes con los filtros aplicados."
            />
          )}
        </section>

      </div>
    </>
  );
}

export default Admin;