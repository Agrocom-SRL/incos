import { Career } from '../../domain/entities/Career.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: CareerMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Career)
 *
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Career
 *
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Career
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 *
 * Clean Architecture:
 * - Domain Layer: Career (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + CareerMapper (campos específicos)
 * - Infrastructure Layer: CareerRepository (usa el mapper para conversiones)
 */
export class CareerMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Career
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de Carrera
   * @returns {Career|null} Entidad de dominio Career
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Career (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('codigo' in dataValues && dataValues.codigo !== undefined) {
      specificFields.code = dataValues.codigo;
    }
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }
    if ('descripcion' in dataValues && dataValues.descripcion !== undefined) {
      specificFields.description = dataValues.descripcion;
    }
    if ('areaFormacion' in dataValues && dataValues.areaFormacion !== undefined) {
      specificFields.trainingArea = dataValues.areaFormacion;
    }
    if ('tituloOtorgado' in dataValues && dataValues.tituloOtorgado !== undefined) {
      specificFields.grantedTitle = dataValues.tituloOtorgado;
    }
    if ('colorHex' in dataValues && dataValues.colorHex !== undefined) {
      specificFields.colorHex = dataValues.colorHex;
    }
    if ('imagenRuta' in dataValues && dataValues.imagenRuta !== undefined) {
      specificFields.imagePath = dataValues.imagenRuta;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new Career(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {Career|Object} entity - Entidad Career o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Career como objeto plano
    const data = entity instanceof Career ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      codigo: data.code,
      nombre: data.name,
      descripcion: data.description || null,
      areaFormacion: data.trainingArea || null,
      tituloOtorgado: data.grantedTitle || null,
      colorHex: data.colorHex || null,
      imagenRuta: data.imagePath || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Career
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {Career|Object} entity - Entidad Career o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Career como objeto plano
    const data = entity instanceof Career ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Career
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('code' in data) {
      updateData.codigo = data.code;
    }
    if ('name' in data) {
      updateData.nombre = data.name;
    }
    if ('description' in data) {
      updateData.descripcion = data.description || null;
    }
    if ('trainingArea' in data) {
      updateData.areaFormacion = data.trainingArea || null;
    }
    if ('grantedTitle' in data) {
      updateData.tituloOtorgado = data.grantedTitle || null;
    }
    if ('colorHex' in data) {
      updateData.colorHex = data.colorHex || null;
    }
    if ('imagePath' in data) {
      updateData.imagenRuta = data.imagePath || null;
    }

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   *
   * @param {Array} models - Array de modelos Sequelize
   * @returns {Career[]} Array de entidades Career
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
