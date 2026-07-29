import { resolveDocenteIdForUsuario } from '../../utils/resolveDocenteIdForUsuario.js';
import { PasantiaMapper } from '../../mappers/pasantias/index.js';

/**
 * Use Case: ListMisPasantiasSupervisadasUseCase (P18)
 * Módulo: Pasantías (TUT · práctica laboral · portal del docente)
 *
 * Bandeja del supervisor: trámites donde el docente de la SESIÓN es el
 * supervisor vigente (vista 167 con WHERE docente_supervisor_id = ?; no hay
 * vista aparte).
 *
 * El docente se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveDocenteIdForUsuario); NUNCA se acepta docenteId del cliente (IDOR).
 */
export class ListMisPasantiasSupervisadasUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaViewRepository - Vista 167
   * @param {Object} params.teacherRepository - Resolución docente por usuario
   * @param {Object} params.userRepository - Fallback referencia polimórfica
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaViewRepository, teacherRepository, userRepository, logger }) {
    this.pasantiaViewRepository = pasantiaViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{misPasantias: Array, total: number}>}
   */
  async execute({ usuarioId } = {}) {
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const { rows, total } = await this.pasantiaViewRepository.findListado(
      { docenteSupervisorId: docenteId },
      1,
      10000
    );

    this.logger.info('[Pasantías] Mis pasantías supervisadas listadas', {
      usuarioId,
      docenteId,
      total,
    });

    return {
      misPasantias: PasantiaMapper.listadoRowsToPresentation(rows),
      total,
    };
  }
}
