/**
 * Rutas del módulo auth (paths normalizados para react-router y URLs absolutas).
 */

export const AUTH_LOGIN_PATH = '/login';
export const AUTH_NOT_FOUND_PUBLIC_PATH = '/acceso/pagina-no-encontrada';
export const AUTH_NOT_FOUND_PANEL_PATH = '/pagina-no-encontrada';
export const AUTH_DASHBOARD_PATH = '/dashboard';

/** Paths sin barra inicial — coinciden con routeNormalizer. */
export const AUTH_PUBLIC_PATHS = new Set(['login', 'acceso/pagina-no-encontrada']);
