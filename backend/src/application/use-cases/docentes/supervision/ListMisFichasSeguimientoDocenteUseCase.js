import { resolveDocenteIdForUsuario } from '../../../utils/resolveDocenteIdForUsuario.js';
import { FichaSeguimientoMapper } from '../../../mappers/docentes/FichaSeguimientoMapper.js';

/**
 * Use Case: ListMisFichasSeguimientoDocenteUseCase (S5)
 * Módulo: Docentes (DOC · supervisión docente · portal del docente)
 *
 * Fichas de seguimiento realizadas sobre los cursos del docente de la SESIÓN
 * (vista 174 con WHERE docente_id = ?; no hay vista aparte).
 *
 * El docente se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveDocenteIdForUsuario, 403 si el usuario no está vinculado a un
 * docente); NUNCA se acepta docenteId del cliente (anti-IDOR).
 */
export class ListMisFichasSeguimientoDocenteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.fichaSeguimientoListadoViewRepository - Vista 174
   * @param {Object} params.teacherRepository - Resolución docente por usuario
   * @param {Object} params.userRepository - Fallback referencia polimórfica
   * @param {ILogger} params.logger
   */
  constructor({
    fichaSeguimientoListadoViewRepository,
    teacherRepository,
    userRepository,
    logger,
  }) {
    this.fichaSeguimientoListadoViewRepository = fichaSeguimientoListadoViewRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{fichasSeguimiento: Array, total: number}>}
   */
  async execute({ usuarioId } = {}) {
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const { rows, total } = await this.fichaSeguimientoListadoViewRepository.findListado(
      { docenteId },
      1,
      10000
    );

    this.logger.info('[Supervisión docente] Mis fichas listadas', {
      usuarioId,
      docenteId,
      total,
    });

    return {
      fichasSeguimiento: FichaSeguimientoMapper.listadoRowsToPresentation(rows),
      total,
    };
  }
}
