/**
 * useSession — punto único de acceso a la sesión del usuario.
 * Hoy devuelve el mock; mañana hará fetch a /auth/me. Los consumidores no cambian.
 */
import { sessionMock } from '@mocks/session.mock';

export function useSession() {
  return sessionMock;
}

export default useSession;
