/**
 * Lista EXPLÍCITA de rutas públicas (sin token). Todo lo demás debe responder 401.
 * Agregar aquí una ruta pública exige justificarlo en el PR (revisión de seguridad).
 */
export const RUTAS_PUBLICAS = [
  { metodo: 'POST', ruta: '/api/v1/auth/login', motivo: 'inicio de sesión' },
  { metodo: 'GET', ruta: '/health', motivo: 'monitoreo' },
  { metodo: 'GET', ruta: '/api/v1/health', motivo: 'monitoreo' },
  { metodo: 'GET', ruta: '/api/v1', motivo: 'índice de la API (sin datos)' },
  { metodo: 'GET', ruta: '/api-docs.json', motivo: 'especificación OpenAPI' },
  { metodo: 'OPTIONS', ruta: '*', motivo: 'preflight CORS' },
];

export function esPublica({ metodo, ruta }) {
  return RUTAS_PUBLICAS.some((p) => p.metodo === metodo && p.ruta === ruta);
}
