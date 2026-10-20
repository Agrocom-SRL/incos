/**
 * Entidades y etiquetas derivadas del payload de detalle.
 */

import { historialPrevioEstadoLabel } from '@application-matricula/registro/utils/historialPrevioHelpers';
import {
  initialsFromName,
  canEditEnrollmentType,
} from '@application-matricula/registro/utils/inscripcionDetailHelpers';

export const useMatriculaDetailEntity = (inscripcion) => {
  const {
    enrollment,
    studentAcademicData,
    management,
    student,
    career,
    subjectEnrollments = [],
    priorEnrollmentHistories = [],
    historialPrevioEstado,
    requiereHistorialPrevio,
    cantidadHistorialPrevio,
  } = inscripcion ?? {};

  const tipoInscripcion =
    enrollment?.tipoInscripcion ?? enrollment?.tipo_inscripcion ?? null;
  const canEdit = canEditEnrollmentType(tipoInscripcion);

  const historialEstadoInfo = historialPrevioEstadoLabel(
    historialPrevioEstado ??
      (requiereHistorialPrevio === false
        ? 'NO_APLICA'
        : (cantidadHistorialPrevio ?? priorEnrollmentHistories.length) > 0
          ? 'REGISTRADO'
          : 'PENDIENTE'),
  );

  const nombreCompleto = [student?.nombres, student?.apellidoPaterno, student?.apellidoMaterno]
    .filter(Boolean)
    .join(' ')
    .trim();

  const avatarText = initialsFromName(nombreCompleto || `INS-${enrollment?.id || ''}`);

  return {
    tipoInscripcion,
    canEdit,
    enrollment,
    studentAcademicData,
    management,
    student,
    career,
    subjectEnrollments,
    priorEnrollmentHistories,
    historialPrevioEstado,
    requiereHistorialPrevio,
    cantidadHistorialPrevio,
    historialEstadoInfo,
    nombreCompleto,
    avatarText,
  };
};
