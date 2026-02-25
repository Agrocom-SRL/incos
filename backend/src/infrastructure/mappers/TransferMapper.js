import { Transfer } from '../../domain/entities/Transfer.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: TransferMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Transfer)
 * Sigue el mismo patrón que EnrollmentMapper/CountryMapper usando BaseMapper.
 */
export class TransferMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio Transfer.
   * Usa BaseMapper.combineBaseAndSpecificFields para agregar campos base (id, activo, auditoría).
   *
   * @param {Object|null} model
   * @returns {Transfer|null}
   */
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    if ('estudianteId' in dataValues) {
      specificFields.estudianteId = dataValues.estudianteId;
    }
    if ('institucionOrigenId' in dataValues) {
      specificFields.institucionOrigenId = dataValues.institucionOrigenId;
    }
    if ('carreraOrigen' in dataValues) {
      specificFields.carreraOrigen = dataValues.carreraOrigen;
    }
    if ('anioCursado' in dataValues) {
      specificFields.anioCursado = dataValues.anioCursado;
    }
    if ('regimenOrigen' in dataValues) {
      specificFields.regimenOrigen = dataValues.regimenOrigen;
    }
    if ('estado' in dataValues) {
      specificFields.estado = dataValues.estado;
    }
    if ('fechaSolicitud' in dataValues) {
      specificFields.fechaSolicitud = dataValues.fechaSolicitud;
    }
    if ('motivoNoProcedente' in dataValues) {
      specificFields.motivoNoProcedente = dataValues.motivoNoProcedente;
    }
    if ('observaciones' in dataValues) {
      specificFields.observaciones = dataValues.observaciones;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Transfer(entityData);
  }

  /**
   * Convierte una entidad Transfer u objeto plano a formato del modelo Sequelize (INSERT).
   *
   * @param {Transfer|Object} entity
   * @returns {Object}
   */
  static toModel(entity) {
    const data = entity instanceof Transfer ? entity.toPlainObject() : entity;

    return {
      estudianteId: data.estudianteId ?? null,
      institucionOrigenId: data.institucionOrigenId ?? null,
      carreraOrigen: data.carreraOrigen,
      anioCursado: data.anioCursado,
      regimenOrigen: data.regimenOrigen ?? null,
      estado: data.estado ?? 'SOLICITADO',
      fechaSolicitud: data.fechaSolicitud ?? null,
      motivoNoProcedente: data.motivoNoProcedente ?? null,
      observaciones: data.observaciones ?? null,
    };
  }

  /**
   * Convierte una entidad Transfer u objeto plano a formato del modelo Sequelize (UPDATE).
   * Usa BaseMapper.baseFieldsToModelForUpdate para campos base (activo, etc.).
   *
   * @param {Transfer|Object} entity
   * @returns {Object}
   */
  static toModelForUpdate(entity) {
    const data = entity instanceof Transfer ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('estudianteId' in data) {
      updateData.estudianteId = data.estudianteId ?? null;
    }
    if ('institucionOrigenId' in data) {
      updateData.institucionOrigenId = data.institucionOrigenId ?? null;
    }
    if ('carreraOrigen' in data) {
      updateData.carreraOrigen = data.carreraOrigen;
    }
    if ('anioCursado' in data) {
      updateData.anioCursado = data.anioCursado;
    }
    if ('regimenOrigen' in data) {
      updateData.regimenOrigen = data.regimenOrigen ?? null;
    }
    if ('estado' in data) {
      updateData.estado = data.estado ?? 'SOLICITADO';
    }
    if ('fechaSolicitud' in data) {
      updateData.fechaSolicitud = data.fechaSolicitud ?? null;
    }
    if ('motivoNoProcedente' in data) {
      updateData.motivoNoProcedente = data.motivoNoProcedente ?? null;
    }
    if ('observaciones' in data) {
      updateData.observaciones = data.observaciones ?? null;
    }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades Transfer.
   *
   * @param {Array} models
   * @returns {Transfer[]}
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter((e) => e !== null);
  }
}

