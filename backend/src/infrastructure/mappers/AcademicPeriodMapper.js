import { AcademicPeriod } from '../../domain/entities/AcademicPeriod.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: AcademicPeriodMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (AcademicPeriod)
 *
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de AcademicPeriod
 *
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de AcademicPeriod
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 *
 * Clean Architecture:
 * - Domain Layer: AcademicPeriod (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + AcademicPeriodMapper (campos específicos)
 * - Infrastructure Layer: AcademicPeriodRepository (usa el mapper para conversiones)
 */
export class AcademicPeriodMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de AcademicPeriod
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de PeriodoAcademico
   * @returns {AcademicPeriod|null} Entidad de dominio AcademicPeriod
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de AcademicPeriod (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('gestionId' in dataValues && dataValues.gestionId !== undefined) {
      specificFields.managementId = dataValues.gestionId ?? null;
    }
    if ('codigo' in dataValues && dataValues.codigo !== undefined) {
      specificFields.code = dataValues.codigo ?? null;
    }
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }
    if ('division' in dataValues && dataValues.division !== undefined) {
      specificFields.division = dataValues.division;
    }
    if ('numeroOrden' in dataValues && dataValues.numeroOrden !== undefined) {
      specificFields.orderNumber = dataValues.numeroOrden ?? null;
    }
    if ('fechaInicio' in dataValues && dataValues.fechaInicio !== undefined) {
      specificFields.startDate = dataValues.fechaInicio;
    }
    if ('fechaFin' in dataValues && dataValues.fechaFin !== undefined) {
      specificFields.endDate = dataValues.fechaFin;
    }
    if ('colorHex' in dataValues && dataValues.colorHex !== undefined) {
      specificFields.colorHex = dataValues.colorHex ?? null;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new AcademicPeriod(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {AcademicPeriod|Object} entity - Entidad AcademicPeriod o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad AcademicPeriod como objeto plano
    const data = entity instanceof AcademicPeriod ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      gestionId: data.managementId ?? null,
      codigo: data.code ?? null,
      nombre: data.name,
      division: data.division,
      numeroOrden: data.orderNumber ?? null,
      fechaInicio: data.startDate,
      fechaFin: data.endDate,
      colorHex: data.colorHex ?? null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de AcademicPeriod
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {AcademicPeriod|Object} entity - Entidad AcademicPeriod o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad AcademicPeriod como objeto plano
    const data = entity instanceof AcademicPeriod ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de AcademicPeriod
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('managementId' in data) {
      updateData.gestionId = data.managementId ?? null;
    }
    if ('code' in data) {
      updateData.codigo = data.code ?? null;
    }
    if ('name' in data) {
      updateData.nombre = data.name;
    }
    if ('division' in data) {
      updateData.division = data.division;
    }
    if ('orderNumber' in data) {
      updateData.numeroOrden = data.orderNumber ?? null;
    }
    if ('startDate' in data) {
      updateData.fechaInicio = data.startDate;
    }
    if ('endDate' in data) {
      updateData.fechaFin = data.endDate;
    }
    if ('colorHex' in data) {
      updateData.colorHex = data.colorHex ?? null;
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
   * @returns {AcademicPeriod[]} Array de entidades AcademicPeriod
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
