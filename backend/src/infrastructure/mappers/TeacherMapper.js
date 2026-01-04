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
   * 
   * @param {Object|null} model - Modelo Sequelize de Docente
   * @returns {Teacher|null} Entidad de dominio Teacher
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Teacher (campos del dominio)
    const specificFields = {
      userId: model.usuarioId,
      ci: model.ci,
      expedition: model.expedicion,
      firstName: model.nombres,
      lastName: model.apellidoPaterno,
      motherLastName: model.apellidoMaterno,
      birthDate: model.fechaNacimiento,
      gender: model.genero,
      civilStatusId: model.estadoCivilId,
      nationality: model.nacionalidad,
      phone: model.telefono,
      mobilePhone: model.celular,
      personalEmail: model.emailPersonal,
      address: model.direccion,
      residenceMunicipalityId: model.municipioResidenciaId,
      zone: model.zona,
      professionalTitle: model.tituloProfesional,
      specialty: model.especialidad,
      academicLevel: model.nivelAcademico,
      graduationInstitution: model.institucionEgreso,
      graduationYear: model.anioEgreso,
      yearsOfExperience: model.aniosExperiencia,
      hireDate: model.fechaContratacion,
      retirementDate: model.fechaRetiro,
      contractType: model.tipoContrato,
      laborState: model.estadoLaboral,
      weeklyHours: model.cargaHorariaSemanal,
      bank: model.banco,
      accountNumber: model.numeroCuenta,
      observations: model.observaciones,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Teacher(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Teacher|Object} entity - Entidad Teacher o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Teacher como objeto plano
    const data = entity instanceof Teacher ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
      cargaHorariaSemanal: data.weeklyHours !== undefined ? data.weeklyHours : 0,
      banco: data.bank || null,
      numeroCuenta: data.accountNumber || null,
      observaciones: data.observations || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Teacher
   * 
   * @param {Teacher|Object} entity - Entidad Teacher o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Teacher como objeto plano
    const data = entity instanceof Teacher ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Teacher
    if (data.userId !== undefined) { updateData.usuarioId = data.userId || null; }
    if (data.ci !== undefined) { updateData.ci = data.ci; }
    if (data.expedition !== undefined) { updateData.expedicion = data.expedition ? data.expedition.toUpperCase() : null; }
    if (data.firstName !== undefined) { updateData.nombres = data.firstName; }
    if (data.lastName !== undefined) { updateData.apellidoPaterno = data.lastName; }
    if (data.motherLastName !== undefined) { updateData.apellidoMaterno = data.motherLastName || null; }
    if (data.birthDate !== undefined) { updateData.fechaNacimiento = data.birthDate; }
    if (data.gender !== undefined) { updateData.genero = data.gender; }
    if (data.civilStatusId !== undefined) { updateData.estadoCivilId = data.civilStatusId || null; }
    if (data.nationality !== undefined) { updateData.nacionalidad = data.nationality; }
    if (data.phone !== undefined) { updateData.telefono = data.phone || null; }
    if (data.mobilePhone !== undefined) { updateData.celular = data.mobilePhone; }
    if (data.personalEmail !== undefined) { updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null; }
    if (data.address !== undefined) { updateData.direccion = data.address || null; }
    if (data.residenceMunicipalityId !== undefined) { updateData.municipioResidenciaId = data.residenceMunicipalityId || null; }
    if (data.zone !== undefined) { updateData.zona = data.zone || null; }
    if (data.professionalTitle !== undefined) { updateData.tituloProfesional = data.professionalTitle || null; }
    if (data.specialty !== undefined) { updateData.especialidad = data.specialty || null; }
    if (data.academicLevel !== undefined) { updateData.nivelAcademico = data.academicLevel; }
    if (data.graduationInstitution !== undefined) { updateData.institucionEgreso = data.graduationInstitution || null; }
    if (data.graduationYear !== undefined) { updateData.anioEgreso = data.graduationYear || null; }
    if (data.yearsOfExperience !== undefined) { updateData.aniosExperiencia = data.yearsOfExperience; }
    if (data.hireDate !== undefined) { updateData.fechaContratacion = data.hireDate || null; }
    if (data.retirementDate !== undefined) { updateData.fechaRetiro = data.retirementDate || null; }
    if (data.contractType !== undefined) { updateData.tipoContrato = data.contractType; }
    if (data.laborState !== undefined) { updateData.estadoLaboral = data.laborState; }
    if (data.weeklyHours !== undefined) { updateData.cargaHorariaSemanal = data.weeklyHours; }
    if (data.bank !== undefined) { updateData.banco = data.bank || null; }
    if (data.accountNumber !== undefined) { updateData.numeroCuenta = data.accountNumber || null; }
    if (data.observations !== undefined) { updateData.observaciones = data.observations || null; }

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

