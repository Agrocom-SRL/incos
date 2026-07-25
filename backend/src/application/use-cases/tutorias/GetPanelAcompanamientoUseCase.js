import { RiesgoAcademicoMapper, SesionReforzamientoMapper } from '../../mappers/tutorias/index.js';

/** Tamaño del top de casos críticos (filas de la vista 156 en riesgo). */
const TOP_CASOS_CRITICOS = 20;

/**
 * Use Case: GetPanelAcompanamientoUseCase (A10)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Panel de acompañamiento pedagógico: agregados de riesgo por carrera (157),
 * materias críticas (158), resumen mensual de sesiones (162) y top de casos
 * críticos (156). Si no llega gestionId, usa la gestión vigente (contexto).
 */
export class GetPanelAcompanamientoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.riesgoAcademicoViewRepository - Vistas 156/157/158
   * @param {Object} params.acompanamientoSesionViewRepository - Vista 162
   * @param {Object} params.calificacionContextoRepository - Gestión vigente
   * @param {ILogger} params.logger
   */
  constructor({
    riesgoAcademicoViewRepository,
    acompanamientoSesionViewRepository,
    calificacionContextoRepository,
    logger,
  }) {
    this.riesgoAcademicoViewRepository = riesgoAcademicoViewRepository;
    this.acompanamientoSesionViewRepository = acompanamientoSesionViewRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.logger = logger;
  }

  /**
   * Resuelve la gestión efectiva del panel (query o vigente).
   * @param {number|null} gestionIdParam
   * @returns {Promise<{gestionId: number|null, gestionAnio: number|null, gestionNombre: string|null}>}
   */
  async resolverGestion(gestionIdParam = null) {
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (gestionIdParam) {
      const esVigente = ctx?.gestion_id != null && Number(ctx.gestion_id) === Number(gestionIdParam);
      return {
        gestionId: Number(gestionIdParam),
        gestionAnio: esVigente && ctx?.gestion_anio != null ? Number(ctx.gestion_anio) : null,
        gestionNombre: esVigente ? (ctx?.gestion_nombre ?? null) : null,
      };
    }
    return {
      gestionId: ctx?.gestion_id != null ? Number(ctx.gestion_id) : null,
      gestionAnio: ctx?.gestion_anio != null ? Number(ctx.gestion_anio) : null,
      gestionNombre: ctx?.gestion_nombre ?? null,
    };
  }

  /**
   * @param {Object} [queryParams] - { gestionId }
   * @returns {Promise<{panelAcompanamiento: Object}>}
   */
  async execute(queryParams = {}) {
    const gestion = await this.resolverGestion(
      queryParams.gestionId ? Number(queryParams.gestionId) : null
    );

    const [riesgoCarreraRows, materiaRows, sesionesRows, criticosResult] = await Promise.all([
      this.riesgoAcademicoViewRepository.findResumenCarrera(gestion.gestionId),
      this.riesgoAcademicoViewRepository.findReprobacionMateria(gestion.gestionId),
      this.acompanamientoSesionViewRepository.findResumenMensual(gestion.gestionId),
      this.riesgoAcademicoViewRepository.findAlertas(
        { gestionId: gestion.gestionId ?? undefined, soloEnRiesgo: true },
        1,
        TOP_CASOS_CRITICOS
      ),
    ]);

    const riesgoPorCarrera = RiesgoAcademicoMapper.riesgoCarreraRowsToPresentation(riesgoCarreraRows);

    const panelAcompanamiento = {
      gestion,
      totales: {
        totalEstudiantes: riesgoPorCarrera.reduce((acc, fila) => acc + fila.totalEstudiantes, 0),
        estudiantesEnRiesgo: riesgoPorCarrera.reduce(
          (acc, fila) => acc + fila.estudiantesEnRiesgo,
          0
        ),
        totalMatriculasEnRiesgo: riesgoPorCarrera.reduce(
          (acc, fila) => acc + fila.matriculasEnRiesgo,
          0
        ),
        totalCasosCriticos: criticosResult.total,
      },
      riesgoPorCarrera,
      materiasCriticas: RiesgoAcademicoMapper.reprobacionMateriaRowsToPresentation(materiaRows),
      sesionesResumen: SesionReforzamientoMapper.resumenRowsToPresentation(sesionesRows),
      casosCriticos: RiesgoAcademicoMapper.alertaRowsToPresentation(criticosResult.rows),
    };

    this.logger.info('[Tutorías] Panel de acompañamiento generado', {
      gestionId: gestion.gestionId,
      carreras: panelAcompanamiento.riesgoPorCarrera.length,
      materias: panelAcompanamiento.materiasCriticas.length,
    });

    return { panelAcompanamiento };
  }
}
