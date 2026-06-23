import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { CompromisoPago as CompromisoPagoModel } from '../database/models/compromiso_pago.js';

/**
 * Repositorio CRUD de compromisos de pago (`compromisos_pago`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. No usa Mapper/Entidad pesados: la entidad de dominio aquí es un
 * objeto plano con claves de dominio (alineado al contrato `compromiso`).
 *
 * Regla de negocio (UN compromiso VIGENTE por cabecera) se aplica en el use case;
 * este repo solo expone las lecturas necesarias para soportarla.
 */
export class CompromisoPagoRepository extends BaseRepository {
  getModel() {
    return CompromisoPagoModel;
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
      pagoAporteId: v.pagoAporteId ?? null,
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
    if (filters.pagoAporteId !== undefined) {
      where.pagoAporteId = filters.pagoAporteId;
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
    if ('pagoAporteId' in data) model.pagoAporteId = data.pagoAporteId ?? null;
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
    return 'compromisos';
  }

  /**
   * Compromiso ABIERTO (en seguimiento) y activo de una cabecera de aporte, o null.
   *
   * "Abierto" = todavía no saldado: estado distinto de 'CUMPLIDO'. Incluye tanto
   * 'VIGENTE' (fecha futura) como 'INCUMPLIDO' (fecha ya vencida): el estado
   * almacenado NO se recalcula a diario, así que un compromiso vencido sigue
   * siendo el compromiso vigente de la cabecera hasta que se salde. Los reportes
   * derivan en vivo (fecha vs hoy) si está vencido/próximo/al día.
   * paranoid: true excluye soft-deleted automáticamente.
   *
   * @param {number} pagoAporteId
   * @returns {Promise<Object|null>}
   */
  async findVigenteByPagoAporteId(pagoAporteId) {
    const model = await CompromisoPagoModel.findOne({
      where: { pagoAporteId, estado: { [Op.ne]: 'CUMPLIDO' }, activo: true },
      order: [['id', 'DESC']],
    });
    return this.toEntity(model);
  }

  /**
   * Compromisos ABIERTOS (no CUMPLIDO) y activos para un conjunto de cabeceras
   * (sin N+1). Incluye VIGENTE e INCUMPLIDO (ver findVigenteByPagoAporteId).
   *
   * @param {number[]} pagoAporteIds
   * @returns {Promise<Array<Object>>}
   */
  async findVigentesByPagoAporteIds(pagoAporteIds) {
    if (!Array.isArray(pagoAporteIds) || pagoAporteIds.length === 0) {
      return [];
    }
    const models = await CompromisoPagoModel.findAll({
      where: {
        pagoAporteId: { [Op.in]: pagoAporteIds },
        estado: { [Op.ne]: 'CUMPLIDO' },
        activo: true,
      },
      order: [['id', 'DESC']],
    });
    return models.map((m) => this.toEntity(m));
  }
}
