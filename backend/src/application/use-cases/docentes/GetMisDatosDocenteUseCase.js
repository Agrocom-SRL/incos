/**
 * Use Case: GetMisDatosDocenteUseCase
 * Módulo: Docentes (Portal del rol docente)
 *
 * Devuelve la identidad mínima del docente de la SESIÓN: `{ id, nombreCompleto }`.
 * El docente se resuelve SIEMPRE en servidor desde req.usuario.id
 * (resolveDocenteIdForUsuario), nunca desde un id del cliente (evita IDOR).
 * Lanza ForbiddenError (403) si el usuario no está vinculado a un docente.
 *
 * El frontend lo usa para redirigir al docente a SU propia ficha `/docentes/:id`
 * (gemelo de GET /estudiantes/mis-datos, pero con payload mínimo: la ficha
 * completa ya la sirve GET /docentes/:id blindado con docenteSelfOnlyGuard).
 *
 * Clean Architecture / SOLID:
 * - Application Layer: orquesta resolución + lectura mínima.
 * - Single Responsibility: solo identifica al docente propio.
 */

import { resolveDocenteIdForUsuario } from '../../utils/resolveDocenteIdForUsuario.js';

export class GetMisDatosDocenteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.teacherRepository - Repositorio de docentes (resolución por usuario)
   * @param {Object} params.userRepository - Repositorio de usuarios (fallback de referencia)
   * @param {Object} params.logger
   */
  constructor({ teacherRepository, userRepository, logger }) {
    if (!teacherRepository) throw new Error('teacherRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{ id: number, nombreCompleto: string }>}
   */
  async execute({ usuarioId }) {
    const docenteId = await resolveDocenteIdForUsuario({
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    this.logger.info('[Docentes] Mis datos: docente resuelto', { usuarioId, docenteId });

    const docente = await this.teacherRepository.findById(docenteId);
    const plain = docente?.toPlainObject?.() ?? docente ?? {};

    // Orden institucional: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
    const nombreCompleto = [plain.lastName, plain.motherLastName, plain.firstName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return { id: docenteId, nombreCompleto };
  }
}

export default GetMisDatosDocenteUseCase;
