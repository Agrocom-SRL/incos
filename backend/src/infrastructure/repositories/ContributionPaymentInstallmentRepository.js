import { IContributionPaymentInstallmentRepository } from '../../domain/interfaces/repositories/IContributionPaymentInstallmentRepository.js';
import { PagoCuotas as PagoCuotasModel } from '../database/models/pago_cuotas.js';
import { BaseRepository } from './BaseRepository.js';
import { ContributionPaymentInstallmentMapper } from '../mappers/ContributionPaymentInstallmentMapper.js';

/**
 * Implementación del repositorio de cuotas de aporte (pago_cuotas).
 * Utiliza el patrón Template Method heredando de BaseRepository.
 *
 * Cada registro es un abono contra una cabecera de aporte (pago_aporte).
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ContributionPaymentInstallmentMapper
 *
 * @implements {IContributionPaymentInstallmentRepository}
 */
export class ContributionPaymentInstallmentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de cuotas de aporte (pago_cuotas).
   * @returns {Object} Modelo PagoCuotas
   */
  getModel() {
    return PagoCuotasModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio.
   * Delega la responsabilidad de mapeo a ContributionPaymentInstallmentMapper.
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {ContributionPaymentInstallment|null} Entidad de dominio
   */
  toEntity(model) {
    return ContributionPaymentInstallmentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos.
   * Maneja todos los criterios de búsqueda de las cuotas de aporte.
   *
   * Ejemplos de uso:
   * - findAll({ contributionPaymentId: 10 }) → Cuotas de una cabecera
   * - findBy({ receiptNumber: 'REC-2025-001' }) → Cuota por número de recibo
   * - findAll({ contributionPaymentId: 10, paymentDate: '2025-01-15' }) → Cuotas por cabecera y fecha
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - contributionPaymentId: ID de la cabecera de aporte (pago_aporte_id)
   *   - receiptNumber: Número de recibo único
   *   - paymentDate: Fecha del pago
   *   - amount: Monto del pago
   *   - paymentMethodId: ID del método de pago
   *   - paymentAccountId: ID de la cuenta de pago
   *   - transactionNumber: Número de transacción
   *   - comprobanteCode: Código del comprobante
   *   - description: Descripción u observación
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.contributionPaymentId !== undefined) {
      where.pagoAporteId = filters.contributionPaymentId;
    }
    if (filters.receiptNumber !== undefined) {
      where.numeroRecibo = filters.receiptNumber;
    }
    if (filters.paymentDate !== undefined) {
      where.fechaPago = filters.paymentDate;
    }
    if (filters.amount !== undefined) {
      where.monto = filters.amount;
    }
    if (filters.paymentMethodId !== undefined) {
      where.metodoPagoId = filters.paymentMethodId;
    }
    if (filters.paymentAccountId !== undefined) {
      where.cuentaPagoId = filters.paymentAccountId;
    }
    if (filters.transactionNumber !== undefined) {
      where.numeroTransaccion = filters.transactionNumber;
    }
    if (filters.comprobanteCode !== undefined) {
      where.codigoComprobante = filters.comprobanteCode;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto en search().
   * Campos más representativos: número de recibo, transacción, comprobante y descripción.
   *
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['numeroRecibo', 'numeroTransaccion', 'codigoComprobante', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto para las consultas.
   * Delega al BaseRepository (id ASC).
   *
   * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository
   */
  getDefaultSort() {
    return [];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación).
   *
   * @param {ContributionPaymentInstallment|Object} data - Entidad o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ContributionPaymentInstallmentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize.
   *
   * @param {ContributionPaymentInstallment|Object} data - Entidad o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ContributionPaymentInstallmentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON.
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'contributionPaymentInstallments';
  }
}
