import { BaseRepository } from './BaseRepository.js';
import { EstudianteDocumentoEntrega } from '../database/models/estudiante_documento_entrega.js';
import { StudentDocumentDeliveryMapper } from '../mappers/StudentDocumentDeliveryMapper.js';

/**
 * Implementación del repositorio de entregas de documentos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentDocumentDeliveryMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentDocumentDeliveryMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta
 * - Usa StudentDocumentDeliveryMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a StudentDocumentDeliveryMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentDocumentDelivery|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentDocumentDeliveryMapper.toEntity(model);
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
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentDocumentDeliveryMapper
   * 
   * @param {StudentDocumentDelivery|Object} data - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentDocumentDeliveryMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentDocumentDeliveryMapper
   * 
   * @param {StudentDocumentDelivery|Object} data - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentDocumentDeliveryMapper.toModelForUpdate(data);
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
   * 
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<StudentDocumentDelivery[]>} Array de entidades StudentDocumentDelivery
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
      order: [['createdAt', 'DESC']],
    });
    
    return StudentDocumentDeliveryMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar entregas por documento
   * 
   * @param {number} documentacionId - ID del documento
   * @returns {Promise<StudentDocumentDelivery[]>} Array de entidades StudentDocumentDelivery
   */
  async findByDocumentacionId(documentacionId) {
    const models = await this.getModel().findAll({
      where: {
        documentacionId: documentacionId,
        activo: true,
      },
      order: [['createdAt', 'DESC']],
    });
    
    return StudentDocumentDeliveryMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar entrega por estudiante y documento
   * 
   * @param {number} estudianteId - ID del estudiante
   * @param {number} documentacionId - ID del documento
   * @returns {Promise<StudentDocumentDelivery|null>} Entidad StudentDocumentDelivery o null
   */
  async findByEstudianteAndDocumentacion(estudianteId, documentacionId) {
    const model = await this.getModel().findOne({
      where: {
        estudianteId: estudianteId,
        documentacionId: documentacionId,
        activo: true,
      },
    });
    
    return StudentDocumentDeliveryMapper.toEntity(model);
  }
}

