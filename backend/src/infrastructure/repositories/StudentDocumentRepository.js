import { IDocumentoEstudianteRepository } from '../../domain/interfaces/repositories/IDocumentoEstudianteRepository.js';
import { DocumentoEstudiante as DocumentoEstudianteModel } from '../database/models/DocumentoEstudiante.js';
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
      documentType: model.tipoDocumento,
      documentReason: model.motivoDocumento,
      referenceType: model.tipoReferencia,
      referenceId: model.referenciaId,
      description: model.descripcion,
      fileName: model.nombreArchivo,
      filePath: model.rutaArchivo,
      extension: model.extension,
      sizeKb: model.tamanoKb,
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

    if (filters.documentType) {
      where.tipoDocumento = filters.documentType;
    }
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
    return ['nombreArchivo', 'descripcion', 'motivoDocumento'];
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
      tipoDocumento: data.documentType,
      motivoDocumento: data.documentReason || null,
      tipoReferencia: data.referenceType || null,
      referenciaId: data.referenceId || null,
      descripcion: data.description || null,
      nombreArchivo: data.fileName,
      rutaArchivo: data.filePath,
      extension: data.extension || null,
      tamanoKb: data.sizeKb || null,
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
    if (data.documentType !== undefined) {
      updateData.tipoDocumento = data.documentType;
    }
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
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['createdAt', 'DESC']],
    });
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

