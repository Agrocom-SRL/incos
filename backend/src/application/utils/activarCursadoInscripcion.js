import { sequelize } from '../../infrastructure/database/sequelize.js';

/**
 * Orquesta (en una transacción) la activación de cursado de una inscripción:
 * pasa sus matrículas de materia INSCRITO → CURSANDO y abre sus 4 bimestres.
 *
 * Cada paso escribe una sola tabla a través de su repositorio:
 * - subjectEnrollmentRepository       → matriculas_materia
 * - subjectEnrollmentBimesterRepository → bimestres_matricula
 *
 * Idempotente: reejecutar devuelve `matriculasInscritoACursando = 0`.
 *
 * @param {Object} params
 * @param {Object} params.subjectEnrollmentRepository
 * @param {Object} params.subjectEnrollmentBimesterRepository
 * @param {number} params.inscripcionId
 * @param {number|null} [params.userId]
 * @returns {Promise<{ matriculasInscritoACursando: number }>}
 */
export async function activarCursadoInscripcion({
  subjectEnrollmentRepository,
  subjectEnrollmentBimesterRepository,
  inscripcionId,
  userId = null,
}) {
  return sequelize.transaction(async (t) => {
    const matriculasInscritoACursando =
      await subjectEnrollmentRepository.marcarCursandoPorInscripcion(inscripcionId, userId, {
        transaction: t,
      });
    await subjectEnrollmentBimesterRepository.abrirBimestresFaltantesPorInscripcion(
      inscripcionId,
      userId,
      { transaction: t },
    );
    return { matriculasInscritoACursando };
  });
}
