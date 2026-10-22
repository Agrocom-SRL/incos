import { BaseRepository } from './BaseRepository.js';
import { sequelize } from '../database/sequelize.js';
import { CapacitacionInscritoRequisito as CapacitacionInscritoRequisitoModel } from '../database/models/capacitacion_inscrito_requisito.js';

/**
 * Repositorio CRUD del checklist de requisitos por inscripción
 * (`capacitacion_inscrito_requisitos`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. Solo hay fila cuando el requisito se marcó/evaluó al menos una
 * vez; el checklist completo (requisitos del curso sin fila incluidos) se lee
 * con `findChecklistByInscripcionId`.
 *
 * @implements {ICapacitacionInscritoRequisitoRepository}
 */
export class CapacitacionInscritoRequisitoRepository extends BaseRepository {
  getModel() {
    return CapacitacionInscritoRequisitoModel;
  }

  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      capacitacionInscritoId: v.capacitacionInscritoId ?? null,
      capacitacionRequisitoId: v.capacitacionRequisitoId ?? null,
      entregado: Boolean(v.entregado),
      fechaEntrega: v.fechaEntrega ?? null,
      observacion: v.observacion ?? null,
      activo: v.activo ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.capacitacionInscritoId !== undefined) {
      where.capacitacionInscritoId = filters.capacitacionInscritoId;
    }
    if (filters.capacitacionRequisitoId !== undefined) {
      where.capacitacionRequisitoId = filters.capacitacionRequisitoId;
    }
    return where;
  }

  getSearchFields() {
    return ['observacion'];
  }

  getDefaultSort() {
    return [['id', 'ASC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('capacitacionInscritoId' in data) model.capacitacionInscritoId = data.capacitacionInscritoId;
    if ('capacitacionRequisitoId' in data) {
      model.capacitacionRequisitoId = data.capacitacionRequisitoId;
    }
    if ('entregado' in data) model.entregado = data.entregado;
    if ('fechaEntrega' in data) model.fechaEntrega = data.fechaEntrega ?? null;
    if ('observacion' in data) model.observacion = data.observacion ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    delete model.capacitacionInscritoId;
    delete model.capacitacionRequisitoId;
    return model;
  }

  getCollectionName() {
    return 'inscritoRequisitosCapacitacion';
  }

  /**
   * Fila de entrega de un requisito en una inscripción (vigente), o null.
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionRequisitoId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object|null>}
   */
  async findByInscripcionAndRequisito(capacitacionInscritoId, capacitacionRequisitoId, options = {}) {
    const model = await CapacitacionInscritoRequisitoModel.findOne({
      where: { capacitacionInscritoId, capacitacionRequisitoId, activo: true },
      transaction: options.transaction,
    });
    return this.toEntity(model);
  }

  /**
   * Cantidad de requisitos OBLIGATORIOS vigentes del curso que la inscripción
   * aún no entregó (sin fila o con entregado=false).
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<number>}
   */
  async contarObligatoriosPendientes(capacitacionInscritoId, capacitacionId, options = {}) {
    const filas = await sequelize.query(
      `SELECT COUNT(*) AS pendientes
       FROM capacitacion_requisitos r
       LEFT JOIN capacitacion_inscrito_requisitos ir
         ON ir.capacitacion_requisito_id = r.id
         AND ir.capacitacion_inscrito_id = :capacitacionInscritoId
         AND ir.activo = TRUE
         AND ir.deleted_at IS NULL
       WHERE r.capacitacion_id = :capacitacionId
         AND r.obligatorio = TRUE
         AND r.activo = TRUE
         AND r.deleted_at IS NULL
         AND COALESCE(ir.entregado, FALSE) = FALSE`,
      {
        replacements: { capacitacionInscritoId, capacitacionId },
        type: sequelize.QueryTypes.SELECT,
        transaction: options.transaction,
      }
    );
    return Number(filas[0]?.pendientes ?? 0);
  }

  /**
   * Estado del costo del curso externo: el curso tiene entidad certificadora
   * (su costo se deposita a ella y no se registra como pago), cuál es el
   * requisito que acredita el depósito y si la inscripción ya lo entregó.
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<{pagoCursoExterno: boolean, requisitoId: number|null,
   *   requisitoDescripcion: string|null, acreditado: boolean}>}
   */
  async resolverPagoCursoExterno(capacitacionInscritoId, capacitacionId, options = {}) {
    const filas = await sequelize.query(
      `SELECT
         c.entidad_certificadora,
         r.id AS requisito_id,
         r.descripcion AS requisito_descripcion,
         COALESCE(ir.entregado, FALSE) AS entregado
       FROM capacitaciones c
       LEFT JOIN capacitacion_requisitos r
         ON r.capacitacion_id = c.id
         AND r.acredita_pago_curso = TRUE
         AND r.activo = TRUE
         AND r.deleted_at IS NULL
       LEFT JOIN capacitacion_inscrito_requisitos ir
         ON ir.capacitacion_requisito_id = r.id
         AND ir.capacitacion_inscrito_id = :capacitacionInscritoId
         AND ir.activo = TRUE
         AND ir.deleted_at IS NULL
       WHERE c.id = :capacitacionId
       LIMIT 1`,
      {
        replacements: { capacitacionInscritoId, capacitacionId },
        type: sequelize.QueryTypes.SELECT,
        transaction: options.transaction,
      }
    );
    const fila = filas[0];
    const entidad = typeof fila?.entidad_certificadora === 'string' ? fila.entidad_certificadora.trim() : '';
    const pagoCursoExterno = entidad !== '';
    const requisitoId = pagoCursoExterno ? (fila.requisito_id ?? null) : null;
    return {
      pagoCursoExterno,
      requisitoId,
      requisitoDescripcion: requisitoId !== null ? (fila.requisito_descripcion ?? null) : null,
      acreditado: requisitoId !== null && Boolean(Number(fila.entregado)),
    };
  }

  /**
   * Checklist completo de una inscripción: todos los requisitos vigentes del
   * curso con su estado de entrega (filas crudas snake_case, en orden).
   *
   * @param {number} capacitacionInscritoId
   * @param {number} capacitacionId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Array<Object>>}
   */
  async findChecklistByInscripcionId(capacitacionInscritoId, capacitacionId, options = {}) {
    return sequelize.query(
      `SELECT
         r.id AS requisito_id,
         r.descripcion,
         r.obligatorio,
         r.acredita_pago_curso,
         r.orden,
         COALESCE(ir.entregado, FALSE) AS entregado,
         ir.fecha_entrega,
         ir.observacion
       FROM capacitacion_requisitos r
       LEFT JOIN capacitacion_inscrito_requisitos ir
         ON ir.capacitacion_requisito_id = r.id
         AND ir.capacitacion_inscrito_id = :capacitacionInscritoId
         AND ir.activo = TRUE
         AND ir.deleted_at IS NULL
       WHERE r.capacitacion_id = :capacitacionId
         AND r.activo = TRUE
         AND r.deleted_at IS NULL
       ORDER BY r.orden ASC, r.id ASC`,
      {
        replacements: { capacitacionInscritoId, capacitacionId },
        type: sequelize.QueryTypes.SELECT,
        transaction: options.transaction,
      }
    );
  }
}
