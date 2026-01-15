import { Classroom } from '../../domain/entities/Classroom.js';
import { BaseMapper } from './BaseMapper.js';
import { CATEGORIAS_AULA } from '../../domain/constants/cursos.constants.js';

/**
 * Mapper: ClassroomMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Classroom)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Classroom
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Classroom
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Classroom (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + ClassroomMapper (campos específicos)
 * - Infrastructure Layer: ClassroomRepository (usa el mapper para conversiones)
 */
export class ClassroomMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Classroom
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de Aula
   * @returns {Classroom|null} Entidad de dominio Classroom
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Classroom (campos del dominio)
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
    if ('categoria' in dataValues && dataValues.categoria !== undefined) {
      specificFields.category = dataValues.categoria;
    }
    if ('capacidad' in dataValues && dataValues.capacidad !== undefined) {
      specificFields.capacity = dataValues.capacidad;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Classroom(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {Classroom|Object} entity - Entidad Classroom o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Classroom como objeto plano
    const data = entity instanceof Classroom ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      codigo: data.code,
      nombre: data.name,
      categoria: data.category || CATEGORIAS_AULA.AULA,
      capacidad: data.capacity !== undefined ? data.capacity : 35,
      observaciones: data.observations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Classroom
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {Classroom|Object} entity - Entidad Classroom o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Classroom como objeto plano
    const data = entity instanceof Classroom ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Classroom
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('code' in data) { updateData.codigo = data.code; }
    if ('name' in data) { updateData.nombre = data.name; }
    if ('category' in data) { updateData.categoria = data.category; }
    if ('capacity' in data) { updateData.capacidad = data.capacity; }
    if ('observations' in data) { updateData.observaciones = data.observations || null; }

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   * 
   * @param {Array} models - Array de modelos Sequelize
   * @returns {Classroom[]} Array de entidades Classroom
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
