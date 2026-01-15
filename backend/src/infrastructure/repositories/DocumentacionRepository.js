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
   * Maneja todos los criterios de búsqueda de la entidad Documentation
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ documentType: 'INSCRIPCION' }) → Busca documentos de inscripción
   * - findAll({ required: true, parentDocumentId: null }) → Busca documentos principales requeridos
   * - findBy({ documentType: 'LICENCIA', name: 'Certificado médico' }) → Busca documento específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - name: Nombre del documento (búsqueda exacta, para búsqueda de texto usar search())
   *   - documentType: Tipo de documento (INSCRIPCION, LICENCIA, PASANTIA, etc.)
   *   - acceptsPhotocopy: Si acepta fotocopia (true/false)
   *   - required: Si es requerido (true/false)
   *   - order: Orden de visualización
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   *   - parentDocumentId: ID del documento padre (null para documentos principales)
   *   - isOriginal: Si requiere original (true/false)
   *   - isSystemDocument: Si es documento del sistema (true/false)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.documentType !== undefined) {
      where.tipoDocumento = filters.documentType;
    }
    if (filters.acceptsPhotocopy !== undefined) {
      where.aceptaFotocopia = filters.acceptsPhotocopy;
    }
    if (filters.required !== undefined) {
      where.requerido = filters.required;
    }
    if (filters.order !== undefined) {
      where.orden = filters.order;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
    }
    if (filters.parentDocumentId !== undefined) {
      where.documentoPadreId = filters.parentDocumentId;
    }
    if (filters.isOriginal !== undefined) {
      where.esOriginal = filters.isOriginal;
    }
    if (filters.isSystemDocument !== undefined) {
      where.esDocumentoSistema = filters.isSystemDocument;
    }

    return where;
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'documentaciones';
  }
}
