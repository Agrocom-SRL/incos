import { Staff } from '../../domain/entities/Staff.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StaffMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Staff)
 *
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Staff
 *
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Staff
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 *
 * Clean Architecture:
 * - Domain Layer: Staff (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StaffMapper (campos específicos)
 * - Infrastructure Layer: StaffRepository (usa el mapper para conversiones)
 */
export class StaffMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Staff
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de Personal
   * @returns {Staff|null} Entidad de dominio Staff
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Staff (campos del dominio)
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
    if ('emailPersonal' in dataValues && dataValues.emailPersonal !== undefined) {
      specificFields.personalEmail = dataValues.emailPersonal;
    }
    if ('telefono' in dataValues && dataValues.telefono !== undefined) {
      specificFields.phone = dataValues.telefono;
    }
    if ('celular' in dataValues && dataValues.celular !== undefined) {
      specificFields.mobilePhone = dataValues.celular;
    }
    if ('direccion' in dataValues && dataValues.direccion !== undefined) {
      specificFields.address = dataValues.direccion;
    }
    if ('municipioId' in dataValues && dataValues.municipioId !== undefined) {
      specificFields.municipalityId = dataValues.municipioId;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new Staff(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {Staff|Object} entity - Entidad Staff o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Staff como objeto plano
    const data = entity instanceof Staff ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      usuarioId: data.userId || null,
      ci: data.ci,
      expedicion:
        data.expedition != null && String(data.expedition).trim() !== ''
          ? String(data.expedition).trim().toUpperCase()
          : null,
      nombres: data.firstName,
      apellidoPaterno: data.lastName,
      apellidoMaterno: data.motherLastName || null,
      fechaNacimiento: data.birthDate || null,
      genero: data.gender || null,
      estadoCivilId: data.civilStatusId || null,
      emailPersonal: data.personalEmail ? data.personalEmail.toLowerCase() : null,
      telefono: data.phone || null,
      celular: data.mobilePhone || null,
      direccion: data.address || null,
      municipioId: data.municipalityId || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Staff
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {Staff|Object} entity - Entidad Staff o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Staff como objeto plano
    const data = entity instanceof Staff ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Staff
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('userId' in data) { updateData.usuarioId = data.userId || null; }
    if ('ci' in data) { updateData.ci = data.ci; }
    if ('expedition' in data) {
      updateData.expedicion =
        data.expedition != null && String(data.expedition).trim() !== ''
          ? String(data.expedition).trim().toUpperCase()
          : null;
    }
    if ('firstName' in data) { updateData.nombres = data.firstName; }
    if ('lastName' in data) { updateData.apellidoPaterno = data.lastName; }
    if ('motherLastName' in data) { updateData.apellidoMaterno = data.motherLastName || null; }
    if ('birthDate' in data) { updateData.fechaNacimiento = data.birthDate || null; }
    if ('gender' in data) { updateData.genero = data.gender || null; }
    if ('civilStatusId' in data) { updateData.estadoCivilId = data.civilStatusId || null; }
    if ('personalEmail' in data) { updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null; }
    if ('phone' in data) { updateData.telefono = data.phone || null; }
    if ('mobilePhone' in data) { updateData.celular = data.mobilePhone || null; }
    if ('address' in data) { updateData.direccion = data.address || null; }
    if ('municipalityId' in data) { updateData.municipioId = data.municipalityId || null; }

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   *
   * @param {Array} models - Array de modelos Sequelize
   * @returns {Staff[]} Array de entidades Staff
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
