import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { CapacitacionCompromiso as CapacitacionCompromisoModel } from '../database/models/capacitacion_compromiso.js';
import { ESTADOS_COMPROMISO_CAPACITACION } from '../../domain/constants/capacitacion.constants.js';

/**
 * Repositorio CRUD de compromisos de pago de capacitación (`capacitacion_compromisos`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. No usa Mapper/Entidad pesados: la entidad de dominio aquí es un
 * objeto plano con claves de dominio (alineado al contrato `compromiso`).
 *
 * Regla de negocio (un compromiso VIGENTE por inscripción, creado solo al
 * inscribirse) se aplica en los use cases; este repo solo expone las
 * lecturas/escrituras necesarias para soportarla.
 *
 * @implements {ICapacitacionCompromisoRepository}
 */
export class CapacitacionCompromisoRepository extends BaseRepository {
  getModel() {
    return CapacitacionCompromisoModel;
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
      fechaCompromiso: v.fechaCompromiso ?? null,
      observacion: v.observacion ?? null,
      estado: v.estado ?? null,
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
    if (filters.estado !== undefined) {
      where.estado = filters.estado;
    }
    return where;
  }

  getSearchFields() {
    return ['observacion'];
  }

  getDefaultSort() {
    return [['id', 'ASC']];
  }

  /**
   * Mapea datos de dominio a modelo Sequelize (creación).
   * @param {Object} data
   * @returns {Object}
   */
  mapDataToModel(data) {
    const model = {};
    if ('capacitacionInscritoId' in data) {
      model.capacitacionInscritoId = data.capacitacionInscritoId ?? null;
    }
    if ('fechaCompromiso' in data) model.fechaCompromiso = data.fechaCompromiso;
    if ('observacion' in data) model.observacion = data.observacion ?? null;
    if ('estado' in data) model.estado = data.estado;
    return model;
  }

  /**
   * Mapea datos de dominio a modelo Sequelize (actualización).
   * @param {Object} data
   * @returns {Object}
   */
  mapDataToUpdate(data) {
    const model = {};
    if ('fechaCompromiso' in data) model.fechaCompromiso = data.fechaCompromiso;
    if ('observacion' in data) model.observacion = data.observacion ?? null;
    if ('estado' in data) model.estado = data.estado;
    if ('activo' in data) model.activo = data.activo;
    return model;
  }

  getCollectionName() {
    return 'capacitacionCompromisos';
  }

  /**
   * Compromiso VIGENTE (en plazo, aún no CUMPLIDO ni INCUMPLIDO) y activo de
   * una inscripción, o null.
   *
   * @param {number} capacitacionInscritoId
   * @param {Object} options - Opciones opcionales (ej: `{ transaction }`)
   * @returns {Promise<Object|null>}
   */
  async findVigenteByInscripcionId(capacitacionInscritoId, options = {}) {
    const { transaction } = options;
    const model = await CapacitacionCompromisoModel.findOne({
      where: {
        capacitacionInscritoId,
        estado: ESTADOS_COMPROMISO_CAPACITACION.VIGENTE,
        activo: true,
      },
      order: [['id', 'DESC']],
      transaction,
    });
    return this.toEntity(model);
  }

  /**
   * UPDATE perezoso: marca INCUMPLIDO los compromisos VIGENTE cuya
   * `fecha_compromiso` ya pasó. Puramente informativo — no toca
   * `capacitacion_inscritos`. Se invoca desde los use cases de
   * listado/ficha de inscripciones antes de leer.
   *
   * @returns {Promise<number>} Cantidad de filas actualizadas
   */
  async marcarVencidosComoIncumplidos() {
    const hoy = new Date().toISOString().slice(0, 10);
    const [affectedCount] = await CapacitacionCompromisoModel.update(
      { estado: ESTADOS_COMPROMISO_CAPACITACION.INCUMPLIDO },
      {
        where: {
          estado: ESTADOS_COMPROMISO_CAPACITACION.VIGENTE,
          fechaCompromiso: { [Op.lt]: hoy },
          activo: true,
        },
      }
    );
    return affectedCount;
  }
}
