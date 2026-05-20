import {
  mapPoliticaInstitucionalResponse,
} from '../../mappers/politicaInstitucionalMapper.js';

export class GetPoliticaInstitucionalUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/CalificacionRepository.js').CalificacionRepository} deps.calificacionRepository
   * @param {import('../../../infrastructure/repositories/EvaluationConfigurationRepository.js').default} deps.evaluationConfigurationRepository
   * @param {import('../../../infrastructure/repositories/EvaluationTypeRepository.js').default} deps.evaluationTypeRepository
   * @param {Object} deps.logger
   */
  constructor({
    calificacionRepository,
    evaluationConfigurationRepository,
    evaluationTypeRepository,
    logger,
  }) {
    if (!calificacionRepository) throw new Error('calificacionRepository es requerido');
    if (!evaluationConfigurationRepository) {
      throw new Error('evaluationConfigurationRepository es requerido');
    }
    if (!evaluationTypeRepository) throw new Error('evaluationTypeRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.calificacionRepository = calificacionRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.logger = logger;
  }

  async listarTiposFinales() {
    const result = await this.evaluationTypeRepository.findAll({
      scopes: ['MATERIA_COMPLETA'],
    });
    const entities = result?.evaluationTypes ?? [];
    return entities.map((e) => ({
      codigo: e.code ?? e.codigo,
      nombre: e.name ?? e.nombre,
    }));
  }

  async execute() {
    const ctx = await this.calificacionRepository.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      const err = new Error('No hay gestión académica vigente configurada');
      err.statusCode = 404;
      throw err;
    }

    const gestion = {
      id: ctx.gestion_id,
      anio: ctx.gestion_anio,
      nombre: ctx.gestion_nombre ?? String(ctx.gestion_anio ?? ctx.gestion_id),
    };

    const tiposFinales = await this.listarTiposFinales();

    const rowActual = await this.evaluationConfigurationRepository.findActiveRowByGestionId(
      gestion.id
    );
    const politica = mapPoliticaInstitucionalResponse({
      gestion,
      row: rowActual,
      tiposFinales,
      updatedByNombre: rowActual?.updated_by_username ?? null,
    });

    let politicaGestionAnterior = null;
    const gestionAnt = await this.calificacionRepository.obtenerGestionAnteriorPorAnio(gestion.anio);
    if (gestionAnt?.id) {
      const rowAnt = await this.evaluationConfigurationRepository.findActiveRowByGestionId(
        gestionAnt.id
      );
      if (rowAnt?.id) {
        politicaGestionAnterior = mapPoliticaInstitucionalResponse({
          gestion: {
            id: gestionAnt.id,
            anio: gestionAnt.anio,
            nombre: gestionAnt.nombre ?? String(gestionAnt.anio),
          },
          row: rowAnt,
          tiposFinales,
          updatedByNombre: rowAnt.updated_by_username ?? null,
        });
      }
    }

    this.logger.info('[Calificaciones] Política institucional obtenida', {
      gestionId: gestion.id,
      configurada: politica.configurada,
      tieneAnterior: Boolean(politicaGestionAnterior),
    });

    return {
      gestionVigente: politica.gestionNombre,
      politica,
      politicaGestionAnterior,
    };
  }
}
