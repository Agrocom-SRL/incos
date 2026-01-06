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
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteDatosAcademicos
   * @returns {StudentAcademicData|null} Entidad de dominio StudentAcademicData
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentAcademicData (campos del dominio)
    const specificFields = {
      studentId: model.estudianteId,
      careerId: model.carreraId,
      managementId: model.gestionIngresoId,
      academicState: model.estadoAcademico,
      registrationState: model.estadoRegistro || 'BORRADOR', // BORRADOR, PENDIENTE, ADMITIDO
      previousSchool: model.unidadEducativaProcedencia,
      highSchoolGraduationYear: model.anioEgresoSecundaria,
      annualAverage: model.promedioAnual ? parseFloat(model.promedioAnual) : null,
      graduationDate: model.fechaEgreso,
      withdrawalDate: model.fechaRetiro,
      withdrawalReason: model.motivoRetiro,
      photoUrl: model.fotoUrl,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentAcademicData(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudentAcademicData|Object} entity - Entidad StudentAcademicData o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentAcademicData como objeto plano
    const data = entity instanceof StudentAcademicData ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentAcademicData
   * 
   * @param {StudentAcademicData|Object} entity - Entidad StudentAcademicData o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentAcademicData como objeto plano
    const data = entity instanceof StudentAcademicData ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentAcademicData
    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId;
    }
    if (data.careerId !== undefined) {
      updateData.carreraId = data.careerId;
    }
    if (data.managementId !== undefined) {
      updateData.gestionIngresoId = data.managementId;
    }
    if (data.academicState !== undefined) {
      updateData.estadoAcademico = data.academicState;
    }
    if (data.registrationState !== undefined) {
      updateData.estadoRegistro = data.registrationState;
    }
    if (data.previousSchool !== undefined) {
      updateData.unidadEducativaProcedencia = data.previousSchool || null;
    }
    if (data.highSchoolGraduationYear !== undefined) {
      updateData.anioEgresoSecundaria = data.highSchoolGraduationYear || null;
    }
    if (data.annualAverage !== undefined) {
      updateData.promedioAnual = data.annualAverage || null;
    }
    if (data.graduationDate !== undefined) {
      updateData.fechaEgreso = data.graduationDate || null;
    }
    if (data.withdrawalDate !== undefined) {
      updateData.fechaRetiro = data.withdrawalDate || null;
    }
    if (data.withdrawalReason !== undefined) {
      updateData.motivoRetiro = data.withdrawalReason || null;
    }
    if (data.photoUrl !== undefined) {
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

