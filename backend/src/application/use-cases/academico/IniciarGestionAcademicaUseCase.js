import { ConflictError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

/**
 * Inicia la gestión académica vigente: INSCRITO → CURSANDO y abre el bimestre 1.
 *
 * Orquesta la operación multi-tabla en una transacción; cada repositorio escribe
 * una sola tabla:
 * - subjectEnrollmentRepository         → matriculas_materia
 * - subjectEnrollmentBimesterRepository → bimestres_matricula
 * El contexto de gestión vigente se lee de calificacionContextoRepository.
 */
export class IniciarGestionAcademicaUseCase {
  constructor({
    calificacionContextoRepository,
    subjectEnrollmentRepository,
    subjectEnrollmentBimesterRepository,
    logger,
  }) {
    this.contexto = calificacionContextoRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.logger = logger;
  }

  async execute({ userId }) {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      throw new ConflictError('No hay gestión académica vigente');
    }
    const gestionId = Number(ctx.gestion_id);

    const yaIniciada = await this.subjectEnrollmentRepository.existeCursandoEnGestion(gestionId);
    if (yaIniciada) {
      const err = new ConflictError('La gestión académica ya fue iniciada');
      err.code = 'GESTION_YA_INICIADA';
      throw err;
    }

    const result = await sequelize.transaction(async (t) => {
      const matriculasInscritoACursando =
        await this.subjectEnrollmentRepository.marcarCursandoPorGestion(gestionId, userId, {
          transaction: t,
        });
      await this.subjectEnrollmentBimesterRepository.abrirBimestresFaltantesPorGestion(
        gestionId,
        userId,
        { transaction: t },
      );
      return { matriculasInscritoACursando };
    });

    this.logger.info('[Calificaciones] Gestión académica iniciada', result);
    return result;
  }
}
