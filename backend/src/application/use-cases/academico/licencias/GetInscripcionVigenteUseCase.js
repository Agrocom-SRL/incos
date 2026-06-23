import { ValidationError } from '../../../../domain/errors/AppError.js';

/**
 * Resuelve la inscripción vigente de un estudiante para precargar la solicitud
 * de licencia desde el buscador de estudiantes.
 * Permiso: academico.asistencia.licencia.crear · CREAR (apoyo al formulario de solicitar).
 */
export class GetInscripcionVigenteUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.estudianteId
   * @returns {Promise<{inscripcion: Object|null}>}
   */
  async execute({ estudianteId } = {}) {
    if (!estudianteId) {
      throw new ValidationError('El estudiante es obligatorio');
    }
    const inscripcion =
      await this.licenseRepository.findInscripcionVigenteByEstudiante(estudianteId);
    return { inscripcion };
  }
}

export default GetInscripcionVigenteUseCase;
