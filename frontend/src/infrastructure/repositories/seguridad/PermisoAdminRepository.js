import { apiCall } from '@/infrastructure/http/apiClient';
import { PERMISOS_CATALOGO_ENDPOINTS } from '@api/endpoints';

export class PermisoAdminRepository {
  async findAllAgrupados(dominio) {
    const url = dominio
      ? PERMISOS_CATALOGO_ENDPOINTS.withQuery({ dominio })
      : PERMISOS_CATALOGO_ENDPOINTS.BASE;
    const res = await apiCall(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data ?? {};
  }
}

export default new PermisoAdminRepository();

