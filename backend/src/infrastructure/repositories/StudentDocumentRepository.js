import { IDocumentoEstudianteRepository } from '../../domain/interfaces/repositories/IDocumentoEstudianteRepository.js';
import { DocumentoEstudiante as DocumentoEstudianteModel } from '../database/models/documento_estudiante.js';
import { StudentDocument } from '../../domain/entities/StudentDocument.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de documentos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IDocumentoEstudianteRepository}
 * 
 * Esta clase cumple con el contrato IDocumentoEstudianteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByEstudianteId() y findByTipoDocumento() que son requeridos por IDocumentoEstudianteRepository
 */
export class StudentDocumentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de documentos de estudiantes
   * @returns {Object} Modelo DocumentoEstudiante
   */
  getModel() {
    return DocumentoEstudianteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {StudentDocument|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new StudentDocument({
      id: model.id,
      studentId: model.estudianteId,
      tipoDocumento: model.tipoDocumento,
      documentacionId: model.documentacionId,
      fileName: model.nombreArchivo,
      filePath: model.rutaArchivo,
      extension: model.extension,
      tipoMime: model.tipoMime,
      contieneMultipleDocumentos: model.contieneMultipleDocumentos,
      verified: model.verificado,
      verifiedBy: model.verificadoPor,
      verificationDate: model.fechaVerificacion,
      verificationObservations: model.observacionesVerificacion,
      state: model.estado,
      rejectionReason: model.motivoRechazo,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    // Nota: documentType no existe directamente en documentos_estudiante
    // Se debe filtrar mediante JOIN con documentacion si es necesario
    // Por ahora, si se necesita filtrar por tipo, se debe hacer en el método que llama
    if (filters.state) {
      where.estado = filters.state;
    }
    if (filters.verified !== undefined) {
      where.verificado = filters.verified;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombreArchivo', 'tipoDocumento'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['createdAt', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
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
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.studentId !== undefined) {
      updateData.estudianteId = data.studentId || null;
    }
    if (data.documentacionId !== undefined) {
      updateData.documentacionId = data.documentacionId || null;
    }
    // documentType no existe en la tabla, se obtiene de documentacion a través de documentacion_id
    // Si se necesita cambiar el tipo, se debe actualizar documentacion_id
    if (data.documentReason !== undefined) {
      updateData.motivoDocumento = data.documentReason || null;
    }
    if (data.referenceType !== undefined) {
      updateData.tipoReferencia = data.referenceType || null;
    }
    if (data.referenceId !== undefined) {
      updateData.referenciaId = data.referenceId || null;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
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
    if (data.sizeKb !== undefined) {
      updateData.tamanoKb = data.sizeKb || null;
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
    if (data.esOriginal !== undefined) {
      updateData.esOriginal = data.esOriginal;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    return updateData;
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentDocuments';
  }

  /**
   * Método específico: Buscar documentos por estudiante
   * @param {number} estudianteId
   * @returns {Promise<StudentDocument[]>}
   */
  async findByEstudianteId(estudianteId) {
    // Log para debugging
    console.log('[StudentDocumentRepository] Buscando documentos para estudianteId:', estudianteId, 'tipo:', typeof estudianteId);
    
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['createdAt', 'DESC']],
    });
    
    console.log('[StudentDocumentRepository] Modelos encontrados:', models.length, 'para estudianteId:', estudianteId);
    if (models.length > 0) {
      console.log('[StudentDocumentRepository] Primer modelo:', {
        id: models[0].id,
        estudianteId: models[0].estudianteId,
        documentacionId: models[0].documentacionId,
        nombreArchivo: models[0].nombreArchivo,
        activo: models[0].activo,
      });
    }
    
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar documentos por tipo
   * @param {string} tipoDocumento
   * @returns {Promise<StudentDocument[]>}
   */
  async findByTipoDocumento(tipoDocumento) {
    const models = await this.getModel().findAll({
      where: {
        tipoDocumento: tipoDocumento,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['createdAt', 'DESC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

