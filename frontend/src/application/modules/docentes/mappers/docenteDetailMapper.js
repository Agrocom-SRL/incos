/**
 * Normaliza la respuesta del detalle de docente (API → modelo de vista).
 * El backend ya envía etiquetas legibles; aquí solo se garantiza forma estable.
 */

export function mapDocenteDetailFromApi(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  return {
    profile: raw.profile && typeof raw.profile === 'object' ? raw.profile : {},
    assignments: Array.isArray(raw.assignments) ? raw.assignments : [],
    courseSchedules: Array.isArray(raw.courseSchedules) ? raw.courseSchedules : [],
    access: raw.access && typeof raw.access === 'object' ? raw.access : { tieneAcceso: false },
  };
}
