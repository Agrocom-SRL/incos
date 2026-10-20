import { StudentDocument } from '../../domain/entities/StudentDocument.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudentDocumentMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudentDocument)
 *
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudentDocument
 *
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudentDocument
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 *
 * Clean Architecture:
 * - Domain Layer: StudentDocument (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudentDocumentMapper (campos específicos)
 * - Infrastructure Layer: StudentDocumentRepository (usa el mapper para conversiones)
 */
export class StudentDocumentMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDocument
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   *
   * Flujo: Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de DocumentoEstudiante
   * @returns {StudentDocument|null} Entidad de dominio StudentDocument
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentDocument (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('estudianteId' in dataValues && dataValues.estudianteId !== undefined) {
      specificFields.studentId = dataValues.estudianteId;
    }
    if ('tipoDocumento' in dataValues && dataValues.tipoDocumento !== undefined) {
      specificFields.tipoDocumento = dataValues.tipoDocumento;
    }
    if ('documentacionId' in dataValues && dataValues.documentacionId !== undefined) {
      specificFields.documentacionId = dataValues.documentacionId;
    }
    if ('nombreArchivo' in dataValues && dataValues.nombreArchivo !== undefined) {
      specificFields.fileName = dataValues.nombreArchivo;
    }
    if ('rutaArchivo' in dataValues && dataValues.rutaArchivo !== undefined) {
      specificFields.filePath = dataValues.rutaArchivo;
    }
    if ('extension' in dataValues && dataValues.extension !== undefined) {
      specificFields.extension = dataValues.extension;
    }
    if ('tipoMime' in dataValues && dataValues.tipoMime !== undefined) {
      specificFields.tipoMime = dataValues.tipoMime;
    }
    if ('contieneMultipleDocumentos' in dataValues && dataValues.contieneMultipleDocumentos !== undefined) {
      specificFields.contieneMultipleDocumentos = dataValues.contieneMultipleDocumentos === 1 || dataValues.contieneMultipleDocumentos === true;
    }
    if ('verificado' in dataValues && dataValues.verificado !== undefined) {
      specificFields.verified = dataValues.verificado === 1 || dataValues.verificado === true;
    }
    if ('verificadoPor' in dataValues && dataValues.verificadoPor !== undefined) {
      specificFields.verifiedBy = dataValues.verificadoPor;
    }
    if ('fechaVerificacion' in dataValues && dataValues.fechaVerificacion !== undefined) {
      specificFields.verificationDate = dataValues.fechaVerificacion;
    }
    if ('observacionesVerificacion' in dataValues && dataValues.observacionesVerificacion !== undefined) {
      specificFields.verificationObservations = dataValues.observacionesVerificacion;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }
    if ('motivoRechazo' in dataValues && dataValues.motivoRechazo !== undefined) {
      specificFields.rejectionReason = dataValues.motivoRechazo;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

    return new StudentDocument(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   *
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   *
   * @param {StudentDocument|Object} entity - Entidad StudentDocument o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentDocument como objeto plano
    const data = entity instanceof StudentDocument ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      estudianteId: data.studentId || null,
      tipoDocumento: data.tipoDocumento || null,
      documentacionId: data.documentacionId || null,
      nombreArchivo: data.fileName,
      rutaArchivo: data.filePath,
      extension: data.extension || null,
      tipoMime: data.tipoMime || null,
      contieneMultipleDocumentos: data.contieneMultipleDocumentos !== undefined ? data.contieneMultipleDocumentos : false,
      verificado: data.verified !== undefined ? data.verified : false,
      verificadoPor: data.verifiedBy || null,
      fechaVerificacion: data.verificationDate || null,
      observacionesVerificacion: data.verificationObservations || null,
      estado: data.state || 'PENDIENTE',
      motivoRechazo: data.rejectionReason || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDocument
   *
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   *
   * @param {StudentDocument|Object} entity - Entidad StudentDocument o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentDocument como objeto plano
    const data = entity instanceof StudentDocument ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentDocument
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studentId' in data) {
      updateData.estudianteId = data.studentId || null;
    }
    if ('tipoDocumento' in data) {
      updateData.tipoDocumento = data.tipoDocumento || null;
    }
    if ('documentacionId' in data) {
      updateData.documentacionId = data.documentacionId || null;
    }
    if ('fileName' in data) {
      updateData.nombreArchivo = data.fileName;
    }
    if ('filePath' in data) {
      updateData.rutaArchivo = data.filePath;
    }
    if ('extension' in data) {
      updateData.extension = data.extension || null;
    }
    if ('tipoMime' in data) {
      updateData.tipoMime = data.tipoMime || null;
    }
    if ('contieneMultipleDocumentos' in data) {
      updateData.contieneMultipleDocumentos = data.contieneMultipleDocumentos;
    }
    if ('verified' in data) {
      updateData.verificado = data.verified;
    }
    if ('verifiedBy' in data) {
      updateData.verificadoPor = data.verifiedBy || null;
    }
    if ('verificationDate' in data) {
      updateData.fechaVerificacion = data.verificationDate || null;
    }
    if ('verificationObservations' in data) {
      updateData.observacionesVerificacion = data.verificationObservations || null;
    }
    if ('state' in data) {
      updateData.estado = data.state;
    }
    if ('rejectionReason' in data) {
      updateData.motivoRechazo = data.rejectionReason || null;
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
   * @returns {StudentDocument[]} Array de entidades StudentDocument
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
