import { IDocumentoEstudianteRepository } from '../../domain/interfaces/repositories/IDocumentoEstudianteRepository.js';
import { DocumentoEstudiante as DocumentoEstudianteModel } from '../database/models/documento_estudiante.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentDocumentMapper } from '../mappers/StudentDocumentMapper.js';

/**
 * Implementación del repositorio de documentos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentDocumentMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentDocumentMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IDocumentoEstudianteRepository
 * - Usa StudentDocumentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IDocumentoEstudianteRepository}
 * 
 * Esta clase cumple con el contrato IDocumentoEstudianteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
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
   * Delega la responsabilidad de mapeo a StudentDocumentMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentDocument|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentDocumentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda: studentId, documentacionId, tipoDocumento, state, verified
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante (estudianteId)
   *   - documentacionId: ID de la documentación (documentacionId)
   *   - tipoDocumento: Tipo de documento (tipoDocumento)
   *   - state: Estado del documento (estado)
   *   - verified: Si está verificado (verificado)
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
    if (filters.tipoDocumento) {
      where.tipoDocumento = filters.tipoDocumento;
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
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentDocumentMapper
   * 
   * @param {StudentDocument|Object} data - Entidad StudentDocument o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return StudentDocumentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentDocumentMapper
   * 
   * @param {StudentDocument|Object} data - Entidad StudentDocument o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return StudentDocumentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentDocuments';
  }

  // NOTA: Los métodos específicos (findByEstudianteId, findByTipoDocumento) han sido eliminados.
  // Ahora se usan los métodos base de IRepository:
  // - findAll({ studentId }) para buscar todos los documentos por estudiante
  // - findAll({ tipoDocumento }) para buscar todos los documentos por tipo
}

