import { apiCall } from '@/infrastructure/http/apiClient';
import { ROLES_SEG_ENDPOINTS } from '@api/endpoints';

export class RolAdminRepository {
  async findAll() {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.BASE);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data?.roles ?? [];
  }

  async create(data) {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data?.rol ?? json.data;
  }

  async findPermisosById(id) {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.PERMISOS(id));
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }

  async findPermisosGrillaById(id, dominio) {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.PERMISOS_GRILLA(id, dominio));
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return Array.isArray(json.data) ? json.data : [];
  }

  async updatePermisos(id, payload) {
    const res = await apiCall(ROLES_SEG_ENDPOINTS.PERMISOS(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }
}

export default new RolAdminRepository();

