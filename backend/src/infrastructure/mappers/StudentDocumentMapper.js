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
   * 
   * @param {Object|null} model - Modelo Sequelize de DocumentoEstudiante
   * @returns {StudentDocument|null} Entidad de dominio StudentDocument
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudentDocument (campos del dominio)
    const specificFields = {
      studentId: model.estudianteId,
      tipoDocumento: model.tipoDocumento,
      documentacionId: model.documentacionId,
      fileName: model.nombreArchivo,
      filePath: model.rutaArchivo,
      extension: model.extension,
      tipoMime: model.tipoMime,
      contieneMultipleDocumentos: model.contieneMultipleDocumentos === 1 || model.contieneMultipleDocumentos === true,
      verified: model.verificado === 1 || model.verificado === true,
      verifiedBy: model.verificadoPor,
      verificationDate: model.fechaVerificacion,
      verificationObservations: model.observacionesVerificacion,
      state: model.estado,
      rejectionReason: model.motivoRechazo,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudentDocument(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudentDocument|Object} entity - Entidad StudentDocument o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudentDocument como objeto plano
    const data = entity instanceof StudentDocument ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudentDocument
   * 
   * @param {StudentDocument|Object} entity - Entidad StudentDocument o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudentDocument como objeto plano
    const data = entity instanceof StudentDocument ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudentDocument
    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId || null;
    }
    if (data.tipoDocumento !== undefined) {
      updateData.tipoDocumento = data.tipoDocumento || null;
    }
    if (data.documentacionId !== undefined) {
      updateData.documentacionId = data.documentacionId || null;
    }
    if (data.fileName !== undefined) {
      updateData.nombreArchivo = data.fileName;
    }
    if (data.filePath !== undefined) {
      updateData.rutaArchivo = data.filePath;
    }
    if (data.extension !== undefined) {
      updateData.extension = data.extension || null;
    }
    if (data.tipoMime !== undefined) {
      updateData.tipoMime = data.tipoMime || null;
    }
    if (data.contieneMultipleDocumentos !== undefined) {
      updateData.contieneMultipleDocumentos = data.contieneMultipleDocumentos;
    }
    if (data.verified !== undefined) {
      updateData.verificado = data.verified;
    }
    if (data.verifiedBy !== undefined) {
      updateData.verificadoPor = data.verifiedBy || null;
    }
    if (data.verificationDate !== undefined) {
      updateData.fechaVerificacion = data.verificationDate || null;
    }
    if (data.verificationObservations !== undefined) {
      updateData.observacionesVerificacion = data.verificationObservations || null;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state;
    }
    if (data.rejectionReason !== undefined) {
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

