import { parseFiltroId } from '../../utils/validacionEntrada.js';
import { TutoriaAvanceMapper, ProyectoGradoMapper } from '../../mappers/titulacion/index.js';

/** Límite de detalle por proyecto en el reporte (suficiente para el volumen real de TIT). */
const LIMITE_DETALLE_PROYECTOS = 1000;

/**
 * Use Case: GetAvanceTutoriaCarreraUseCase
 * Módulo: Titulación (TIT), Requisito 2 — extensión 2026-07-31
 *
 * Reporte de avance de tutorías por carrera: resumen agregado (vista 179) +
 * detalle por proyecto (vista 160, reutilizando
 * `proyectoGradoListadoViewRepository.findListado` existente, ya con
 * `ultimaObservacion` desde D1 — no se duplica esa lectura). Si no llega
 * gestionId, usa la gestión vigente (mismo patrón `resolverGestion` de
 * GetPanelAcompanamientoUseCase).
 */
export class GetAvanceTutoriaCarreraUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.tutoriaAvanceViewRepository - Vista 179
   * @param {Object} params.proyectoGradoListadoViewRepository - Vista 160
   * @param {Object} params.calificacionContextoRepository - Gestión vigente
   * @param {ILogger} params.logger
   */
  constructor({
    tutoriaAvanceViewRepository,
    proyectoGradoListadoViewRepository,
    calificacionContextoRepository,
    logger,
  }) {
    this.tutoriaAvanceViewRepository = tutoriaAvanceViewRepository;
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.logger = logger;
  }

  /**
   * Resuelve la gestión efectiva del reporte (query o vigente).
   * @param {number|null} gestionIdParam
   * @returns {Promise<number|null>}
   */
  async resolverGestion(gestionIdParam = null) {
    if (gestionIdParam) {
      return Number(gestionIdParam);
    }
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    return ctx?.gestion_id != null ? Number(ctx.gestion_id) : null;
  }

  /**
   * @param {Object} [queryParams] - { gestionId, carreraId }
   * @returns {Promise<{avanceTutoriaCarrera: Object}>}
   */
  async execute(queryParams = {}) {
    const gestionId = await this.resolverGestion(
      parseFiltroId(queryParams.gestionId, 'gestionId') ?? null
    );
    const carreraId = parseFiltroId(queryParams.carreraId, 'carreraId');

    const [resumenRows, detalleResult] = await Promise.all([
      this.tutoriaAvanceViewRepository.findAvancePorCarrera({
        gestionId: gestionId ?? undefined,
        carreraId,
      }),
      this.proyectoGradoListadoViewRepository.findListado(
        { gestionId: gestionId ?? undefined, carreraId },
        1,
        LIMITE_DETALLE_PROYECTOS
      ),
    ]);

    const avanceTutoriaCarrera = {
      gestionId,
      carreraId: carreraId ?? null,
      resumenPorCarrera: TutoriaAvanceMapper.avanceCarreraRowsToPresentation(resumenRows),
      detalle: ProyectoGradoMapper.listadoRowsToPresentation(detalleResult.rows),
    };

    this.logger.info('[Titulación] Reporte de avance de tutorías por carrera generado', {
      gestionId,
      carreraId,
      carreras: avanceTutoriaCarrera.resumenPorCarrera.length,
      proyectos: avanceTutoriaCarrera.detalle.length,
    });

    return { avanceTutoriaCarrera };
  }
}
