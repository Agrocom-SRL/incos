import fs from 'fs';
import { NotFoundError } from '../../../domain/errors/AppError.js';
import { tryResolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';
import { getProyectoOrFail, assertIntegranteActivo } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: DownloadAvanceArchivoUseCase (T21)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Resuelve la ruta del archivo de un avance para su descarga autenticada
 * (res.download en el controller; NUNCA URL estática /uploads).
 *
 * Guard: si el usuario de la SESIÓN está vinculado a un estudiante, debe ser
 * integrante ACTIVO del proyecto.
 */
export class DownloadAvanceArchivoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.tutoriaAvanceRepository
   * @param {Object} params.tutoriaIntegranteRepository
   * @param {Object} params.studentRepository
   * @param {Object} params.userRepository
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    tutoriaAvanceRepository,
    tutoriaIntegranteRepository,
    studentRepository,
    userRepository,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.tutoriaAvanceRepository = tutoriaAvanceRepository;
    this.tutoriaIntegranteRepository = tutoriaIntegranteRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * @param {{ proyectoGradoId: number, avanceId: number, usuarioId: number }} input
   * @returns {Promise<{absolutePath: string, fileName: string}>}
   */
  async execute({ proyectoGradoId, avanceId, usuarioId } = {}) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const avance = await this.tutoriaAvanceRepository.findById(avanceId);
    if (!avance || Number(avance.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(`avance con ID ${avanceId} del proyecto ${proyectoGradoId}`);
    }

    const estudianteId = await tryResolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });
    if (estudianteId !== null) {
      await assertIntegranteActivo({
        tutoriaIntegranteRepository: this.tutoriaIntegranteRepository,
        proyectoGradoId,
        estudianteId,
      });
    }

    if (!avance.rutaArchivo || !fs.existsSync(avance.rutaArchivo)) {
      throw new NotFoundError(`archivo del avance ${avanceId}`);
    }

    this.logger.info('[Tutorías] Descarga de archivo de avance autorizada', {
      proyectoGradoId,
      avanceId,
      usuarioId,
    });

    return { absolutePath: avance.rutaArchivo, fileName: avance.nombreArchivo };
  }
}
