/**
 * Normaliza body HTTP (snake_case o camelCase) a campos de dominio.
 */
export function normalizeTeacherAssignmentBody(body = {}) {
  const b = body || {};
  return {
    managementPlanId: pickInt(b, 'gestionPlanId', 'gestion_plan_id'),
    offerCourseId: pickInt(b, 'offerCourseId', 'oferta_curso_id', 'ofertaCursoId', 'cursoId'),
    teacherId: pickInt(b, 'docenteId', 'docente_id', 'teacherId'),
    hours: pickOptionalInt(b, 'cargaHoraria', 'carga_horaria', 'hours'),
    assignmentDate: pickString(b, 'fechaAsignacion', 'fecha_asignacion'),
    active: pickOptionalBool(b, 'vigente', 'active'),
    reason: pickString(b, 'motivo', 'reason'),
    confirmOverload: pickBool(b, 'confirmarSobrecarga', 'confirmar_sobrecarga'),
  };
}

function pickInt(obj, ...keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return Number(obj[key]);
    }
  }
  return NaN;
}

function pickOptionalInt(obj, ...keys) {
  for (const key of keys) {
    if (obj[key] !== undefined) {
      if (obj[key] === null || obj[key] === '') return null;
      return Number(obj[key]);
    }
  }
  return undefined;
}

function pickString(obj, ...keys) {
  for (const key of keys) {
    if (obj[key] !== undefined) {
      return obj[key] === null || obj[key] === '' ? null : String(obj[key]).trim();
    }
  }
  return undefined;
}

function pickOptionalBool(obj, ...keys) {
  for (const key of keys) {
    if (obj[key] !== undefined) {
      return parseBool(obj[key]);
    }
  }
  return undefined;
}

function pickBool(obj, ...keys) {
  for (const key of keys) {
    if (obj[key] !== undefined) {
      return parseBool(obj[key]) === true;
    }
  }
  return false;
}

function parseBool(value) {
  if (value === true || value === 1 || value === '1' || value === 'true') return true;
  if (value === false || value === 0 || value === '0' || value === 'false') return false;
  return undefined;
}
