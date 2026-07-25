import { NotFoundError } from '../../../domain/errors/AppError.js';
import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';
import { getProyectoOrFail, assertIntegranteActivo } from './helpers/proyectoTutoriaGuards.js';
import { hoyISO } from './helpers/dictamenPdfHelpers.js';

/**
 * Use Case: ConfirmarBitacoraEstudianteUseCase (T17)
 * Módulo: Tutorías (TUT · titulación · portal del estudiante)
 *
 * Confirmación digital del estudiante sobre una entrada de bitácora
 * (equivalente a la FIRMA DEL ESTUDIANTE en la planilla).
 *
 * RBAC: acción LISTAR de bitácora + guard de PERTENENCIA en servidor
 * (decisión del orquestador): el estudiante de la SESIÓN debe ser integrante
 * ACTIVO del proyecto. El estudiante se resuelve SIEMPRE con
 * resolveEstudianteIdForUsuario, nunca desde el request (anti-IDOR).
 */
export class ConfirmarBitacoraEstudianteUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.tutoriaBitacoraRepository
   * @param {Object} params.tutoriaIntegranteRepository
   * @param {Object} params.studentRepository
   * @param {Object} params.userRepository
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    tutoriaBitacoraRepository,
    tutoriaIntegranteRepository,
    studentRepository,
    userRepository,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.tutoriaBitacoraRepository = tutoriaBitacoraRepository;
    this.tutoriaIntegranteRepository = tutoriaIntegranteRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, proyectoGradoId: number, entradaId: number }} input
   * @returns {Promise<{bitacoraEntrada: Object}>}
   */
  async execute({ usuarioId, proyectoGradoId, entradaId } = {}) {
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);
    await assertIntegranteActivo({
      tutoriaIntegranteRepository: this.tutoriaIntegranteRepository,
      proyectoGradoId,
      estudianteId,
    });

    const entrada = await this.tutoriaBitacoraRepository.findById(entradaId);
    if (!entrada || Number(entrada.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(
        `entrada de bitácora con ID ${entradaId} del proyecto ${proyectoGradoId}`
      );
    }

    const bitacoraEntrada = await this.tutoriaBitacoraRepository.update(entradaId, {
      confirmadoEstudiante: true,
      fechaConfirmacion: hoyISO(),
    });

    this.logger.info('[Tutorías] Entrada de bitácora confirmada por estudiante', {
      proyectoGradoId,
      entradaId,
      estudianteId,
    });

    return { bitacoraEntrada };
  }
}
