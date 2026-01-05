import { Documentacion as DocumentacionModel } from '../database/models/documentacion.js';
import { BaseRepository } from './BaseRepository.js';
import { DocumentacionMapper } from '../mappers/DocumentacionMapper.js';
import { Op } from 'sequelize';

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
   * @returns {Documentacion|null} Entidad de dominio
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
  getDefaultSort() {
    return [['orden', 'ASC'], ['nombre', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a DocumentacionMapper
   * 
   * @param {Documentacion|Object} data - Entidad Documentacion o objeto con datos de dominio
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
   * @param {Documentacion|Object} data - Entidad Documentacion o objeto con datos de dominio
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
   * Sobrescribe el método del BaseRepository para agregar filtro por tipoDocumento
   * 
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.tipoDocumento - Tipo de documento (INSCRIPCION, LICENCIA, PASANTIA, etc.)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Filtrar por tipo de documento si se proporciona
    if (filters.tipoDocumento) {
      where.tipoDocumento = filters.tipoDocumento;
    }

    return where;
  }

  /**
   * Método específico: Buscar documentación por tipo
   * 
   * @param {string} tipoDocumento - Tipo de documento
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<Documentacion[]>} Array de entidades Documentacion
   */
  async findByTipoDocumento(tipoDocumento, options = {}) {
    const where = {
      tipoDocumento,
      activo: options.includeInactive ? undefined : true,
      // paranoid: true automáticamente excluye deletedAt !== null
    };

    const models = await this.getModel().findAll({
      where,
      order: this.getDefaultSort(),
    });

    return DocumentacionMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar documentación requerida
   * 
   * @param {Object} options - Opciones opcionales (includeInactive, tipoDocumento)
   * @returns {Promise<Documentacion[]>} Array de entidades Documentacion
   */
  async findRequeridos(options = {}) {
    const where = {
      requerido: true,
      activo: options.includeInactive ? undefined : true,
      // paranoid: true automáticamente excluye deletedAt !== null
    };

    if (options.tipoDocumento) {
      where.tipoDocumento = options.tipoDocumento;
    }

    const models = await this.getModel().findAll({
      where,
      order: this.getDefaultSort(),
    });

    return DocumentacionMapper.toEntityList(models);
  }

}

