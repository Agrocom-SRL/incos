/**
 * Login + permisos en una sola secuencia (permisos vienen en POST /auth/login).
 * GET /auth/me solo como respaldo si la respuesta de login no trae permisos.
 */

import { apiCall, buildV1FetchUrl } from '@/infrastructure/http/apiClient.js';
import { AUTH_ENDPOINTS } from '@api/endpoints.js';

function formatApiErrorMessage(json, status) {
  const err = json?.error;
  if (status === 422 && err?.details?.length) {
    return err.details.map((d) => d.message || d.msg || String(d)).join('. ');
  }
  if (typeof err === 'string') return err;
  return err?.message || 'No se pudo iniciar sesión';
}

/**
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ token: string, usuario: object, permisos: Array }>}
 */
export async function authenticateCredentials({ username, password }) {
  const res = await fetch(buildV1FetchUrl(AUTH_ENDPOINTS.LOGIN), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(formatApiErrorMessage(json, res.status));
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  const token = json.data?.token;
  const usuario = json.data?.usuario;
  let permisos = json.data?.permisos;

  if (!token || !usuario) {
    const err = new Error('Respuesta del servidor incompleta.');
    err.status = 500;
    throw err;
  }

  localStorage.setItem('incos_token', token);

  if (!Array.isArray(permisos) || permisos.length === 0) {
    const meRes = await apiCall(AUTH_ENDPOINTS.ME);
    const meJson = await meRes?.json?.().catch(() => ({}));
    if (!meRes?.ok) {
      localStorage.removeItem('incos_token');
      localStorage.removeItem('incos_usuario');
      const err = new Error(formatApiErrorMessage(meJson, meRes?.status ?? 500));
      err.status = meRes?.status ?? 500;
      throw err;
    }
    permisos = meJson.data?.permisos ?? [];
  }

  return { token, usuario, permisos };
}
