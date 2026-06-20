/**
 * Sesión mock — forma del usuario autenticado (contrato = backend auth).
 * Reemplazable por la respuesta real de /auth/me sin tocar consumidores.
 */
export const sessionMock = {
  user: {
    name: 'Miguel Ángel Escobar',
    role: 'Administrador',
  },
  term: { year: 2026 },
};

export default sessionMock;
