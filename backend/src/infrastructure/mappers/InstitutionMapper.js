import { Institution } from '../../domain/entities/Institution.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: InstitutionMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Institution)
 * Sigue el mismo patrón que CountryMapper usando BaseMapper.
 */
export class InstitutionMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio Institution.
   *
   * @param {Object|null} model
   * @returns {Institution|null}
   */
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: nombres de propiedades del modelo (camelCase) → entidad
    if ('nombre' in dataValues) {
      specificFields.nombre = dataValues.nombre;
    }
    if ('tipo' in dataValues) {
      specificFields.tipo = dataValues.tipo;
    }
    if ('dependencia' in dataValues) {
      specificFields.dependencia = dataValues.dependencia;
    }
    if ('codigoSie' in dataValues) {
      specificFields.codigoSie = dataValues.codigoSie;
    }
    if ('departamentoId' in dataValues) {
      specificFields.departamentoId = dataValues.departamentoId;
    }
    if ('distritoEducativo' in dataValues) {
      specificFields.distritoEducativo = dataValues.distritoEducativo;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Institution(entityData);
  }

  /**
   * Convierte una entidad Institution u objeto plano a formato del modelo Sequelize (INSERT).
   *
   * @param {Institution|Object} entity
   * @returns {Object}
   */
  static toModel(entity) {
    const data = entity instanceof Institution ? entity.toPlainObject() : entity;

    return {
      nombre: data.nombre,
      tipo: data.tipo,
      dependencia: data.dependencia ?? null,
      codigoSie: data.codigoSie ?? null,
      departamentoId: data.departamentoId ?? null,
      distritoEducativo: data.distritoEducativo ?? null,
    };
  }

  /**
   * Convierte una entidad Institution u objeto plano a formato del modelo Sequelize (UPDATE).
   * Usa BaseMapper.baseFieldsToModelForUpdate para campos base (activo, etc.).
   *
   * @param {Institution|Object} entity
   * @returns {Object}
   */
  static toModelForUpdate(entity) {
    const data = entity instanceof Institution ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('nombre' in data) {
      updateData.nombre = data.nombre;
    }
    if ('tipo' in data) {
      updateData.tipo = data.tipo;
    }
    if ('dependencia' in data) {
      updateData.dependencia = data.dependencia ?? null;
    }
    if ('codigoSie' in data) {
      updateData.codigoSie = data.codigoSie ?? null;
    }
    if ('departamentoId' in data) {
      updateData.departamentoId = data.departamentoId ?? null;
    }
    if ('distritoEducativo' in data) {
      updateData.distritoEducativo = data.distritoEducativo ?? null;
    }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades Institution.
   *
   * @param {Array} models
   * @returns {Institution[]}
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter((e) => e !== null);
  }
}

