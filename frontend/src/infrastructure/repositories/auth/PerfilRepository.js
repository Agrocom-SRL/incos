import { apiCall } from '@/infrastructure/http/apiClient';
import { AUTH_ENDPOINTS } from '@api/endpoints';

/**
 * Repositorio del perfil propio (self-service).
 * El cambio de contraseña verifica la contraseña actual (PATCH /auth/me/password).
 */
export class PerfilRepository {
  async cambiarMiPassword(data) {
    const res = await apiCall(AUTH_ENDPOINTS.ME_PASSWORD, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json;
    return json.data;
  }
}

export default new PerfilRepository();
