import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: UpdateContributionConfigurationUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Edita una configuración de aporte existente: montoBase, aporteActivo,
 * fechaInicio, fechaFin. El "activar/desactivar" se hace togglendo aporte_activo
 * (o activo) por PUT; no hay eliminación física.
 */
export class UpdateContributionConfigurationUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.contributionConfigurationRepository - Repositorio de configuraciones de aportes
   * @param {Object} params.logger
   */
  constructor({ contributionConfigurationRepository, logger }) {
    this.contributionConfigurationRepository = contributionConfigurationRepository;
    this.logger = logger;
  }

  /**
   * @param {number|string} id
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<Object>} configuración actualizada (entidad)
   */
  async execute(id, body = {}, userId = null) {
    const configId = this._parseId(id);

    const existing = await this.contributionConfigurationRepository.findById(configId);
    if (!existing) {
      throw new NotFoundError(`Configuración de aporte con ID ${configId}`);
    }

    const payload = {};

    const montoBase = body.monto_base ?? body.montoBase ?? body.baseAmount;
    if (montoBase !== undefined) {
      const baseAmount = Number(montoBase);
      if (Number.isNaN(baseAmount) || baseAmount < 0) {
        throw new ValidationError('monto_base debe ser un número mayor o igual a 0');
      }
      payload.baseAmount = baseAmount;
    }

    const contributionActive = body.aporte_activo ?? body.aporteActivo ?? body.contributionActive;
    if (contributionActive !== undefined) {
      payload.contributionActive = Boolean(contributionActive);
    }

    const fechaInicio = body.fecha_inicio ?? body.fechaInicio ?? body.startDate;
    if (fechaInicio !== undefined) {
      if (!fechaInicio) {
        throw new ValidationError('fecha_inicio no puede ser vacía');
      }
      payload.startDate = fechaInicio;
    }

    const fechaFin = body.fecha_fin ?? body.fechaFin ?? body.endDate;
    if (fechaFin !== undefined) {
      payload.endDate = fechaFin || null;
    }

    const activo = body.activo ?? body.active;
    if (activo !== undefined) {
      payload.active = Boolean(activo);
    }

    if (Object.keys(payload).length === 0) {
      throw new ValidationError('No se enviaron campos para actualizar');
    }

    const updated = await this.contributionConfigurationRepository.update(configId, payload, userId);

    this.logger?.info?.('[Pagos] Configuración de aporte actualizada', {
      id: configId,
      campos: Object.keys(payload),
    });

    return updated;
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('id de configuración de aporte inválido');
    }
    return id;
  }
}
