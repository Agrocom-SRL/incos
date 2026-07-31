import { resolveDocenteIdForUsuario } from '../../utils/resolveDocenteIdForUsuario.js';
import { ProyectoGradoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: ListMisTutoradosUseCase (T3)
 * Módulo: Tutorías (TUT · titulación · portal del docente)
 *
 * Bandeja del tutor: proyectos de grado donde el docente de la SESIÓN es el
 * tutor vigente (vista 160 con WHERE tutor_id = ?; no hay vista aparte).
 *
 * El docente se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveDocenteIdForUsuario); NUNCA se acepta docenteId del cliente (IDOR).
 */
export class ListMisTutoradosUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoListadoViewRepository - Vista 160
   * @param {Object} params.teacherRepository - Resolución docente por usuario
   * @param {Object} params.userRepository - Fallback referencia polimórfica
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoListadoViewRepository, teacherRepository, userRepository, logger }) {
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{misTutorados: Array, total: number}>}
   */
  async execute({ usuarioId } = {}) {
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const { rows, total } = await this.proyectoGradoListadoViewRepository.findListado(
      { tutorId: docenteId },
      1,
      10000
    );

    this.logger.info('[Tutorías] Mis tutorados listados', { usuarioId, docenteId, total });

    return {
      misTutorados: ProyectoGradoMapper.listadoRowsToPresentation(rows),
      total,
    };
  }
}
