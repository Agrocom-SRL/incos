import { Subject } from '../../domain/entities/Subject.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: SubjectMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Subject)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Subject
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Subject
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Subject (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + SubjectMapper (campos específicos)
 * - Infrastructure Layer: SubjectRepository (usa el mapper para conversiones)
 */
export class SubjectMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Subject
   * 
   * @param {Object|null} model - Modelo Sequelize de Materia
   * @returns {Subject|null} Entidad de dominio Subject
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Subject (campos del dominio)
    const specificFields = {
      code: model.codigo,
      name: model.nombre,
      shortName: model.nombreCorto,
      description: model.descripcion,
      theoreticalHours: model.cargaHorariaTeorica,
      practicalHours: model.cargaHorariaPractica,
      credits: model.creditos,
      type: model.tipo,
      knowledgeArea: model.areaConocimiento,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Subject(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Subject|Object} entity - Entidad Subject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Subject como objeto plano
    const data = entity instanceof Subject ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      codigo: data.code,
      nombre: data.name,
      nombreCorto: data.shortName || null,
      descripcion: data.description || null,
      cargaHorariaTeorica: data.theoreticalHours !== undefined ? data.theoreticalHours : 0,
      cargaHorariaPractica: data.practicalHours !== undefined ? data.practicalHours : 0,
      creditos: data.credits || null,
      tipo: data.type || 'TEORICA_PRACTICA',
      areaConocimiento: data.knowledgeArea || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Subject
   * 
   * @param {Subject|Object} entity - Entidad Subject o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Subject como objeto plano
    const data = entity instanceof Subject ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Subject
    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.shortName !== undefined) {
      updateData.nombreCorto = data.shortName || null;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.theoreticalHours !== undefined) {
      updateData.cargaHorariaTeorica = data.theoreticalHours;
    }
    if (data.practicalHours !== undefined) {
      updateData.cargaHorariaPractica = data.practicalHours;
    }
    if (data.credits !== undefined) {
      updateData.creditos = data.credits || null;
    }
    if (data.type !== undefined) {
      updateData.tipo = data.type;
    }
    if (data.knowledgeArea !== undefined) {
      updateData.areaConocimiento = data.knowledgeArea || null;
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
   * @returns {Subject[]} Array de entidades Subject
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

