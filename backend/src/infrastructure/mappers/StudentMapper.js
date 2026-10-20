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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de Estudiante
   * @returns {Student|null} Entidad de dominio Student
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Student (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    // NOTA: Solo mapeamos campos que existen en el modelo Estudiante
    // nationality, birthMunicipalityId, birthCity, nativeLanguageId, disabilityTypeId
    // se manejan en otras tablas relacionadas
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('usuarioId' in dataValues && dataValues.usuarioId !== undefined) {
      specificFields.userId = dataValues.usuarioId;
    }
    if ('codigoEstudiante' in dataValues && dataValues.codigoEstudiante !== undefined) {
      specificFields.studentCode = dataValues.codigoEstudiante;
    }
    if ('ci' in dataValues && dataValues.ci !== undefined) {
      specificFields.ci = dataValues.ci;
    }
    if ('expedicion' in dataValues && dataValues.expedicion !== undefined) {
      specificFields.expedition = dataValues.expedicion;
    }
    if ('nombres' in dataValues && dataValues.nombres !== undefined) {
      specificFields.firstName = dataValues.nombres;
    }
    if ('apellidoPaterno' in dataValues && dataValues.apellidoPaterno !== undefined) {
      specificFields.lastName = dataValues.apellidoPaterno;
    }
    if ('apellidoMaterno' in dataValues && dataValues.apellidoMaterno !== undefined) {
      specificFields.motherLastName = dataValues.apellidoMaterno;
    }
    if ('fechaNacimiento' in dataValues && dataValues.fechaNacimiento !== undefined) {
      specificFields.birthDate = dataValues.fechaNacimiento;
    }
    if ('genero' in dataValues && dataValues.genero !== undefined) {
      specificFields.gender = dataValues.genero;
    }
    if ('estadoCivilId' in dataValues && dataValues.estadoCivilId !== undefined) {
      specificFields.civilStatusId = dataValues.estadoCivilId;
    }
    if ('tipoSangre' in dataValues && dataValues.tipoSangre !== undefined) {
      specificFields.bloodType = dataValues.tipoSangre;
    }
    if ('tieneDiscapacidad' in dataValues && dataValues.tieneDiscapacidad !== undefined) {
      specificFields.hasDisability = dataValues.tieneDiscapacidad === 1 || dataValues.tieneDiscapacidad === true;
    }
    // TODO: Estos campos están comentados en el modelo, se manejan en estudiantes_discapacidades
    // disabilityDegree: null,
    // disabilityDetails: null,
    if ('emailPersonal' in dataValues && dataValues.emailPersonal !== undefined) {
      specificFields.personalEmail = dataValues.emailPersonal;
    }
    if ('celular' in dataValues && dataValues.celular !== undefined) {
      specificFields.mobilePhone = dataValues.celular;
    }
    if ('telefonoFijo' in dataValues && dataValues.telefonoFijo !== undefined) {
      specificFields.landlinePhone = dataValues.telefonoFijo;
    }
    if ('direccion' in dataValues && dataValues.direccion !== undefined) {
      specificFields.address = dataValues.direccion;
    }
    if ('municipioResidenciaId' in dataValues && dataValues.municipioResidenciaId !== undefined) {
      specificFields.residenceMunicipalityId = dataValues.municipioResidenciaId;
    }
    if ('zona' in dataValues && dataValues.zona !== undefined) {
      specificFields.zone = dataValues.zona;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }
    if ('trabaja' in dataValues && dataValues.trabaja !== undefined) {
      specificFields.works = dataValues.trabaja === 1 || dataValues.trabaja === true;
    }
    if ('empresaInstitucion' in dataValues && dataValues.empresaInstitucion !== undefined) {
      specificFields.employerInstitution = dataValues.empresaInstitucion;
    }
    if ('cargo' in dataValues && dataValues.cargo !== undefined) {
      specificFields.position = dataValues.cargo;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new Student(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {Student|Object} entity - Entidad Student o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Student como objeto plano
    const data = entity instanceof Student ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
      trabaja: data.works !== undefined ? data.works : false,
      empresaInstitucion: data.employerInstitution || null,
      cargo: data.position || null,
      observaciones: data.observations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Student
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {Student|Object} entity - Entidad Student o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Student como objeto plano
    const data = entity instanceof Student ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Student
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // IMPORTANTE: Incluir todos los campos que vienen en data, incluso si son null
    // Esto permite actualizar campos a null (limpiarlos)
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('userId' in data) {
      updateData.usuarioId = data.userId || null;
    }
    if ('studentCode' in data) {
      updateData.codigoEstudiante = data.studentCode;
    }
    if ('ci' in data) {
      // Permitir null para limpiar CI (aunque normalmente no debería ser null)
      updateData.ci = data.ci;
    }
    if ('expedition' in data) {
      updateData.expedicion = data.expedition ? data.expedition.toUpperCase() : null;
    }
    if ('firstName' in data) {
      // Permitir null para limpiar nombre (aunque normalmente no debería ser null)
      updateData.nombres = data.firstName;
    }
    if ('lastName' in data) {
      // Permitir null para limpiar apellido (aunque normalmente no debería ser null)
      updateData.apellidoPaterno = data.lastName;
    }
    if ('motherLastName' in data) {
      updateData.apellidoMaterno = data.motherLastName || null;
    }
    if ('birthDate' in data) {
      updateData.fechaNacimiento = data.birthDate;
    }
    if ('gender' in data) {
      updateData.genero = data.gender;
    }
    if ('civilStatusId' in data) {
      updateData.estadoCivilId = data.civilStatusId || null;
    }
    if ('bloodType' in data) {
      updateData.tipoSangre = data.bloodType || null;
    }
    if ('hasDisability' in data) {
      updateData.tieneDiscapacidad = data.hasDisability;
    }
    if ('personalEmail' in data) {
      updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null;
    }
    if ('mobilePhone' in data) {
      updateData.celular = data.mobilePhone;
    }
    if ('landlinePhone' in data) {
      updateData.telefonoFijo = data.landlinePhone || null;
    }
    if ('address' in data) {
      updateData.direccion = data.address || null;
    }
    if ('residenceMunicipalityId' in data) {
      updateData.municipioResidenciaId = data.residenceMunicipalityId || null;
    }
    if ('zone' in data) {
      updateData.zona = data.zone || null;
    }
    if ('observations' in data) {
      updateData.observaciones = data.observations || null;
    }
    if ('works' in data) {
      updateData.trabaja = data.works;
    }
    if ('employerInstitution' in data) {
      updateData.empresaInstitucion = data.employerInstitution || null;
    }
    if ('position' in data) {
      updateData.cargo = data.position || null;
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
