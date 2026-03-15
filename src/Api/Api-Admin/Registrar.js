// services/estudianteService.js
import { API_URL } from "../Api";

/**
 * Registra un estudiante completo con tutores.
 * @param {Object} payload  - Cuerpo completo del formulario
 * @returns {Object}        - { ok, mensaje, data }
 */
export const registrarEstudiante = async (payload) => {
  const res = await fetch(`${API_URL}/registrar/estudiante`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok && res.status !== 409) {
    throw new Error(json.mensaje || "Error de servidor");
  }

  return json; // { ok, mensaje, data }
};