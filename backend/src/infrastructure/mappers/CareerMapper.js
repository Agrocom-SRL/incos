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
   * 
   * @param {Object|null} model - Modelo Sequelize de Carrera
   * @returns {Career|null} Entidad de dominio Career
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Career (campos del dominio)
    const specificFields = {
      code: model.codigo,
      name: model.nombre,
      description: model.descripcion,
      trainingArea: model.areaFormacion,
      grantedTitle: model.tituloOtorgado,
      colorHex: model.colorHex,
      imagePath: model.imagenRuta,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Career(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Career|Object} entity - Entidad Career o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Career como objeto plano
    const data = entity instanceof Career ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Career
   * 
   * @param {Career|Object} entity - Entidad Career o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Career como objeto plano
    const data = entity instanceof Career ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Career
    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.trainingArea !== undefined) {
      updateData.areaFormacion = data.trainingArea || null;
    }
    if (data.grantedTitle !== undefined) {
      updateData.tituloOtorgado = data.grantedTitle || null;
    }
    if (data.colorHex !== undefined) {
      updateData.colorHex = data.colorHex || null;
    }
    if (data.imagePath !== undefined) {
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

