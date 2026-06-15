import { NotFoundError } from '../../../domain/errors/index.js';

/**
 * POST /api/v1/gestiones/:id/publicar-todos
 * Publica cada paralelo_gestion en OFERTADO que cumpla pre-condiciones.
 */
export class PublicarTodosParalelosGestionUseCase {
  constructor({
    managementRepository,
    parallelManagementRepository,
    publicarParaleloGestionUseCase,
    logger,
  }) {
    this.managementRepository = managementRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.publicarParaleloGestionUseCase = publicarParaleloGestionUseCase;
    this.logger = logger;
  }

  async execute(gestionId, userId = null) {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) {
      throw new NotFoundError('Gestión');
    }

    const gestion = await this.managementRepository.findById(gId);
    if (!gestion) throw new NotFoundError('Gestión', gId);

    const candidatos = await this.parallelManagementRepository.findEnrichedOfertadoByGestionId(gId);

    const publicados = [];
    const omitidos = [];

    for (const pg of candidatos) {
      const pgId = Number(pg.id);
      const evaluacion = await this.publicarParaleloGestionUseCase.evaluarPrecondiciones(pgId);

      if (!evaluacion.puedePublicar) {
        omitidos.push({
          paralelo_gestion_id: pgId,
          paralelo_nombre: pg.paraleloNombre ?? null,
          turno: pg.turno ?? null,
          estado: pg.estado ?? null,
          fallas: evaluacion.fallas,
        });
        continue;
      }

      try {
        const resultado = await this.publicarParaleloGestionUseCase.ejecutarPublicacion(
          pgId,
          userId,
          evaluacion
        );
        publicados.push({
          paralelo_gestion_id: pgId,
          paralelo_nombre: pg.paraleloNombre ?? null,
          turno: pg.turno ?? null,
          paralelo_gestion: resultado.paralelo_gestion,
        });
      } catch (e) {
        omitidos.push({
          paralelo_gestion_id: pgId,
          paralelo_nombre: pg.paraleloNombre ?? null,
          turno: pg.turno ?? null,
          estado: pg.estado ?? null,
          fallas: e.details?.length ? e.details : [{ mensaje: e.message }],
        });
      }
    }

    this.logger.info('[Horarios] Publicar todos paralelos_gestion', {
      gestionId: gId,
      candidatos: candidatos.length,
      publicados: publicados.length,
      omitidos: omitidos.length,
    });

    return {
      gestion_id: gId,
      resumen: {
        candidatos_ofertado: candidatos.length,
        publicados: publicados.length,
        omitidos: omitidos.length,
      },
      publicados,
      omitidos,
    };
  }
}
