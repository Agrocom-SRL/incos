import { ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: CreateContributionConfigurationUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Crea una configuración de aporte académico. Si no se envía gestionId, se usa
 * la gestión vigente del sistema (managementRepository.findBy({ vigente: true })),
 * igual que en los reportes y el registro de aportes.
 */
export class CreateContributionConfigurationUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.contributionConfigurationRepository - Repositorio de configuraciones de aportes
   * @param {Object} params.managementRepository - Repositorio de gestiones académicas
   * @param {Object} params.logger
   */
  constructor({ contributionConfigurationRepository, managementRepository, logger }) {
    this.contributionConfigurationRepository = contributionConfigurationRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body - Datos (snake_case desde el frontend o camelCase)
   * @param {number|null} userId
   * @returns {Promise<Object>} configuración creada (entidad)
   */
  async execute(body = {}, userId = null) {
    const montoBase = body.monto_base ?? body.montoBase ?? body.baseAmount;
    if (montoBase === undefined || montoBase === null || montoBase === '') {
      throw new ValidationError('monto_base es requerido');
    }
    const baseAmount = Number(montoBase);
    if (Number.isNaN(baseAmount) || baseAmount < 0) {
      throw new ValidationError('monto_base debe ser un número mayor o igual a 0');
    }

    const fechaInicio = body.fecha_inicio ?? body.fechaInicio ?? body.startDate;
    if (!fechaInicio) {
      throw new ValidationError('fecha_inicio es requerida');
    }

    let managementId = body.gestion_id ?? body.gestionId ?? body.managementId ?? null;
    if (managementId === null || managementId === undefined || managementId === '') {
      const management = await this._getCurrentManagement();
      managementId = management.id ?? management.toPlainObject?.().id ?? null;
    } else {
      managementId = Number(managementId);
    }

    const contributionActive = body.aporte_activo ?? body.aporteActivo ?? body.contributionActive;
    const fechaFin = body.fecha_fin ?? body.fechaFin ?? body.endDate ?? null;

    const created = await this.contributionConfigurationRepository.create(
      {
        managementId,
        baseAmount,
        contributionActive: contributionActive !== undefined ? Boolean(contributionActive) : true,
        startDate: fechaInicio,
        endDate: fechaFin || null,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger?.info?.('[Pagos] Configuración de aporte creada', { id: created.id, managementId });
    return created;
  }

  async _getCurrentManagement() {
    const management = await this.managementRepository.findBy({ vigente: true, activo: true });
    if (!management) {
      throw new ValidationError('No hay una gestión vigente configurada en el sistema');
    }
    return management;
  }
}
