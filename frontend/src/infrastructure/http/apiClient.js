/**
 * Cliente fetch alineado con `endpoints.js` (rutas /v1) y VITE_API_URL / VITE_API_BASE_URL.
 */

import { toFetchPathFromV1 } from '@api/endpoints.js';

export function getApiBaseUrl() {
  const explicit = import.meta.env.VITE_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return `${base.replace(/\/$/, '')}/v1`;
}

/**
 * URL absoluta para fetch usando la misma ruta que en `endpoints.js` (p. ej. AUTH_ENDPOINTS.LOGIN).
 */
export function buildV1FetchUrl(pathV1) {
  const path = toFetchPathFromV1(pathV1);
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${suffix}`;
}

/**
 * @param {string} endpoint - Ruta estilo endpoints (p. ej. `${API_BASE}/usuarios` o `/usuarios` bajo raíz v1)
 * @param {RequestInit} [options]
 * @returns {Promise<Response|undefined>} undefined si redirige por 401
 */
export async function apiCall(endpoint, options = {}) {
  const path = toFetchPathFromV1(endpoint);
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const token = localStorage.getItem('incos_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${getApiBaseUrl()}${suffix}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('incos_token');
    localStorage.removeItem('incos_usuario');
    window.location.href = '/login';
    return undefined;
  }

  return res;
}
