import { apiCall } from '@/infrastructure/http/apiClient';
import { USUARIOS_SEG_ENDPOINTS } from '@api/endpoints';

function buildQueryUrl(base, query, limit) {
  const q = new URLSearchParams({ query: String(query).trim() });
  if (limit != null) q.set('limit', String(limit));
  return `${base}?${q.toString()}`;
}

export class UsuarioAltaLookupRepository {
  async buscarEstudiantesSinCuenta(query, limit = 20) {
    const url = buildQueryUrl(USUARIOS_SEG_ENDPOINTS.ALTA_BUSCAR_ESTUDIANTES, query, limit);
    const res = await apiCall(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return Array.isArray(json.data?.estudiantes) ? json.data.estudiantes : [];
  }

  async buscarDocentesSinCuenta(query, limit = 20) {
    const url = buildQueryUrl(USUARIOS_SEG_ENDPOINTS.ALTA_BUSCAR_DOCENTES, query, limit);
    const res = await apiCall(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return Array.isArray(json.data?.docentes) ? json.data.docentes : [];
  }
}

export default new UsuarioAltaLookupRepository();
