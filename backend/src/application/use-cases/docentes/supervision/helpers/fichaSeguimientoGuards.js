/**
 * Guards compartidos del recurso Supervisión docente (módulo DOC ·
 * fichas_seguimiento_clase, schema 27).
 *
 * Reglas que comparten Create/Update:
 * - la asignación docente observada debe existir y estar VIGENTE,
 * - coherencia de asistencia: asistentes ≤ estudiantes en planilla.
 */

import { NotFoundError, ValidationError } from '../../../../../domain/errors/AppError.js';
import { parseNumero } from '../../../../utils/validacionEntrada.js';

/**
 * La asignación observada debe existir y estar vigente (entidad
 * TeacherAssignment: `active` proviene del campo BD `vigente`).
 *
 * @param {{ teacherAssignmentRepository: Object, asignacionDocenteId: number }} deps
 * @returns {Promise<Object>} La asignación (entidad) validada
 */
export async function assertAsignacionDocenteVigente({
  teacherAssignmentRepository,
  asignacionDocenteId,
}) {
  const asignacion = await teacherAssignmentRepository.findById(asignacionDocenteId);
  if (!asignacion) {
    throw new NotFoundError(`asignación docente con ID ${asignacionDocenteId}`);
  }

  const plain = asignacion.toPlainObject?.() ?? asignacion;
  if (plain.active === false) {
    throw new ValidationError(
      'La asignación docente seleccionada no está vigente; seleccione un curso con docente vigente.'
    );
  }

  return asignacion;
}

/**
 * Asistentes observados no puede superar a los estudiantes en planilla
 * (cuando ambos valores están presentes).
 *
 * @param {number|null|undefined} estudiantesEnPlanilla
 * @param {number|null|undefined} estudiantesAsistentes
 */
export function assertAsistenciaCoherente(estudiantesEnPlanilla, estudiantesAsistentes) {
  const presente = (v) => v !== undefined && v !== null;
  // Cada cantidad presente debe ser un entero >= 0 ('abc', -1 o 1.5 ⇒ ValidationError).
  const enPlanilla = presente(estudiantesEnPlanilla)
    ? parseNumero(estudiantesEnPlanilla, 'estudiantesEnPlanilla', { min: 0, entero: true })
    : null;
  const asistentes = presente(estudiantesAsistentes)
    ? parseNumero(estudiantesAsistentes, 'estudiantesAsistentes', { min: 0, entero: true })
    : null;
  if (enPlanilla !== null && asistentes !== null && asistentes > enPlanilla) {
    throw new ValidationError(
      'La cantidad de estudiantes asistentes no puede superar a la cantidad en planilla.'
    );
  }
}
