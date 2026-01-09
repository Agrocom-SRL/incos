import { Documentacion as DocumentacionModel } from '../database/models/documentacion.js';
import { BaseRepository } from './BaseRepository.js';
import { DocumentacionMapper } from '../mappers/DocumentacionMapper.js';

/**
 * Implementación del repositorio de documentación usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a DocumentacionMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa DocumentacionMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta del repositorio
 * - Usa DocumentacionMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IDocumentacionRepository}
 * 
 * Esta clase cumple con el contrato IDocumentacionRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 */
export class DocumentacionRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de documentación
   * @returns {Object} Modelo Documentacion
   */
  getModel() {
    return DocumentacionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a DocumentacionMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Documentation|null} Entidad de dominio
   */
  toEntity(model) {
    return DocumentacionMapper.toEntity(model);
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a DocumentacionMapper
   * 
   * @param {Documentation|Object} data - Entidad Documentation o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return DocumentacionMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a DocumentacionMapper
   * 
   * @param {Documentation|Object} data - Entidad Documentation o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return DocumentacionMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'documentaciones';
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda: tipoDocumento, requerido, documentoPadreId
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - tipoDocumento: Tipo de documento (INSCRIPCION, LICENCIA, PASANTIA, etc.)
   *   - requerido: Si es requerido (requerido)
   *   - documentoPadreId: ID del documento padre (null para documentos principales, número para documentos hijos)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Filtrar por tipo de documento si se proporciona
    if (filters.tipoDocumento !== undefined) {
      where.tipoDocumento = filters.tipoDocumento;
    }

    // Filtrar por requerido si se proporciona
    if (filters.requerido !== undefined) {
      where.requerido = filters.requerido;
    }

    // Filtrar por documentoPadreId si se proporciona
    if (filters.documentoPadreId !== undefined) {
      where.documentoPadreId = filters.documentoPadreId;
    }

    return where;
  }

  // NOTA: Los métodos específicos (findByTipoDocumento, findRequeridos) 
  // han sido eliminados. Ahora se usan los métodos base de IRepository:
  // - findAll({ tipoDocumento, requerido, documentoPadreId }) para buscar con campos específicos
  // - findBy({ tipoDocumento }) para buscar un documento por tipo
}
