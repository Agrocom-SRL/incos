import { Shift } from '../../domain/entities/Shift.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ShiftMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Shift)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Shift
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Shift
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Shift (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + ShiftMapper (campos específicos)
 * - Infrastructure Layer: ShiftRepository (usa el mapper para conversiones)
 */
export class ShiftMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Shift
   * 
   * @param {Object|null} model - Modelo Sequelize de Turno
   * @returns {Shift|null} Entidad de dominio Shift
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Shift (campos del dominio)
    const specificFields = {
      name: model.nombre,
      startTime: model.horaInicio,
      endTime: model.horaFin,
      description: model.descripcion,
      colorHex: model.colorHex,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Shift(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Shift|Object} entity - Entidad Shift o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Shift como objeto plano
    const data = entity instanceof Shift ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      nombre: data.name,
      horaInicio: data.startTime,
      horaFin: data.endTime,
      descripcion: data.description || null,
      colorHex: data.colorHex || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Shift
   * 
   * @param {Shift|Object} entity - Entidad Shift o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Shift como objeto plano
    const data = entity instanceof Shift ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Shift
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.startTime !== undefined) {
      updateData.horaInicio = data.startTime;
    }
    if (data.endTime !== undefined) {
      updateData.horaFin = data.endTime;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.colorHex !== undefined) {
      updateData.colorHex = data.colorHex || null;
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
   * @returns {Shift[]} Array de entidades Shift
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

