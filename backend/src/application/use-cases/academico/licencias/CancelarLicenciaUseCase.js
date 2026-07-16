import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../../../../domain/errors/AppError.js';
import { ESTADOS_LICENCIAS } from '../../../../domain/constants/licencias.constants.js';
import { toLicenciaDTO } from './licenciaDTO.js';

/** Estados desde los que se puede cancelar una licencia. */
const CANCELABLES = [ESTADOS_LICENCIAS.PENDIENTE, ESTADOS_LICENCIAS.APROBADA];

/**
 * Cancela una licencia (estado → CANCELADA). Solo desde PENDIENTE o APROBADA;
 * RECHAZADA o CANCELADA no se pueden cancelar.
 * Permiso: academico.asistencia.licencia.crear · ELIMINAR.
 *
 * Alcance por rol (2026-07-03): el rol DOCENTE solo cancela SUS propias solicitudes
 * (created_by = usuario de la sesión) y en estado PENDIENTE (403 si no); staff
 * (REC/DIRA/SECA) puede cancelar PENDIENTE o APROBADA sin restricción de autoría.
 */
export class CancelarLicenciaUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {string} [params.rolCodigo] - Rol del usuario de la sesión (req.usuario.rolCodigo)
   * @param {number} params.id
   * @param {string} [params.observacionesDecision] - Motivo de la cancelación (campo único).
   * @returns {Promise<{licencia: Object}>}
   */
  async execute({ usuarioId, rolCodigo, id, observacionesDecision }) {
    const licencia = await this.licenseRepository.findById(id);
    if (!licencia) {
      throw new NotFoundError('Licencia');
    }

    // Alcance DOCENTE: solo sus propias solicitudes y solo mientras están PENDIENTES
    // (una APROBADA ya es acto administrativo: la cancela staff).
    if (rolCodigo === 'DOCENTE') {
      if (Number(licencia.createdBy) !== Number(usuarioId)) {
        throw new ForbiddenError('Solo puede cancelar las licencias que usted solicitó.');
      }
      if (licencia.state !== ESTADOS_LICENCIAS.PENDIENTE) {
        throw new ForbiddenError(
          'Solo puede cancelar sus solicitudes mientras están PENDIENTES.',
        );
      }
    }

    if (!CANCELABLES.includes(licencia.state)) {
      throw new ValidationError(
        'Solo se pueden cancelar licencias en estado PENDIENTE o APROBADA',
      );
    }

    // Campo único: si llega observación, registra el motivo de la cancelación; si no
    // (p. ej. cancelar desde la fila), conserva la observación previa.
    const updateData = { state: ESTADOS_LICENCIAS.CANCELADA };
    if (observacionesDecision !== undefined) {
      updateData.decisionObservations = String(observacionesDecision ?? '').trim() || null;
    }

    await this.licenseRepository.update(id, updateData, usuarioId);

    this.logger?.info('[Licencias] Licencia cancelada', { id, estadoPrevio: licencia.state });

    const row = await this.licenseRepository.findByIdWithStudentName(id);
    return { licencia: toLicenciaDTO(row) };
  }
}

export default CancelarLicenciaUseCase;
