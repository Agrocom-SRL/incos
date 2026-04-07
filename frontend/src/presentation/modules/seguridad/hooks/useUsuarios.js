import { useCallback } from 'react';
import { apiCall } from '@/infrastructure/http/apiClient.js';
import { USUARIOS_SEG_ENDPOINTS } from '@api/endpoints.js';

async function readJson(res) {
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

export function useUsuarios() {
  const listUsers = useCallback(async (params = {}) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', String(params.page));
    if (params.limit != null) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.sort) q.set('sort', params.sort);
    const qs = q.toString();
    const url = qs
      ? `${USUARIOS_SEG_ENDPOINTS.BASE}?${qs}`
      : USUARIOS_SEG_ENDPOINTS.BASE;
    const res = await apiCall(url);
    if (!res) return null;
    return readJson(res);
  }, []);

  const getUser = useCallback(async (id) => {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.BY_ID(id));
    if (!res) return null;
    return readJson(res);
  }, []);

  const createUser = useCallback(async (data) => {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res) return null;
    return readJson(res);
  }, []);

  const updateUser = useCallback(async (id, data) => {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res) return null;
    return readJson(res);
  }, []);

  const changeEstado = useCallback(async (id, data) => {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.ESTADO(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res) return null;
    return readJson(res);
  }, []);

  const changePassword = useCallback(async (id, data) => {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.PASSWORD(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res) return null;
    return readJson(res);
  }, []);

  const getUserPermisos = useCallback(async (id) => {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.PERMISOS(id));
    if (!res) return null;
    return readJson(res);
  }, []);

  const addOverride = useCallback(async (id, data) => {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.PERMISOS(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res) return null;
    return readJson(res);
  }, []);

  const removeOverride = useCallback(async (id, overrideId) => {
    const res = await apiCall(
      USUARIOS_SEG_ENDPOINTS.PERMISO_OVERRIDE(id, overrideId),
      { method: 'DELETE' }
    );
    if (!res) return null;
    return readJson(res);
  }, []);

  return {
    listUsers,
    getUser,
    createUser,
    updateUser,
    changeEstado,
    changePassword,
    getUserPermisos,
    addOverride,
    removeOverride,
  };
}
