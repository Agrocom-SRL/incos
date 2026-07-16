import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { PagoCapacitacion as PagoCapacitacionModel } from '../database/models/pago_capacitacion.js';

/**
 * Repositorio CRUD de pagos de capacitación (`capacitacion_pagos`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. `numero_recibo` lo genera el use case (ID a 6 dígitos, mismo
 * patrón que pagos de aportes); aquí solo persistencia y lecturas.
 *
 * @implements {IPagoCapacitacionRepository}
 */
export class PagoCapacitacionRepository extends BaseRepository {
  getModel() {
    return PagoCapacitacionModel;
  }

  /**
   * Convierte el modelo Sequelize a objeto de dominio (claves del contrato).
   * @param {Object|null} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      capacitacionInscritoId: v.capacitacionInscritoId ?? null,
      metodoPagoId: v.metodoPagoId ?? null,
      cuentaPagoId: v.cuentaPagoId ?? null,
      monto: v.monto !== undefined && v.monto !== null ? Number(v.monto) : null,
      fechaPago: v.fechaPago ?? null,
      numeroRecibo: v.numeroRecibo ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.capacitacionInscritoId !== undefined) {
      where.capacitacionInscritoId = filters.capacitacionInscritoId;
    }
    if (filters.numeroRecibo !== undefined) {
      where.numeroRecibo = filters.numeroRecibo;
    }
    return where;
  }

  getSearchFields() {
    return ['numero_recibo', 'observaciones'];
  }

  getDefaultSort() {
    return [
      ['fechaPago', 'ASC'],
      ['id', 'ASC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('capacitacionInscritoId' in data) model.capacitacionInscritoId = data.capacitacionInscritoId;
    if ('metodoPagoId' in data) model.metodoPagoId = data.metodoPagoId ?? null;
    if ('cuentaPagoId' in data) model.cuentaPagoId = data.cuentaPagoId ?? null;
    if ('monto' in data) model.monto = data.monto;
    if ('fechaPago' in data) model.fechaPago = data.fechaPago;
    if ('numeroRecibo' in data) model.numeroRecibo = data.numeroRecibo;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    return this.mapDataToModel(data);
  }

  getCollectionName() {
    return 'pagosCapacitacion';
  }

  /**
   * Suma de montos de pagos vigentes de una inscripción.
   *
   * @param {number} capacitacionInscritoId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<number>} Total pagado (0 si no hay pagos)
   */
  async sumMontoByInscripcionId(capacitacionInscritoId, options = {}) {
    const total = await PagoCapacitacionModel.sum('monto', {
      where: { capacitacionInscritoId, activo: true },
      ...options,
    });
    return Number(total ?? 0);
  }

  /**
   * Historial de pagos de una inscripción con nombre del método de pago y
   * datos mínimos de la cuenta (filas crudas snake_case, orden cronológico).
   *
   * @param {number} capacitacionInscritoId
   * @returns {Promise<Array<Object>>}
   */
  async findDetalleByInscripcionId(capacitacionInscritoId) {
    const query = `
      SELECT
        cp.id,
        cp.monto,
        cp.fecha_pago,
        cp.numero_recibo,
        cp.observaciones,
        cp.metodo_pago_id,
        mp.nombre AS metodo_pago_nombre,
        cp.cuenta_pago_id,
        cta.nombre_titular AS cuenta_pago_titular,
        cta.numero_cuenta AS cuenta_pago_numero,
        cp.created_at
      FROM capacitacion_pagos cp
      LEFT JOIN metodos_pago mp
        ON mp.id = cp.metodo_pago_id
        AND mp.deleted_at IS NULL
      LEFT JOIN cuentas_pago cta
        ON cta.id = cp.cuenta_pago_id
        AND cta.deleted_at IS NULL
      WHERE cp.capacitacion_inscrito_id = :capacitacionInscritoId
        AND cp.activo = TRUE
        AND cp.deleted_at IS NULL
      ORDER BY cp.fecha_pago ASC, cp.id ASC
    `;
    return sequelize.query(query, {
      replacements: { capacitacionInscritoId },
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
