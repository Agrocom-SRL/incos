import { Teacher } from '../../domain/entities/Teacher.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: TeacherMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Teacher)
 *
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Teacher
 *
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Teacher
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 *
 * Clean Architecture:
 * - Domain Layer: Teacher (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + TeacherMapper (campos específicos)
 * - Infrastructure Layer: TeacherRepository (usa el mapper para conversiones)
 */
export class TeacherMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Teacher
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de Docente
   * @returns {Teacher|null} Entidad de dominio Teacher
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Teacher (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('usuarioId' in dataValues && dataValues.usuarioId !== undefined) {
      specificFields.userId = dataValues.usuarioId;
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
    if ('nacionalidad' in dataValues && dataValues.nacionalidad !== undefined) {
      specificFields.nationality = dataValues.nacionalidad;
    }
    if ('telefono' in dataValues && dataValues.telefono !== undefined) {
      specificFields.phone = dataValues.telefono;
    }
    if ('celular' in dataValues && dataValues.celular !== undefined) {
      specificFields.mobilePhone = dataValues.celular;
    }
    if ('emailPersonal' in dataValues && dataValues.emailPersonal !== undefined) {
      specificFields.personalEmail = dataValues.emailPersonal;
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
    if ('tituloProfesional' in dataValues && dataValues.tituloProfesional !== undefined) {
      specificFields.professionalTitle = dataValues.tituloProfesional;
    }
    if ('especialidad' in dataValues && dataValues.especialidad !== undefined) {
      specificFields.specialty = dataValues.especialidad;
    }
    if ('nivelAcademico' in dataValues && dataValues.nivelAcademico !== undefined) {
      specificFields.academicLevel = dataValues.nivelAcademico;
    }
    if ('institucionEgreso' in dataValues && dataValues.institucionEgreso !== undefined) {
      specificFields.graduationInstitution = dataValues.institucionEgreso;
    }
    if ('anioEgreso' in dataValues && dataValues.anioEgreso !== undefined) {
      specificFields.graduationYear = dataValues.anioEgreso;
    }
    if ('aniosExperiencia' in dataValues && dataValues.aniosExperiencia !== undefined) {
      specificFields.yearsOfExperience = dataValues.aniosExperiencia;
    }
    if ('fechaContratacion' in dataValues && dataValues.fechaContratacion !== undefined) {
      specificFields.hireDate = dataValues.fechaContratacion;
    }
    if ('fechaRetiro' in dataValues && dataValues.fechaRetiro !== undefined) {
      specificFields.retirementDate = dataValues.fechaRetiro;
    }
    if ('tipoContrato' in dataValues && dataValues.tipoContrato !== undefined) {
      specificFields.contractType = dataValues.tipoContrato;
    }
    if ('estadoLaboral' in dataValues && dataValues.estadoLaboral !== undefined) {
      specificFields.laborState = dataValues.estadoLaboral;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }
    if ('colorHex' in dataValues && dataValues.colorHex !== undefined) {
      specificFields.colorHex = dataValues.colorHex;
    }
    if ('maxHorasSemana' in dataValues && dataValues.maxHorasSemana !== undefined) {
      specificFields.maxHorasSemana = dataValues.maxHorasSemana;
    }
    if ('maxHorasMes' in dataValues && dataValues.maxHorasMes !== undefined) {
      specificFields.maxHorasMes = dataValues.maxHorasMes;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new Teacher(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {Teacher|Object} entity - Entidad Teacher o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Teacher como objeto plano
    const data = entity instanceof Teacher ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      usuarioId: data.userId || null,
      ci: data.ci,
      expedicion: data.expedition ? data.expedition.toUpperCase() : null,
      nombres: data.firstName,
      apellidoPaterno: data.lastName,
      apellidoMaterno: data.motherLastName || null,
      fechaNacimiento: data.birthDate,
      genero: data.gender,
      estadoCivilId: data.civilStatusId || null,
      nacionalidad: data.nationality || 'Boliviana',
      telefono: data.phone || null,
      celular: data.mobilePhone,
      emailPersonal: data.personalEmail ? data.personalEmail.toLowerCase() : null,
      direccion: data.address || null,
      municipioResidenciaId: data.residenceMunicipalityId || null,
      zona: data.zone || null,
      tituloProfesional: data.professionalTitle || null,
      especialidad: data.specialty || null,
      nivelAcademico: data.academicLevel || 'LICENCIATURA',
      institucionEgreso: data.graduationInstitution || null,
      anioEgreso: data.graduationYear || null,
      aniosExperiencia: data.yearsOfExperience !== undefined ? data.yearsOfExperience : 0,
      fechaContratacion: data.hireDate || null,
      fechaRetiro: data.retirementDate || null,
      tipoContrato: data.contractType || 'CONTRATO',
      estadoLaboral: data.laborState || 'ACTIVO',
      observaciones: data.observations || null,
      colorHex: data.colorHex || null,
      maxHorasSemana: data.maxHorasSemana ?? 20,
      maxHorasMes: data.maxHorasMes ?? 80,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Teacher
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {Teacher|Object} entity - Entidad Teacher o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Teacher como objeto plano
    const data = entity instanceof Teacher ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Teacher
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('userId' in data) { updateData.usuarioId = data.userId || null; }
    if ('ci' in data) { updateData.ci = data.ci; }
    if ('expedition' in data) { updateData.expedicion = data.expedition ? data.expedition.toUpperCase() : null; }
    if ('firstName' in data) { updateData.nombres = data.firstName; }
    if ('lastName' in data) { updateData.apellidoPaterno = data.lastName; }
    if ('motherLastName' in data) { updateData.apellidoMaterno = data.motherLastName || null; }
    if ('birthDate' in data) { updateData.fechaNacimiento = data.birthDate; }
    if ('gender' in data) { updateData.genero = data.gender; }
    if ('civilStatusId' in data) { updateData.estadoCivilId = data.civilStatusId || null; }
    if ('nationality' in data) { updateData.nacionalidad = data.nationality; }
    if ('phone' in data) { updateData.telefono = data.phone || null; }
    if ('mobilePhone' in data) { updateData.celular = data.mobilePhone; }
    if ('personalEmail' in data) { updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null; }
    if ('address' in data) { updateData.direccion = data.address || null; }
    if ('residenceMunicipalityId' in data) { updateData.municipioResidenciaId = data.residenceMunicipalityId || null; }
    if ('zone' in data) { updateData.zona = data.zone || null; }
    if ('professionalTitle' in data) { updateData.tituloProfesional = data.professionalTitle || null; }
    if ('specialty' in data) { updateData.especialidad = data.specialty || null; }
    if ('academicLevel' in data) { updateData.nivelAcademico = data.academicLevel; }
    if ('graduationInstitution' in data) { updateData.institucionEgreso = data.graduationInstitution || null; }
    if ('graduationYear' in data) { updateData.anioEgreso = data.graduationYear || null; }
    if ('yearsOfExperience' in data) { updateData.aniosExperiencia = data.yearsOfExperience; }
    if ('hireDate' in data) { updateData.fechaContratacion = data.hireDate || null; }
    if ('retirementDate' in data) { updateData.fechaRetiro = data.retirementDate || null; }
    if ('contractType' in data) { updateData.tipoContrato = data.contractType; }
    if ('laborState' in data) { updateData.estadoLaboral = data.laborState; }
    if ('observations' in data) { updateData.observaciones = data.observations || null; }
    if ('colorHex' in data) { updateData.colorHex = data.colorHex || null; }
    if ('maxHorasSemana' in data) { updateData.maxHorasSemana = data.maxHorasSemana ?? null; }
    if ('maxHorasMes' in data) { updateData.maxHorasMes = data.maxHorasMes ?? null; }

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   *
   * @param {Array} models - Array de modelos Sequelize
   * @returns {Teacher[]} Array de entidades Teacher
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
