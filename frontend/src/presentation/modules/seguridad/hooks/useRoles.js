import { useCallback } from 'react';
import { apiCall } from '@/infrastructure/http/apiClient.js';
import { ROLES_SEG_ENDPOINTS } from '@api/endpoints.js';

async function readJson(res) {
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

export function useRoles() {
  const listRoles = useCallback(async () => {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.BASE);
    if (!res) return null;
    return readJson(res);
  }, []);

  const getRolPermisos = useCallback(async (id) => {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.PERMISOS(id));
    if (!res) return null;
    return readJson(res);
  }, []);

  const updateRolPermisos = useCallback(async (id, data) => {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.PERMISOS(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res) return null;
    return readJson(res);
  }, []);

  return { listRoles, getRolPermisos, updateRolPermisos };
}
