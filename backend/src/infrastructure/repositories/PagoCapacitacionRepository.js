import { fn, col } from 'sequelize';
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
      concepto: v.concepto ?? null,
      monto: v.monto !== undefined && v.monto !== null ? Number(v.monto) : null,
      fechaPago: v.fechaPago ?? null,
      numeroRecibo: v.numeroRecibo ?? null,
      observaciones: v.observaciones ?? null,
      comprobanteRuta: v.comprobanteRuta ?? null,
      comprobanteNombre: v.comprobanteNombre ?? null,
      anulado: Boolean(v.anulado),
      motivoAnulacion: v.motivoAnulacion ?? null,
      fechaAnulacion: v.fechaAnulacion ?? null,
      anuladoPor: v.anuladoPor ?? null,
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
    if ('concepto' in data) model.concepto = data.concepto;
    if ('monto' in data) model.monto = data.monto;
    if ('fechaPago' in data) model.fechaPago = data.fechaPago;
    if ('numeroRecibo' in data) model.numeroRecibo = data.numeroRecibo;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    if ('comprobanteRuta' in data) model.comprobanteRuta = data.comprobanteRuta ?? null;
    if ('comprobanteNombre' in data) model.comprobanteNombre = data.comprobanteNombre ?? null;
    if ('anulado' in data) model.anulado = Boolean(data.anulado);
    if ('motivoAnulacion' in data) model.motivoAnulacion = data.motivoAnulacion ?? null;
    if ('fechaAnulacion' in data) model.fechaAnulacion = data.fechaAnulacion ?? null;
    if ('anuladoPor' in data) model.anuladoPor = data.anuladoPor ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    return this.mapDataToModel(data);
  }

  getCollectionName() {
    return 'pagosCapacitacion';
  }

  /**
   * Suma de montos de pagos vigentes (no anulados) de una inscripción.
   *
   * @param {number} capacitacionInscritoId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<number>} Total pagado (0 si no hay pagos)
   */
  async sumMontoByInscripcionId(capacitacionInscritoId, options = {}) {
    const total = await PagoCapacitacionModel.sum('monto', {
      where: { capacitacionInscritoId, activo: true, anulado: false },
      ...options,
    });
    return Number(total ?? 0);
  }

  /**
   * Suma de pagos vigentes (no anulados) de una inscripción agrupada por concepto
   * (`MATRICULA` / `CURSO`); ambos conceptos siempre presentes (0 si no hay pagos).
   *
   * @param {number} capacitacionInscritoId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<{MATRICULA: number, CURSO: number}>}
   */
  async sumMontosPorConcepto(capacitacionInscritoId, options = {}) {
    const filas = await PagoCapacitacionModel.findAll({
      attributes: ['concepto', [fn('SUM', col('monto')), 'total']],
      where: { capacitacionInscritoId, activo: true, anulado: false },
      group: ['concepto'],
      raw: true,
      transaction: options.transaction,
    });
    const totales = { MATRICULA: 0, CURSO: 0 };
    filas.forEach((fila) => {
      totales[fila.concepto] = Number(fila.total ?? 0);
    });
    return totales;
  }

  /**
   * Historial de pagos de una inscripción con nombre del método de pago y
   * datos mínimos de la cuenta (filas crudas snake_case, orden cronológico).
   * Incluye los pagos ANULADOS (historial) con `anulado = 1`; quien totaliza
   * debe excluirlos.
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
        cp.concepto,
        cp.comprobante_nombre,
        cp.anulado,
        cp.motivo_anulacion,
        cp.fecha_anulacion,
        CASE WHEN cp.comprobante_ruta IS NULL THEN 0 ELSE 1 END AS tiene_comprobante,
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
