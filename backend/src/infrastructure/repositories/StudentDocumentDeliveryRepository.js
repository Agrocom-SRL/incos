import { IEstudianteDocumentoEntregaRepository } from '../../domain/interfaces/repositories/IEstudianteDocumentoEntregaRepository.js';
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
 * - Infrastructure Layer: Implementación concreta de IEstudianteDocumentoEntregaRepository
 * - Usa StudentDocumentDeliveryMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstudianteDocumentoEntregaRepository}
 * 
 * Esta clase cumple con el contrato IEstudianteDocumentoEntregaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
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
   * Maneja todos los criterios de búsqueda: studentId, documentacionId, entregado, enTramite, esOriginal
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante (estudianteId)
   *   - documentacionId: ID de la documentación (documentacionId)
   *   - entregado: Si fue entregado (entregado)
   *   - enTramite: Si está en trámite (enTramite)
   *   - esOriginal: Si es original (esOriginal)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.documentacionId) {
      where.documentacionId = filters.documentacionId;
    }
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

  // NOTA: Los métodos específicos (findByEstudianteId, findByDocumentacionId, findByEstudianteAndDocumentacion) 
  // han sido eliminados. Ahora se usan los métodos base de IRepository:
  // - findAll({ studentId }) para buscar todas las entregas por estudiante
  // - findAll({ documentacionId }) para buscar todas las entregas por documento
  // - findBy({ studentId, documentacionId }) para buscar una entrega específica por estudiante y documento
}

