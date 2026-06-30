import { apiCall } from '@/infrastructure/http/apiClient';
import { USUARIOS_SEG_ENDPOINTS } from '@api/endpoints';

export class UsuarioAdminRepository {
  async findAll(params = {}) {
    const safeParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value === undefined || value === null || value === '') return acc;
      acc[key] = String(value);
      return acc;
    }, {});
    const query = new URLSearchParams(safeParams).toString();
    const url = query ? `${USUARIOS_SEG_ENDPOINTS.BASE}?${query}` : USUARIOS_SEG_ENDPOINTS.BASE;
    const res = await apiCall(url);
    if (!res) {
      return { users: [], total: 0, pagination: null };
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    const payload = json.data ?? {};
    const users = Array.isArray(payload)
      ? payload
      : (payload.users ?? payload.usuarios ?? []);
    const pagination = json.pagination ?? payload.pagination ?? null;
    return {
      users: Array.isArray(users) ? users : [],
      total: pagination?.total ?? payload.total ?? 0,
      pagination,
    };
  }

  async findById(id) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.BY_ID(id));
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data?.usuario ?? json.data;
  }

  async create(data) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }

  async update(id, data) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }

  async changeEstado(id, data) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.ESTADO(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }

  async changePassword(id, data) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.PASSWORD(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw json;
    }
  }

  async findPermisos(id) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.PERMISOS(id));
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }

  async addOverride(id, data) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.PERMISOS(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }

  async removeOverride(id, overrideId) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.PERMISO_OVERRIDE(id, overrideId), {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw json;
    }
  }

  async remove(id) {
    const res = await apiCall(USUARIOS_SEG_ENDPOINTS.BY_ID(id), {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw json;
    }
  }
}

export default new UsuarioAdminRepository();

