// services/adminService.js
import { API_URL } from "../Api";


// ── 1. Dashboard KPI ────────────────────────────────────────
export const fetchDashboardKpi = async () => {
  const res = await fetch(`${API_URL}/dashboard/kpi`);
  if (!res.ok) throw new Error("Error al obtener KPIs");
  const { data } = await res.json();
  return data;
};

// ── 2. Resumen de Estudiantes ───────────────────────────────
export const fetchResumenEstudiantes = async (anio = null) => {
  const params = anio ? `?anio=${anio}` : "";
  const res = await fetch(`${API_URL}/estudiantes/resumen${params}`);
  if (!res.ok) throw new Error("Error al obtener resumen de estudiantes");
  const { data } = await res.json();
  return data;
};

// ── 3. Resumen de Anotaciones ───────────────────────────────
export const fetchResumenAnotaciones = async (inicio = null, fin = null) => {
  const params = new URLSearchParams();
  if (inicio) params.append("inicio", inicio);
  if (fin) params.append("fin", fin);
  const query = params.toString() ? `?${params}` : "";
  const res = await fetch(`${API_URL}/anotaciones/resumen${query}`);
  if (!res.ok) throw new Error("Error al obtener anotaciones");
  const { data } = await res.json();
  return data;
};

// ── 4. Resumen de Movimientos ───────────────────────────────
export const fetchResumenMovimientos = async (anio = null) => {
  const params = anio ? `?anio=${anio}` : "";
  const res = await fetch(`${API_URL}/movimientos/resumen${params}`);
  if (!res.ok) throw new Error("Error al obtener movimientos");
  const { data } = await res.json();
  return data;
};

// ── 5. Cárdex Individual ────────────────────────────────────
export const fetchCardexEstudiante = async (idEstudiante, anio = null) => {
  const params = anio ? `?anio=${anio}` : "";
  const res = await fetch(`${API_URL}/cardex/${idEstudiante}${params}`);
  if (!res.ok) throw new Error("Error al obtener cárdex del estudiante");
  const { data } = await res.json();
  return data;
};

// ── 6. Lista de Cárdex ──────────────────────────────────────
export const fetchCardexLista = async ({ anio = null, grado = null, estado = null } = {}) => {
  const params = new URLSearchParams();
  if (anio) params.append("anio", anio);
  if (grado) params.append("grado", grado);
  if (estado) params.append("estado", estado);
  const query = params.toString() ? `?${params}` : "";
  const res = await fetch(`${API_URL}/cardex${query}`);
  if (!res.ok) throw new Error("Error al obtener lista de cárdex");
  const { data, total } = await res.json();
  return { data, total };
};

// ── 7. Reporte Financiero ───────────────────────────────────
export const fetchReporteFinanciero = async (anio = null) => {
  const params = anio ? `?anio=${anio}` : "";
  const res = await fetch(`${API_URL}/financiero/reporte${params}`);
  if (!res.ok) throw new Error("Error al obtener reporte financiero");
  const { data } = await res.json();
  return data;
};

// ── 8. Reporte de Rendimiento Académico ─────────────────────
export const fetchReporteRendimiento = async (anio = null) => {
  const params = anio ? `?anio=${anio}` : "";
  const res = await fetch(`${API_URL}/rendimiento/reporte${params}`);
  if (!res.ok) throw new Error("Error al obtener reporte de rendimiento");
  const { data } = await res.json();
  return data;
};