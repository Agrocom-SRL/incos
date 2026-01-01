import { BaseRepository } from './BaseRepository.js';
import { EstudianteDocumentoEntrega } from '../database/models/estudiante_documento_entrega.js';
import { StudentDocumentDelivery } from '../../domain/entities/StudentDocumentDelivery.js';

/**
 * Implementación del repositorio de entregas de documentos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 */
export class StudentDocumentDeliveryRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de entregas de documentos de estudiantes
   * @returns {Object} Modelo EstudianteDocumentoEntrega
   */
  getModel() {
    return EstudianteDocumentoEntrega;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {StudentDocumentDelivery|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new StudentDocumentDelivery({
      id: model.id,
      studentId: model.estudianteId,
      documentacionId: model.documentacionId,
      entregado: model.entregado,
      enTramite: model.enTramite,
      esOriginal: model.esOriginal,
      fechaEntrega: model.fechaEntrega,
      fechaVencimientoTramite: model.fechaVencimientoTramite,
      observaciones: model.observaciones,
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

    if (filters.entregado !== undefined) {
      where.entregado = filters.entregado;
    }
    if (filters.enTramite !== undefined) {
      where.enTramite = filters.enTramite;
    }
    if (filters.esOriginal !== undefined) {
      where.esOriginal = filters.esOriginal;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['observaciones'];
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
      documentacionId: data.documentacionId || null,
      entregado: data.entregado !== undefined ? data.entregado : false,
      enTramite: data.enTramite !== undefined ? data.enTramite : false,
      esOriginal: data.esOriginal !== undefined ? data.esOriginal : false,
      fechaEntrega: data.fechaEntrega || null,
      fechaVencimientoTramite: data.fechaVencimientoTramite || null,
      observaciones: data.observaciones || null,
    };
  }

  /**
   * Retorna el nombre de la colección para logging
   * @returns {string}
   */
  getCollectionName() {
    return 'studentDocumentDeliveries';
  }

  /**
   * Método específico: Buscar entregas por estudiante
   * @param {number} estudianteId
   * @returns {Promise<StudentDocumentDelivery[]>}
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
      order: [['createdAt', 'DESC']],
    });
    
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar entregas por documento
   * @param {number} documentacionId
   * @returns {Promise<StudentDocumentDelivery[]>}
   */
  async findByDocumentacionId(documentacionId) {
    const models = await this.getModel().findAll({
      where: {
        documentacionId: documentacionId,
        activo: true,
      },
      order: [['createdAt', 'DESC']],
    });
    
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar entrega por estudiante y documento
   * @param {number} estudianteId
   * @param {number} documentacionId
   * @returns {Promise<StudentDocumentDelivery|null>}
   */
  async findByEstudianteAndDocumentacion(estudianteId, documentacionId) {
    const model = await this.getModel().findOne({
      where: {
        estudianteId: estudianteId,
        documentacionId: documentacionId,
        activo: true,
      },
    });
    
    return model ? this.toEntity(model) : null;
  }
}

