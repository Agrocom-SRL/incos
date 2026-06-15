import {
  mapPoliticaFromRequestBody,
  mapPoliticaInstitucionalResponse,
} from '../../mappers/politicaInstitucionalMapper.js';
import { buildPoliticaValorDocumento } from '../../utils/politicaInstitucionalPayload.js';

export class SavePoliticaInstitucionalUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/CalificacionRepository.js').CalificacionRepository} deps.calificacionRepository
   * @param {import('../../../infrastructure/repositories/EvaluationConfigurationRepository.js').default} deps.evaluationConfigurationRepository
   * @param {Object} deps.logger
   */
  constructor({
    calificacionContextoRepository,
    evaluationConfigurationRepository,
    logger,
  }) {
    if (!calificacionContextoRepository) {
      throw new Error('calificacionContextoRepository es requerido');
    }
    if (!evaluationConfigurationRepository) {
      throw new Error('evaluationConfigurationRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.logger = logger;
  }

  async execute(body, userId = null) {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      const err = new Error('No hay gestión académica vigente configurada');
      err.statusCode = 404;
      throw err;
    }

    const gestionId = ctx.gestion_id;
    const mapped = mapPoliticaFromRequestBody(body);

    const sumaCuota = mapped.cuotaTeorico + mapped.cuotaPractico;
    if (Math.abs(sumaCuota - 100) > 0.01) {
      const err = new Error('La ponderación teórico + práctico debe sumar 100%');
      err.statusCode = 400;
      throw err;
    }

    const sumaBimestres = mapped.pesosBimestres.reduce((acc, p) => acc + p, 0);
    if (Math.abs(sumaBimestres - 100) > 0.01) {
      const err = new Error('La ponderación de los 4 bimestres debe sumar 100%');
      err.statusCode = 400;
      throw err;
    }

    const documento = buildPoliticaValorDocumento(mapped);
    await this.evaluationConfigurationRepository.upsertPoliticaVigente(
      gestionId,
      documento,
      userId
    );

    const row = await this.evaluationConfigurationRepository.findActiveRowByGestionId(gestionId);
    const gestion = {
      id: gestionId,
      anio: ctx.gestion_anio,
      nombre: ctx.gestion_nombre ?? String(ctx.gestion_anio ?? gestionId),
    };

    const politica = mapPoliticaInstitucionalResponse({
      gestion,
      row,
      updatedByNombre: row?.updated_by_username ?? null,
    });

    this.logger.info('[Calificaciones] Política institucional guardada', { gestionId, userId });

    return { politica };
  }
}
