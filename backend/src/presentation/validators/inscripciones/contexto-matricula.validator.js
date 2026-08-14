/**
 * Validador para GET /api/v1/inscripciones/contexto-matricula
 *
 * Query:
 * - estudiante_id: requerido, entero > 0
 * - carrera_id: opcional (requerido a nivel de negocio solo si el estudiante
 *   no tiene carrera fija; esa regla vive en GetMatriculaContextoUseCase)
 * - plan_estudio_id: opcional, entero > 0
 * - excluir_inscripcion_id: opcional, entero > 0 (modo edición del wizard: la
 *   inscripción en edición no cuenta para el perfil esNuevoSistema/yaMatriculado)
 */
import expressValidator from 'express-validator';

const { query } = expressValidator;

export const contextoMatriculaValidator = [
  query('estudiante_id')
    .notEmpty()
    .withMessage('El ID del estudiante es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del estudiante debe ser un número entero mayor a 0')
    .toInt(),

  query('carrera_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('El ID de la carrera debe ser un número entero mayor a 0')
    .toInt(),

  query('plan_estudio_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('El ID del plan de estudios debe ser un número entero mayor a 0')
    .toInt(),

  query('excluir_inscripcion_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('El ID de la inscripción a excluir debe ser un número entero mayor a 0')
    .toInt(),
];
