import { StudentAcademicData } from '../../domain/entities/StudentAcademicData.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentAcademicDataMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentAcademicData)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentAcademicData
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentAcademicData
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudentAcademicData (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentAcademicDataMapper (campos específicos)
 * - Infrastructure Layer: StudentAcademicDataRepository (usa el mapper para conversiones)
 */
export class StudentAcademicDataMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentAcademicData
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteDatosAcademicos
   * @returns {StudentAcademicData|null} Entidad de dominio StudentAcademicData
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentAcademicData (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('carreraId' in dataValues && dataValues.carreraId !== undefined) {
      specificFields.careerId = dataValues.carreraId;
    }
    if ('gestionIngresoId' in dataValues && dataValues.gestionIngresoId !== undefined) {
      specificFields.managementId = dataValues.gestionIngresoId;
    }
    if ('estadoAcademico' in dataValues && dataValues.estadoAcademico !== undefined) {
      specificFields.academicState = dataValues.estadoAcademico;
    }
    if ('estadoRegistro' in dataValues && dataValues.estadoRegistro !== undefined) {
      specificFields.registrationState = dataValues.estadoRegistro || 'BORRADOR'; // BORRADOR, PENDIENTE, ADMITIDO
    }
    if ('tipoAdmision' in dataValues && dataValues.tipoAdmision !== undefined) {
      specificFields.admissionType = dataValues.tipoAdmision; // BD → dominio; API expone tipoAdmision en toPlainObject
    }
    if ('unidadEducativaProcedencia' in dataValues && dataValues.unidadEducativaProcedencia !== undefined) {
      specificFields.previousSchool = dataValues.unidadEducativaProcedencia;
    }
    if ('anioEgresoSecundaria' in dataValues && dataValues.anioEgresoSecundaria !== undefined) {
      specificFields.highSchoolGraduationYear = dataValues.anioEgresoSecundaria;
    }
    if ('promedioAnual' in dataValues && dataValues.promedioAnual !== undefined) {
      specificFields.annualAverage = dataValues.promedioAnual ? parseFloat(dataValues.promedioAnual) : null;
    }
    if ('fechaEgreso' in dataValues && dataValues.fechaEgreso !== undefined) {
      specificFields.graduationDate = dataValues.fechaEgreso;
    }
    if ('fechaRetiro' in dataValues && dataValues.fechaRetiro !== undefined) {
      specificFields.withdrawalDate = dataValues.fechaRetiro;
    }
    if ('motivoRetiro' in dataValues && dataValues.motivoRetiro !== undefined) {
      specificFields.withdrawalReason = dataValues.motivoRetiro;
    }
    if ('fotoUrl' in dataValues && dataValues.fotoUrl !== undefined) {
      specificFields.photoUrl = dataValues.fotoUrl;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentAcademicData(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {StudentAcademicData|Object} entity - Entidad StudentAcademicData o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentAcademicData como objeto plano
    const data = entity instanceof StudentAcademicData ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      estudianteId: data.studentId,
      carreraId: data.careerId,
      gestionIngresoId: data.managementId,
      estadoAcademico: data.academicState || 'REGULAR',
      estadoRegistro: data.registrationState || 'BORRADOR', // BORRADOR, PENDIENTE, ADMITIDO
      unidadEducativaProcedencia: data.previousSchool || null,
      anioEgresoSecundaria: data.highSchoolGraduationYear || null,
      promedioAnual: data.annualAverage || null,
      fechaEgreso: data.graduationDate || null,
      fechaRetiro: data.withdrawalDate || null,
      motivoRetiro: data.withdrawalReason || null,
      fotoUrl: data.photoUrl || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentAcademicData
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {StudentAcademicData|Object} entity - Entidad StudentAcademicData o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentAcademicData como objeto plano
    const data = entity instanceof StudentAcademicData ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentAcademicData
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId;
    }
    if ('careerId' in data) {
      updateData.carreraId = data.careerId;
    }
    if ('managementId' in data) {
      updateData.gestionIngresoId = data.managementId;
    }
    if ('academicState' in data) {
      updateData.estadoAcademico = data.academicState;
    }
    if ('registrationState' in data) {
      updateData.estadoRegistro = data.registrationState;
    }
    if ('admissionType' in data || 'tipoAdmision' in data) {
      updateData.tipoAdmision = data.admissionType ?? data.tipoAdmision ?? 'NUEVO';
    }
    if ('previousSchool' in data) {
      updateData.unidadEducativaProcedencia = data.previousSchool || null;
    }
    if ('highSchoolGraduationYear' in data) {
      updateData.anioEgresoSecundaria = data.highSchoolGraduationYear || null;
    }
    if ('annualAverage' in data) {
      updateData.promedioAnual = data.annualAverage || null;
    }
    if ('graduationDate' in data) {
      updateData.fechaEgreso = data.graduationDate || null;
    }
    if ('withdrawalDate' in data) {
      updateData.fechaRetiro = data.withdrawalDate || null;
    }
    if ('withdrawalReason' in data) {
      updateData.motivoRetiro = data.withdrawalReason || null;
    }
    if ('photoUrl' in data) {
      updateData.fotoUrl = data.photoUrl || null;
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
   * @returns {StudentAcademicData[]} Array de entidades StudentAcademicData
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

