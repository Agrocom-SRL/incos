import { Op } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { Participante as ParticipanteModel } from '../database/models/participante.js';

/**
 * Repositorio CRUD de participantes de capacitación (`participantes`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. Sin Mapper/Entidad pesados: la entidad de dominio es un objeto
 * plano con claves del contrato (camelCase).
 *
 * La unicidad CI+expedición se valida en los use cases usando
 * findByCiExpedicion (sin UNIQUE en BD, mismo criterio que `estudiantes`).
 *
 * @implements {IParticipanteRepository}
 */
export class ParticipanteRepository extends BaseRepository {
  getModel() {
    return ParticipanteModel;
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
      ci: v.ci ?? null,
      expedicion: v.expedicion ?? null,
      nombres: v.nombres ?? null,
      apellidoPaterno: v.apellidoPaterno ?? null,
      apellidoMaterno: v.apellidoMaterno ?? null,
      celular: v.celular ?? null,
      email: v.email ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.ci !== undefined) {
      where.ci = filters.ci;
    }
    if (filters.expedicion !== undefined) {
      where.expedicion =
        filters.expedicion !== null && String(filters.expedicion).trim() !== ''
          ? String(filters.expedicion).trim().toUpperCase()
          : filters.expedicion;
    }
    if (filters.excludeId !== undefined && filters.excludeId !== null) {
      where.id = { [Op.ne]: Number(filters.excludeId) };
    }
    return where;
  }

  getSearchFields() {
    return ['ci', 'nombres', 'apellido_paterno', 'apellido_materno', 'celular'];
  }

  /**
   * Orden estándar de personas: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
   */
  getDefaultSort() {
    return [
      ['apellidoPaterno', 'ASC'],
      ['apellidoMaterno', 'ASC'],
      ['nombres', 'ASC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('ci' in data) model.ci = data.ci;
    if ('expedicion' in data) {
      model.expedicion =
        data.expedicion !== null && data.expedicion !== undefined && String(data.expedicion).trim() !== ''
          ? String(data.expedicion).trim().toUpperCase()
          : null;
    }
    if ('nombres' in data) model.nombres = data.nombres;
    if ('apellidoPaterno' in data) model.apellidoPaterno = data.apellidoPaterno ?? null;
    if ('apellidoMaterno' in data) model.apellidoMaterno = data.apellidoMaterno ?? null;
    if ('celular' in data) model.celular = data.celular;
    if ('email' in data) model.email = data.email ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    // Toggle de activo (reactivación desde edición)
    if ('activo' in data) model.activo = data.activo;
    if ('active' in data) model.activo = data.active;
    return model;
  }

  getCollectionName() {
    return 'participantes';
  }

  /**
   * Participante activo por CI + expedición (identidad de negocio).
   * `expedicion` null/'' matchea filas con expedicion NULL.
   *
   * @param {string} ci
   * @param {string|null} expedicion
   * @param {Object} options - { excludeId }
   * @returns {Promise<Object|null>}
   */
  async findByCiExpedicion(ci, expedicion, options = {}) {
    const expedicionNormalizada =
      expedicion !== null && expedicion !== undefined && String(expedicion).trim() !== ''
        ? String(expedicion).trim().toUpperCase()
        : null;

    return this.findBy({
      ci,
      expedicion: expedicionNormalizada,
      ...(options.excludeId ? { excludeId: options.excludeId } : {}),
    });
  }
}
