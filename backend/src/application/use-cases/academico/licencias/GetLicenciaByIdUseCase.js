import { NotFoundError } from '../../../../domain/errors/AppError.js';
import { toLicenciaDTO } from './licenciaDTO.js';

/**
 * Detalle de una licencia estudiantil.
 * Permiso: academico.asistencia.licencia.ver · DETALLE.
 */
export class GetLicenciaByIdUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.id
   * @returns {Promise<{licencia: Object}>}
   */
  async execute({ id }) {
    const row = await this.licenseRepository.findByIdWithStudentName(id);
    if (!row) {
      throw new NotFoundError('Licencia');
    }
    return { licencia: toLicenciaDTO(row) };
  }
}

export default GetLicenciaByIdUseCase;
