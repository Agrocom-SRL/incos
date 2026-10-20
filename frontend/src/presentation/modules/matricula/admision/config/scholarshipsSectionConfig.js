/**
 * scholarshipsSectionConfig - Config de presentación para ScholarshipsSection
 *
 * Single Responsibility: mapear el estado de una beca asignada a su badge
 * (label/color/fondo/borde) y formatear fechas para el listado de becas del
 * detalle de estudiante (@organisms/ScholarshipsSection).
 */

/**
 * Configuración visual por estado de beca asignada.
 * @typedef {{ label: string, bg: string, color: string, border: string }} EstadoBecaCfg
 */

/** Config por defecto cuando el estado no está en el mapa (o viene vacío). */
export const DEFAULT_ESTADO_CFG = Object.freeze({
  label: '—',
  bg: '#f9fafb',
  color: '#6b7280',
  border: '#e5e7eb',
});

/** Mapa estado → configuración visual del badge. */
export const ESTADO = Object.freeze({
  PENDIENTE: { label: 'Pendiente', bg: '#fef3c7', color: '#92400e', border: 'rgba(245,158,11,.22)' },
  ACTIVA: { label: 'Activa', bg: '#e8f5e9', color: '#196b45', border: 'rgba(25,107,69,.22)' },
  FINALIZADA: { label: 'Finalizada', bg: '#eff6ff', color: '#1e40af', border: 'rgba(59,130,246,.22)' },
  RECHAZADA: { label: 'Rechazada', bg: '#fee2e2', color: '#991b1b', border: 'rgba(228,28,36,.22)' },
});

/**
 * Resuelve la configuración visual del badge para un estado dado.
 * @param {string} [estado]
 * @returns {EstadoBecaCfg}
 */
export function getEstadoBecaCfg(estado) {
  if (!estado) return { ...DEFAULT_ESTADO_CFG };
  return ESTADO[estado] || { ...DEFAULT_ESTADO_CFG, label: estado };
}

/**
 * Formatea una fecha (ISO/Date) al formato largo en español boliviano.
 * @param {string|Date} [d]
 * @returns {string|null}
 */
export const formatDate = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d;
  }
};
