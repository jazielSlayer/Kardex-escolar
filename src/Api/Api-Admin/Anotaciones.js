const BASE_URL = "http://localhost:3700";

/* ── Registrar anotación ─────────────────────────────────────── */
export const registrarAnotacion = async (payload) => {
  const res = await fetch(`${BASE_URL}/anotaciones/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 404 = no encontrado, 409 = conflicto (duplicado / ambiguo)
  // Ambos retornan JSON con { ok, mensaje } — no son errores de red
  if (!res.ok && res.status !== 404 && res.status !== 409) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

/* ── Obtener todas las anotaciones ──────────────────────────── */
export const obtenerAnotaciones = async () => {
  const res = await fetch(`${BASE_URL}/anotaciones/obtener`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

/* ── Obtener anotaciones por estudiante ─────────────────────── */
export const obtenerAnotacionesPorEstudiante = async (nombre, apellido) => {
  const params = new URLSearchParams({ nombre: nombre.trim(), apellido: apellido.trim() });
  const res = await fetch(`${BASE_URL}/anotaciones/estudiante?${params}`);
  if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

/* ── Actualizar estado de anotación ─────────────────────────── */
export const actualizarEstadoAnotacion = async (payload) => {
  const res = await fetch(`${BASE_URL}/anotaciones/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
  return res.json();
};