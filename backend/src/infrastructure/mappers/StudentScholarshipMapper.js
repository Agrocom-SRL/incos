import { StudentScholarship } from '../../domain/entities/StudentScholarship.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentScholarshipMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentScholarship)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentScholarship
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentScholarship
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudentScholarship (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentScholarshipMapper (campos específicos)
 * - Infrastructure Layer: StudentScholarshipRepository (usa el mapper para conversiones)
 */
export class StudentScholarshipMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentScholarship
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de EstudianteBeca
   * @returns {StudentScholarship|null} Entidad de dominio StudentScholarship
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentScholarship (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('becaDescuentoId' in dataValues && dataValues.becaDescuentoId !== undefined) {
      specificFields.scholarshipId = dataValues.becaDescuentoId;
    }
    if ('gestionId' in dataValues && dataValues.gestionId !== undefined) {
      specificFields.managementId = dataValues.gestionId;
    }
    if ('fechaSolicitud' in dataValues && dataValues.fechaSolicitud !== undefined) {
      specificFields.requestDate = dataValues.fechaSolicitud;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }
    if ('documentosCompletos' in dataValues && dataValues.documentosCompletos !== undefined) {
      specificFields.documentsComplete = dataValues.documentosCompletos === 1 || dataValues.documentosCompletos === true;
    }
    if ('fechaInicioEntregaDocumentos' in dataValues && dataValues.fechaInicioEntregaDocumentos !== undefined) {
      specificFields.documentDeliveryStartDate = dataValues.fechaInicioEntregaDocumentos;
    }
    if ('fechaFinEntregaDocumentos' in dataValues && dataValues.fechaFinEntregaDocumentos !== undefined) {
      specificFields.documentDeliveryEndDate = dataValues.fechaFinEntregaDocumentos;
    }
    if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
      specificFields.observations = dataValues.observaciones;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new StudentScholarship(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Esto permite que los campos con DEFAULT en el schema se manejen automáticamente por la BD
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * NOTA: Solo incluir campos que NO tienen DEFAULT en el schema:
   * - estado: DEFAULT 'PENDIENTE' → NO incluir si no está en la entidad
   * - documentos_completos: DEFAULT FALSE → NO incluir si no está en la entidad
   * - fecha_inicio_entrega_documentos: NULL por defecto → NO incluir si no está en la entidad
   * - fecha_fin_entrega_documentos: NULL por defecto → NO incluir si no está en la entidad
   * 
   * @param {StudentScholarship|Object} entity - Entidad StudentScholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentScholarship como objeto plano
    const data = entity instanceof StudentScholarship ? entity.toPlainObject() : entity;
    const modelData = {};

    // Campos específicos de StudentScholarship
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Esto permite que los campos con DEFAULT se manejen automáticamente por la BD
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      modelData.estudianteId = data.studentId || null;
    }
    if ('scholarshipId' in data) {
      modelData.becaDescuentoId = data.scholarshipId || null;
    }
    if ('managementId' in data) {
      modelData.gestionId = data.managementId || null;
    }
    if ('requestDate' in data) {
      modelData.fechaSolicitud = data.requestDate;
    }
    // Solo incluir estado si está definido (tiene DEFAULT 'PENDIENTE' en el schema)
    if ('state' in data) {
      modelData.estado = data.state;
    }
    // Solo incluir documentosCompletos si está definido (tiene DEFAULT FALSE en el schema)
    if ('documentsComplete' in data) {
      modelData.documentosCompletos = data.documentsComplete;
    }
    // Solo incluir fechas de entrega si están definidas (NULL por defecto)
    if ('documentDeliveryStartDate' in data) {
      modelData.fechaInicioEntregaDocumentos = data.documentDeliveryStartDate || null;
    }
    if ('documentDeliveryEndDate' in data) {
      modelData.fechaFinEntregaDocumentos = data.documentDeliveryEndDate || null;
    }
    // Solo incluir observaciones si está definido (NULL por defecto)
    if ('observations' in data) {
      modelData.observaciones = data.observations || null;
    }

    return modelData;
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentScholarship
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {StudentScholarship|Object} entity - Entidad StudentScholarship o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentScholarship como objeto plano
    const data = entity instanceof StudentScholarship ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentScholarship
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId || null;
    }
    if ('scholarshipId' in data) {
      updateData.becaDescuentoId = data.scholarshipId || null;
    }
    if ('managementId' in data) {
      updateData.gestionId = data.managementId || null;
    }
    if ('requestDate' in data) {
      updateData.fechaSolicitud = data.requestDate;
    }
    if ('state' in data) {
      updateData.estado = data.state;
    }
    if ('documentsComplete' in data) {
      updateData.documentosCompletos = data.documentsComplete;
    }
    if ('documentDeliveryStartDate' in data) {
      updateData.fechaInicioEntregaDocumentos = data.documentDeliveryStartDate || null;
    }
    if ('documentDeliveryEndDate' in data) {
      updateData.fechaFinEntregaDocumentos = data.documentDeliveryEndDate || null;
    }
    if ('observations' in data) {
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
   * @returns {StudentScholarship[]} Array de entidades StudentScholarship
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

