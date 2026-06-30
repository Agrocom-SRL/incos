/**
 * Use Case: ExportMiBoletinEstudiantePdfUseCase
 * Módulo: Académico / Calificaciones (Portal del estudiante)
 *
 * Exporta el Boletín de Calificaciones del estudiante de la SESIÓN a PDF. El
 * estudiante se resuelve en servidor desde req.usuario.id (evita IDOR) y el
 * paralelo_gestion se deriva de las filas de la vista 135 del propio estudiante
 * (gestión vigente). Delega el render a ExportBoletinEstudiantePdfUseCase.
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import { resolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';

export class ExportMiBoletinEstudiantePdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.calificacionCentralizadorRepository - Lectura vista 135 (solo lectura)
   * @param {Object} params.studentRepository
   * @param {Object} params.userRepository
   * @param {Object} params.exportBoletinEstudiantePdfUseCase - Render del boletín (reuso)
   * @param {ILogger} params.logger
   */
  constructor({
    calificacionCentralizadorRepository,
    studentRepository,
    userRepository,
    exportBoletinEstudiantePdfUseCase,
    logger,
  }) {
    if (!calificacionCentralizadorRepository) {
      throw new Error('calificacionCentralizadorRepository es requerido');
    }
    if (!studentRepository) throw new Error('studentRepository es requerido');
    if (!userRepository) throw new Error('userRepository es requerido');
    if (!exportBoletinEstudiantePdfUseCase) {
      throw new Error('exportBoletinEstudiantePdfUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.calificacionCentralizadorRepository = calificacionCentralizadorRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.exportBoletinEstudiantePdfUseCase = exportBoletinEstudiantePdfUseCase;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ usuarioId }) {
    const estudianteId = await resolveEstudianteIdForUsuario({
      studentRepository: this.studentRepository,
      userRepository: this.userRepository,
      usuarioId,
    });

    const filas =
      await this.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante(
        estudianteId
      );

    if (!filas || filas.length === 0) {
      throw new NotFoundError('Boletín');
    }

    const paraleloGestionId = Number(filas[0].paralelo_gestion_id);

    this.logger.info('[Calificaciones] Mi boletín PDF: paralelo derivado', {
      usuarioId,
      estudianteId,
      paraleloGestionId,
    });

    return this.exportBoletinEstudiantePdfUseCase.execute({ paraleloGestionId, estudianteId });
  }
}

export default ExportMiBoletinEstudiantePdfUseCase;
