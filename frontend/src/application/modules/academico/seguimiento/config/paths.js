/**
 * Rutas del ítem Seguimiento académico (dominio ACADÉMICO · ACA-SEGUIMIENTO).
 *
 * Agrupación 2026-08-01: los ítems de sidebar ACA-AVANCE (Avance académico) y
 * los 3 de Acompañamiento (ACA-ALERTAS, ACA-SESIONES, ACA-PANEL) se agrupan en
 * este único ítem con pestañas gateadas por permiso. Las URLs legadas
 * (`/academico/avance`, `/academico/acompanamiento/*`) NO se eliminan: quedan
 * como rutas gemelas del contenedor (ver routes.jsx de cada submódulo).
 */

export const SEGUIMIENTO_PATH = '/academico/seguimiento';

/** Key de menú (sidebar) — debe coincidir con seguimiento/routes.jsx. */
export const ACA_SEGUIMIENTO_MENU_KEY = 'ACA-SEGUIMIENTO';
