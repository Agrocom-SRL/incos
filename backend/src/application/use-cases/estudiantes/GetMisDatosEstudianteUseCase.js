/**
 * Use Case: GetMisDatosEstudianteUseCase
 * Módulo: Estudiantes (Portal del estudiante)
 *
 * Devuelve los datos del estudiante de la SESIÓN. El estudiante se resuelve SIEMPRE
 * en servidor desde req.usuario.id (resolveEstudianteIdForUsuario), nunca desde un id
 * del cliente (evita IDOR).
 *
 * Reutiliza GetStudentByIdUseCase (misma fuente: vista 15 + apoderados + datos
 * académicos / inscripción) pero devuelve un PAYLOAD RECORTADO: solo lo que el
 * estudiante necesita ver de sí mismo. Excluye datos administrativos (becas, acta de
 * compromiso, entregas de documentos, cuenta de acceso, transitabilidad/traspaso,
 * catálogos y flags internos).
 *
 * Clean Architecture / SOLID:
 * - Application Layer: orquesta resolución + reuso del caso de uso existente.
 * - Single Responsibility: solo arma la vista propia del estudiante.
 */

import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';

export class GetMisDatosEstudianteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.studentRepository - Repositorio de estudiantes (resolución por usuario)
   * @param {Object} params.userRepository - Repositorio de usuarios (fallback de referencia)
   * @param {Object} params.getStudentByIdUseCase - Caso de uso de ficha completa (reuso)
   * @param {ILogger} params.logger
   */
  constructor({ studentRepository, userRepository, getStudentByIdUseCase, logger }) {
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!getStudentByIdUseCase) throw new Error('getStudentByIdUseCase es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.getStudentByIdUseCase = getStudentByIdUseCase;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{ student: Object, guardians: Array, origins: Array, academicData: Object|null, inscripcion: Object|null }>}
   */
  async execute({ usuarioId }) {
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    this.logger.info('[Estudiantes] Mis datos: estudiante resuelto', {
      usuarioId,
      estudianteId,
    });

    const full = await this.getStudentByIdUseCase.execute(estudianteId);

    // Payload recortado (solo lo propio del estudiante).
    return {
      student: full.student ?? null,
      guardians: full.guardians ?? [],
      origins: full.origins ?? [],
      academicData: full.academicData ?? null,
      inscripcion: full.inscripcion ?? null,
    };
  }
}

export default GetMisDatosEstudianteUseCase;
