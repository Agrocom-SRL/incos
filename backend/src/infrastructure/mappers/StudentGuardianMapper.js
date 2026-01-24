import { StudentGuardian } from '../../domain/entities/StudentGuardian.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentGuardianMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentGuardian)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentGuardian
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentGuardian
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudentGuardian (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentGuardianMapper (campos específicos)
 * - Infrastructure Layer: StudentGuardianRepository (usa el mapper para conversiones)
 */
export class StudentGuardianMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentGuardian
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteApoderado
   * @returns {StudentGuardian|null} Entidad de dominio StudentGuardian
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentGuardian (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('tipoParentescoId' in dataValues && dataValues.tipoParentescoId !== undefined) {
      specificFields.relationshipTypeId = dataValues.tipoParentescoId;
    }
    if ('nombres' in dataValues && dataValues.nombres !== undefined) {
      specificFields.firstName = dataValues.nombres;
    }
    if ('apellidos' in dataValues && dataValues.apellidos !== undefined) {
      specificFields.lastName = dataValues.apellidos;
    }
    if ('celular1' in dataValues && dataValues.celular1 !== undefined) {
      specificFields.cellphone1 = dataValues.celular1;
    }
    if ('celular2' in dataValues && dataValues.celular2 !== undefined) {
      specificFields.cellphone2 = dataValues.celular2;
    }
    if ('viveConEstudiante' in dataValues && dataValues.viveConEstudiante !== undefined) {
      specificFields.livesWithStudent = dataValues.viveConEstudiante === 1 || dataValues.viveConEstudiante === true;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentGuardian(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {StudentGuardian|Object} entity - Entidad StudentGuardian o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentGuardian como objeto plano
    const data = entity instanceof StudentGuardian ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      estudianteId: data.studentId || null,
      tipoParentescoId: data.relationshipTypeId || null,
      nombres: data.firstName || null,
      apellidos: data.lastName || null,
      celular1: data.cellphone1 || null,
      celular2: data.cellphone2 || null,
      viveConEstudiante: data.livesWithStudent !== undefined ? data.livesWithStudent : false,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentGuardian
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {StudentGuardian|Object} entity - Entidad StudentGuardian o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentGuardian como objeto plano
    const data = entity instanceof StudentGuardian ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentGuardian
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId || null;
    }
    if ('relationshipTypeId' in data) {
      updateData.tipoParentescoId = data.relationshipTypeId || null;
    }
    if ('firstName' in data) {
      updateData.nombres = data.firstName || null;
    }
    if ('lastName' in data) {
      updateData.apellidos = data.lastName || null;
    }
    if ('cellphone1' in data) {
      updateData.celular1 = data.cellphone1 || null;
    }
    if ('cellphone2' in data) {
      updateData.celular2 = data.cellphone2 || null;
    }
    if ('livesWithStudent' in data) {
      updateData.viveConEstudiante = data.livesWithStudent;
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
   * @returns {StudentGuardian[]} Array de entidades StudentGuardian
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

