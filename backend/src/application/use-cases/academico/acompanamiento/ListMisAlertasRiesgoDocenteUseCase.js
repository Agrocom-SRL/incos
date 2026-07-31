import { resolveDocenteIdForUsuario } from '../../../utils/resolveDocenteIdForUsuario.js';
import { RiesgoAcademicoMapper } from '../../../mappers/academico/index.js';

/**
 * Use Case: ListMisAlertasRiesgoDocenteUseCase (A2)
 * Módulo: Académico (ACA · acompañamiento · portal del docente)
 *
 * "Mis alumnos en riesgo": alertas de la vista 156 acotadas a los cursos
 * VIGENTES del docente de la SESIÓN (subselect por asignaciones_docentes).
 *
 * El docente se resuelve SIEMPRE en servidor (resolveDocenteIdForUsuario);
 * NUNCA se acepta docenteId del cliente (anti-IDOR).
 */
export class ListMisAlertasRiesgoDocenteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.riesgoAcademicoViewRepository - Vista 156
   * @param {Object} params.teacherRepository
   * @param {Object} params.userRepository
   * @param {ILogger} params.logger
   */
  constructor({ riesgoAcademicoViewRepository, teacherRepository, userRepository, logger }) {
    this.riesgoAcademicoViewRepository = riesgoAcademicoViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, queryParams?: Object }} input
   * @returns {Promise<{misAlumnosEnRiesgo: Array, total: number}>}
   */
  async execute({ usuarioId, queryParams = {} } = {}) {
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const { rows, total } = await this.riesgoAcademicoViewRepository.findAlertas(
      {
        docenteId,
        search: queryParams.search || undefined,
        gestionId: queryParams.gestionId ? Number(queryParams.gestionId) : undefined,
        soloEnRiesgo: true,
      },
      1,
      10000
    );

    this.logger.info('[Acompañamiento] Mis alumnos en riesgo listados', {
      usuarioId,
      docenteId,
      total,
    });

    return {
      misAlumnosEnRiesgo: RiesgoAcademicoMapper.alertaRowsToPresentation(rows),
      total,
    };
  }
}
