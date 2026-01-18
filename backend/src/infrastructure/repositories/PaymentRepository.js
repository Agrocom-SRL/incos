import { PagoArancel as PagoArancelModel } from '../database/models/pago_arancel.js';
import { BaseRepository } from './BaseRepository.js';
import { PaymentMapper } from '../mappers/PaymentMapper.js';

/**
 * Implementación del repositorio de pagos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PaymentMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PaymentMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de repositorio de pagos
 * - Usa PaymentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 */
export class PaymentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de pagos
   * @returns {Object} Modelo PagoArancel
   */
  getModel() {
    return PagoArancelModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a PaymentMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Payment|null} Entidad de dominio
   */
  toEntity(model) {
    return PaymentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Payment
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante
   *   - enrollmentId: ID de la inscripción
   *   - managementId: ID de la gestión académica
   *   - receiptNumber: Número de recibo
   *   - state: Estado del pago (PENDIENTE, PAGADO, PARCIAL, VENCIDO, ANULADO)
   *   - paymentMethod: Método de pago
   *   - validated: Si está validado (boolean)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.enrollmentId) {
      where.inscripcionId = filters.enrollmentId;
    }
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.receiptNumber) {
      where.numeroRecibo = filters.receiptNumber;
    }
    if (filters.state) {
      where.estado = filters.state;
    }
    if (filters.paymentMethod) {
      where.metodoPago = filters.paymentMethod;
    }
    if (filters.validated !== undefined) {
      where.validado = filters.validated;
    }
    if (filters.paymentDate) {
      where.fechaPago = filters.paymentDate;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['numeroRecibo', 'numeroTransaccion', 'concepto', 'observaciones'];
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Ordena por fecha de pago descendente para ver los pagos más recientes primero
   * 
   * @returns {Array} Array de arrays [campo, dirección] para Sequelize order
   */
  getDefaultSort() {
    return [['fechaPago', 'DESC'], ['id', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a PaymentMapper
   * 
   * @param {Payment|Object} data - Entidad Payment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PaymentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PaymentMapper
   * 
   * @param {Payment|Object} data - Entidad Payment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PaymentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'payments';
  }
}
