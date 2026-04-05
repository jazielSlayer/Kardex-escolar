import { API_URL } from "../Api";

export const loginService = async (correo, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password }),
  });

  const json = await res.json();

  if (!res.ok && res.status !== 401) {
    throw new Error(json.mensaje || "Error de servidor");
  }

  return json;
};

export const generarCodigo2FAService = async (id_user, metodo) => {
  const res = await fetch(`${API_URL}/auth/2fa/generar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_user, metodo }),
  });

  const json = await res.json();

  if (!res.ok && res.status !== 409 && res.status !== 422) {
    throw new Error(json.mensaje || "Error de servidor");
  }

  return json;
};

export const verificarCodigo2FAService = async (id_user, id_verificacion, codigo) => {
  const res = await fetch(`${API_URL}/auth/2fa/verificar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_user, id_verificacion, codigo }),
  });

  const json = await res.json();

  if (!res.ok && res.status !== 401) {
    throw new Error(json.mensaje || "Error de servidor");
  }

  return json;
};