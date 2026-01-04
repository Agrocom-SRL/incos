import { Student } from '../../domain/entities/Student.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Student)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Student
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Student
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Student (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentMapper (campos específicos)
 * - Infrastructure Layer: StudentRepository (usa el mapper para conversiones)
 * 
 * NOTA: El modelo Estudiante no incluye algunos campos que están en la entidad Student
 * (nationality, birthMunicipalityId, birthCity, nativeLanguageId, disabilityTypeId).
 * Estos campos se manejan en otras tablas relacionadas (estudiantes_origenes, estudiantes_discapacidades).
 */
export class StudentMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Student
   * 
   * @param {Object|null} model - Modelo Sequelize de Estudiante
   * @returns {Student|null} Entidad de dominio Student
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Student (campos del dominio)
    // NOTA: Solo mapeamos campos que existen en el modelo Estudiante
    // nationality, birthMunicipalityId, birthCity, nativeLanguageId, disabilityTypeId
    // se manejan en otras tablas relacionadas
    const specificFields = {
      userId: model.usuarioId,
      studentCode: model.codigoEstudiante,
      ci: model.ci,
      expedition: model.expedicion,
      firstName: model.nombres,
      lastName: model.apellidoPaterno,
      motherLastName: model.apellidoMaterno,
      birthDate: model.fechaNacimiento,
      gender: model.genero,
      civilStatusId: model.estadoCivilId,
      bloodType: model.tipoSangre,
      hasDisability: model.tieneDiscapacidad === 1 || model.tieneDiscapacidad === true,
      // TODO: Estos campos están comentados en el modelo, se manejan en estudiantes_discapacidades
      // disabilityDegree: null,
      // disabilityDetails: null,
      personalEmail: model.emailPersonal,
      mobilePhone: model.celular,
      landlinePhone: model.telefonoFijo,
      address: model.direccion,
      residenceMunicipalityId: model.municipioResidenciaId,
      zone: model.zona,
      observations: model.observaciones,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Student(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Student|Object} entity - Entidad Student o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Student como objeto plano
    const data = entity instanceof Student ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      usuarioId: data.userId || null,
      codigoEstudiante: data.studentCode,
      ci: data.ci,
      expedicion: data.expedition ? data.expedition.toUpperCase() : null,
      nombres: data.firstName,
      apellidoPaterno: data.lastName,
      apellidoMaterno: data.motherLastName || null,
      fechaNacimiento: data.birthDate,
      genero: data.gender,
      estadoCivilId: data.civilStatusId || null,
      tipoSangre: data.bloodType || null,
      tieneDiscapacidad: data.hasDisability !== undefined ? data.hasDisability : false,
      // TODO: Estos campos están comentados en el modelo
      // gradoInvalidez: data.disabilityDegree || null,
      // detallesDiscapacidad: data.disabilityDetails || null,
      emailPersonal: data.personalEmail ? data.personalEmail.toLowerCase() : null,
      celular: data.mobilePhone,
      telefonoFijo: data.landlinePhone || null,
      direccion: data.address || null,
      municipioResidenciaId: data.residenceMunicipalityId || null,
      zona: data.zone || null,
      observaciones: data.observations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Student
   * 
   * @param {Student|Object} entity - Entidad Student o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Student como objeto plano
    const data = entity instanceof Student ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Student
    // IMPORTANTE: Incluir todos los campos que vienen en data, incluso si son null
    // Esto permite actualizar campos a null (limpiarlos)
    if (data.userId !== undefined) {
      updateData.usuarioId = data.userId || null;
    }
    if (data.studentCode !== undefined) {
      updateData.codigoEstudiante = data.studentCode;
    }
    if (data.ci !== undefined) {
      // Permitir null para limpiar CI (aunque normalmente no debería ser null)
      updateData.ci = data.ci;
    }
    if (data.expedition !== undefined) {
      updateData.expedicion = data.expedition ? data.expedition.toUpperCase() : null;
    }
    if (data.firstName !== undefined) {
      // Permitir null para limpiar nombre (aunque normalmente no debería ser null)
      updateData.nombres = data.firstName;
    }
    if (data.lastName !== undefined) {
      // Permitir null para limpiar apellido (aunque normalmente no debería ser null)
      updateData.apellidoPaterno = data.lastName;
    }
    if (data.motherLastName !== undefined) {
      updateData.apellidoMaterno = data.motherLastName || null;
    }
    if (data.birthDate !== undefined) {
      updateData.fechaNacimiento = data.birthDate;
    }
    if (data.gender !== undefined) {
      updateData.genero = data.gender;
    }
    if (data.civilStatusId !== undefined) {
      updateData.estadoCivilId = data.civilStatusId || null;
    }
    if (data.bloodType !== undefined) {
      updateData.tipoSangre = data.bloodType || null;
    }
    if (data.hasDisability !== undefined) {
      updateData.tieneDiscapacidad = data.hasDisability;
    }
    // TODO: Estos campos están comentados en el modelo
    // if (data.disabilityDegree !== undefined) {
    //   updateData.gradoInvalidez = data.disabilityDegree || null;
    // }
    // if (data.disabilityDetails !== undefined) {
    //   updateData.detallesDiscapacidad = data.disabilityDetails || null;
    // }
    if (data.personalEmail !== undefined) {
      updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null;
    }
    if (data.mobilePhone !== undefined) {
      updateData.celular = data.mobilePhone;
    }
    if (data.landlinePhone !== undefined) {
      updateData.telefonoFijo = data.landlinePhone || null;
    }
    if (data.address !== undefined) {
      updateData.direccion = data.address || null;
    }
    if (data.residenceMunicipalityId !== undefined) {
      updateData.municipioResidenciaId = data.residenceMunicipalityId || null;
    }
    if (data.zone !== undefined) {
      updateData.zona = data.zone || null;
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
   * @returns {Student[]} Array de entidades Student
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

