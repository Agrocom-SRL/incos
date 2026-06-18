import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_LICENCIAS } from '../../../../domain/constants/licencias.constants.js';
import { toLicenciaDTO } from './licenciaDTO.js';

/** Estados desde los que se puede cancelar una licencia. */
const CANCELABLES = [ESTADOS_LICENCIAS.PENDIENTE, ESTADOS_LICENCIAS.APROBADA];

/**
 * Cancela una licencia (estado → CANCELADA). Solo desde PENDIENTE o APROBADA;
 * RECHAZADA o CANCELADA no se pueden cancelar.
 * Permiso: academico.asistencia.licencia.crear · ELIMINAR.
 */
export class CancelarLicenciaUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id
   * @returns {Promise<{licencia: Object}>}
   */
  async execute({ usuarioId, id }) {
    const licencia = await this.licenseRepository.findById(id);
    if (!licencia) {
      throw new NotFoundError('Licencia');
    }
    if (!CANCELABLES.includes(licencia.state)) {
      throw new ValidationError(
        'Solo se pueden cancelar licencias en estado PENDIENTE o APROBADA',
      );
    }

    await this.licenseRepository.update(id, { state: ESTADOS_LICENCIAS.CANCELADA }, usuarioId);

    this.logger?.info('[Licencias] Licencia cancelada', { id, estadoPrevio: licencia.state });

    const row = await this.licenseRepository.findByIdWithStudentName(id);
    return { licencia: toLicenciaDTO(row) };
  }
}

export default CancelarLicenciaUseCase;
