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
   * 
   * @param {Object|null} model - Modelo Sequelize de Personal
   * @returns {Staff|null} Entidad de dominio Staff
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Staff (campos del dominio)
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
      personalEmail: model.emailPersonal,
      phone: model.telefono,
      mobilePhone: model.celular,
      address: model.direccion,
      municipalityId: model.municipioId,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Staff(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Staff|Object} entity - Entidad Staff o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Staff como objeto plano
    const data = entity instanceof Staff ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      usuarioId: data.userId || null,
      ci: data.ci,
      expedicion: data.expedition ? data.expedition.toUpperCase() : null,
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
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Staff
   * 
   * @param {Staff|Object} entity - Entidad Staff o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Staff como objeto plano
    const data = entity instanceof Staff ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Staff
    if (data.userId !== undefined) { updateData.usuarioId = data.userId || null; }
    if (data.ci !== undefined) { updateData.ci = data.ci; }
    if (data.expedition !== undefined) { updateData.expedicion = data.expedition ? data.expedition.toUpperCase() : null; }
    if (data.firstName !== undefined) { updateData.nombres = data.firstName; }
    if (data.lastName !== undefined) { updateData.apellidoPaterno = data.lastName; }
    if (data.motherLastName !== undefined) { updateData.apellidoMaterno = data.motherLastName || null; }
    if (data.birthDate !== undefined) { updateData.fechaNacimiento = data.birthDate || null; }
    if (data.gender !== undefined) { updateData.genero = data.gender || null; }
    if (data.civilStatusId !== undefined) { updateData.estadoCivilId = data.civilStatusId || null; }
    if (data.personalEmail !== undefined) { updateData.emailPersonal = data.personalEmail ? data.personalEmail.toLowerCase() : null; }
    if (data.phone !== undefined) { updateData.telefono = data.phone || null; }
    if (data.mobilePhone !== undefined) { updateData.celular = data.mobilePhone || null; }
    if (data.address !== undefined) { updateData.direccion = data.address || null; }
    if (data.municipalityId !== undefined) { updateData.municipioId = data.municipalityId || null; }

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

