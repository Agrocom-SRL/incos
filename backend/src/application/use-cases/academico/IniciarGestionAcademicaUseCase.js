import { ConflictError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { claveCursadoIniciado } from '../../../domain/constants/gestion.constants.js';

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
    configuracionSistemaRepository,
    logger,
  }) {
    this.contexto = calificacionContextoRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.configuracion = configuracionSistemaRepository;
    this.logger = logger;
  }

  async execute({ userId }) {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      throw new ConflictError('No hay gestión académica vigente');
    }
    const gestionId = Number(ctx.gestion_id);

    // "Iniciada" se determina por la bandera `cursado_iniciado_<gestion>` en
    // configuracion_sistema; si aún no existe (gestiones previas a la bandera),
    // se cae al criterio derivado (¿hay matrículas en CURSANDO?).
    const flag = await this.configuracion?.obtenerValorPorClave(claveCursadoIniciado(gestionId));
    const yaIniciada =
      flag != null
        ? flag === 'true'
        : await this.subjectEnrollmentRepository.existeCursandoEnGestion(gestionId);
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

    // Marca la bandera "clases iniciadas" para la gestión (fuera de la transacción:
    // si fallara, la lectura cae al criterio derivado y sigue siendo coherente).
    try {
      await this.configuracion?.establecerValor(
        claveCursadoIniciado(gestionId),
        'true',
        { tipo: 'BOOLEAN', descripcion: `Cursado iniciado para la gestión ${gestionId}` },
        userId ?? null,
      );
    } catch (errFlag) {
      this.logger.warn('[Calificaciones] No se pudo registrar la bandera de cursado iniciado', {
        gestionId,
        error: errFlag.message,
      });
    }

    this.logger.info('[Calificaciones] Gestión académica iniciada', result);
    return result;
  }
}
