import { useCallback } from 'react';
import { apiCall } from '@/infrastructure/http/apiClient.js';
import { PERMISOS_CATALOGO_ENDPOINTS } from '@api/endpoints.js';

async function readJson(res) {
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

/** Catálogo GET /permisos (módulo SEG). */
export function usePermisos() {
  const listPermisos = useCallback(async (dominio) => {
    const url = dominio
      ? PERMISOS_CATALOGO_ENDPOINTS.withQuery({ dominio })
      : PERMISOS_CATALOGO_ENDPOINTS.BASE;
    const res = await apiCall(url);
    if (!res) return null;
    return readJson(res);
  }, []);

  const listPermisosAgrupados = useCallback(async () => {
    const wrapped = await listPermisos();
    if (!wrapped) return null;
    const { res, json } = wrapped;
    return { res, json, grouped: json.data ?? {} };
  }, [listPermisos]);

  return { listPermisos, listPermisosAgrupados };
}
