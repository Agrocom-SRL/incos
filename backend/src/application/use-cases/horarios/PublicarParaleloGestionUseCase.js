import { NotFoundError, UnprocessableEntityError } from '../../../domain/errors/index.js';
import { ESTADOS_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';
import { entityToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

export class PublicarParaleloGestionUseCase {
  constructor({
    parallelManagementRepository,
    getParaleloGestionGrillaHorarioUseCase,
    getParaleloGestionCoberturaDocenteUseCase,
    getDocenteCargaGestionUseCase,
    teacherAssignmentRepository,
    logger,
  }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.getParaleloGestionGrillaHorarioUseCase = getParaleloGestionGrillaHorarioUseCase;
    this.getParaleloGestionCoberturaDocenteUseCase = getParaleloGestionCoberturaDocenteUseCase;
    this.getDocenteCargaGestionUseCase = getDocenteCargaGestionUseCase;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.logger = logger;
  }

  /**
   * @returns {Promise<{ puedePublicar: boolean, fallas: Array, gestionId: number, paraleloGestionId: number }>}
   */
  async evaluarPrecondiciones(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    const pg = await this.parallelManagementRepository.findEnrichedById(pgId);
    if (!pg) throw new NotFoundError('Paralelo en gestión', pgId);

    const estado = String(pg.estado || '').toUpperCase();
    const fallas = [];

    if (estado !== ESTADOS_PARALELO_GESTION.OFERTADO) {
      fallas.push({
        condicion: 'estado',
        mensaje: `Solo se puede publicar desde OFERTADO (actual: ${estado || 'desconocido'})`,
      });
      return { puedePublicar: false, fallas, gestionId: Number(pg.gestionId), paraleloGestionId: pgId };
    }

    const grilla = await this.getParaleloGestionGrillaHorarioUseCase.execute(pgId);
    if (!grilla.cobertura?.completa) {
      fallas.push({ condicion: 'cobertura', mensaje: 'Faltan bloques por asignación docente' });
    }
    if (Array.isArray(grilla.conflictos) && grilla.conflictos.length > 0) {
      fallas.push({
        condicion: 'conflictos',
        mensaje: `Hay ${grilla.conflictos.length} conflicto(s) de horario`,
      });
    }

    const coberturaDoc = await this.getParaleloGestionCoberturaDocenteUseCase.execute(pgId);
    const sinDocente =
      Number(coberturaDoc.cursos_total ?? 0) -
      Number(coberturaDoc.cursos_con_docente ?? 0);
    if (sinDocente > 0) {
      fallas.push({
        condicion: 'docentes',
        mensaje: `${sinDocente} curso(s) sin docente asignado`,
      });
    }

    const gestionId = Number(pg.gestionId);
    const { rows: asignaciones } = await this.teacherAssignmentRepository.findEnriched(
      { parallelManagementId: pgId, vigente: true },
      1,
      500
    );
    const docenteIds = [
      ...new Set(
        (asignaciones || [])
          .map((a) => Number(a.docente_id))
          .filter((n) => Number.isFinite(n) && n > 0)
      ),
    ];

    for (const docenteId of docenteIds) {
      const carga = await this.getDocenteCargaGestionUseCase.execute({
        docenteId,
        gestionId,
      });
      if (carga.sobrecarga) {
        fallas.push({
          condicion: 'sobrecarga_docente',
          mensaje: `Docente #${docenteId} excede carga máxima en la gestión`,
          docente_id: docenteId,
        });
      }
    }

    return {
      puedePublicar: fallas.length === 0,
      fallas,
      gestionId,
      paraleloGestionId: pgId,
    };
  }

  /**
   * @param {Object} [evaluacion] — resultado previo de evaluarPrecondiciones
   */
  async ejecutarPublicacion(paraleloGestionId, userId = null, evaluacion = null) {
    const evalResult =
      evaluacion ?? (await this.evaluarPrecondiciones(paraleloGestionId));

    if (!evalResult.puedePublicar) {
      throw new UnprocessableEntityError(
        'No se cumplen las pre-condiciones de publicación',
        evalResult.fallas
      );
    }

    const updated = await this.parallelManagementRepository.update(
      evalResult.paraleloGestionId,
      { state: ESTADOS_PARALELO_GESTION.PUBLICADO },
      userId
    );

    this.logger.info('[Horarios] Paralelo_gestion publicado', {
      paraleloGestionId: evalResult.paraleloGestionId,
    });

    return {
      paralelo_gestion: entityToPresentation(updated),
      publicado: true,
    };
  }

  async execute(paraleloGestionId, userId = null) {
    return this.ejecutarPublicacion(paraleloGestionId, userId);
  }
}
