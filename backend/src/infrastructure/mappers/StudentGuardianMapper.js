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
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteApoderado
   * @returns {StudentGuardian|null} Entidad de dominio StudentGuardian
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentGuardian (campos del dominio)
    const specificFields = {
      studentId: model.estudianteId,
      relationshipTypeId: model.tipoParentescoId,
      firstName: model.nombres,
      lastName: model.apellidos,
      ci: model.ci,
      occupation: model.ocupacion,
      workplace: model.lugarTrabajo,
      address: model.direccion,
      phone: model.telefono,
      mobilePhone: model.celular,
      email: model.email,
      isEmergencyContact: model.esContactoEmergencia === 1 || model.esContactoEmergencia === true,
      isLegalGuardian: model.esApoderadoLegal === 1 || model.esApoderadoLegal === true,
      livesWithStudent: model.viveConEstudiante === 1 || model.viveConEstudiante === true,
      observations: model.observaciones,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentGuardian(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudentGuardian|Object} entity - Entidad StudentGuardian o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentGuardian como objeto plano
    const data = entity instanceof StudentGuardian ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      estudianteId: data.studentId || null,
      tipoParentescoId: data.relationshipTypeId || null,
      nombres: data.firstName,
      apellidos: data.lastName || null,
      ci: data.ci || null,
      ocupacion: data.occupation || null,
      lugarTrabajo: data.workplace || null,
      direccion: data.address || null,
      telefono: data.phone || null,
      celular: data.mobilePhone || null,
      email: data.email ? data.email.toLowerCase() : null,
      esContactoEmergencia: data.isEmergencyContact !== undefined ? data.isEmergencyContact : true,
      esApoderadoLegal: data.isLegalGuardian !== undefined ? data.isLegalGuardian : false,
      viveConEstudiante: data.livesWithStudent !== undefined ? data.livesWithStudent : false,
      observaciones: data.observations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentGuardian
   * 
   * @param {StudentGuardian|Object} entity - Entidad StudentGuardian o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentGuardian como objeto plano
    const data = entity instanceof StudentGuardian ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentGuardian
    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId || null;
    }
    if (data.relationshipTypeId !== undefined) {
      updateData.tipoParentescoId = data.relationshipTypeId || null;
    }
    if (data.firstName !== undefined) {
      updateData.nombres = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.apellidos = data.lastName || null;
    }
    if (data.ci !== undefined) {
      updateData.ci = data.ci || null;
    }
    if (data.occupation !== undefined) {
      updateData.ocupacion = data.occupation || null;
    }
    if (data.workplace !== undefined) {
      updateData.lugarTrabajo = data.workplace || null;
    }
    if (data.address !== undefined) {
      updateData.direccion = data.address || null;
    }
    if (data.phone !== undefined) {
      updateData.telefono = data.phone || null;
    }
    if (data.mobilePhone !== undefined) {
      updateData.celular = data.mobilePhone || null;
    }
    if (data.email !== undefined) {
      updateData.email = data.email ? data.email.toLowerCase() : null;
    }
    if (data.isEmergencyContact !== undefined) {
      updateData.esContactoEmergencia = data.isEmergencyContact;
    }
    if (data.isLegalGuardian !== undefined) {
      updateData.esApoderadoLegal = data.isLegalGuardian;
    }
    if (data.livesWithStudent !== undefined) {
      updateData.viveConEstudiante = data.livesWithStudent;
    }
    if (data.observations !== undefined) {
      updateData.observaciones = data.observations || null;
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

