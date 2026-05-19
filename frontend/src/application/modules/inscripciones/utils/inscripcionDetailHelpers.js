/**
 * Utilidades puras para la ficha de matrícula (sin dependencias de React/UI).
 */

export const SLOT_STEP_INSCRIPCION = 45;

export const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'IN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

export const normalizeAulaLabel = (aula) => {
  if (!aula) return null;
  if (typeof aula === 'string') return aula;
  if (typeof aula === 'object') {
    return aula.nombre || aula.codigo || aula.name || aula.code || null;
  }
  return null;
};

export const getSubjectStatusColor = (status) => {
  const statusColors = {
    INSCRITO: 'blue',
    CURSANDO: 'processing',
    EN_CURSO: 'processing',
    APROBADO: 'success',
    REPROBADO: 'error',
    ABANDONO: 'warning',
    RETIRADO: 'default',
  };
  return statusColors[status] || 'default';
};

export const getEnrollmentTypeColor = (type) => {
  const typeColors = {
    NUEVO: 'green',
    ANTIGUO: 'orange',
    TRASPASO: 'cyan',
    TRANSITABILIDAD: 'gold',
  };
  return typeColors[type] || 'default';
};

export const canEditEnrollmentType = (tipoInscripcion) =>
  Boolean(
    tipoInscripcion &&
      ['NUEVO', 'ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD'].includes(tipoInscripcion),
  );
