import { Documentacion as DocumentacionModel } from '../database/models/Documentacion.js';
import { Documentacion as DocumentacionEntity } from '../../domain/entities/Documentacion.js';
import { BaseRepository } from './BaseRepository.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de documentación usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * @param {Object} model
   * @returns {DocumentacionEntity|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new DocumentacionEntity({
      id: model.id,
      name: model.nombre,
      documentType: model.tipoDocumento,
      acceptsPhotocopy: model.aceptaFotocopia === 1 || model.aceptaFotocopia === true,
      required: model.requerido === 1 || model.requerido === true,
      order: model.orden,
      description: model.descripcion,
      // MySQL puede retornar 0/1, Sequelize puede retornar true/false
      // Normalizamos a boolean true/false
      // BaseEntity espera 'active' (inglés), no 'activo' (español)
      active: model.activo === 1 || model.activo === true || model.activo === '1',
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
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
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      nombre: data.name,
      tipoDocumento: data.documentType,
      aceptaFotocopia: data.acceptsPhotocopy !== undefined ? data.acceptsPhotocopy : false,
      requerido: data.required !== undefined ? data.required : true,
      orden: data.order || 0,
      descripcion: data.description || null,
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

    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.documentType !== undefined) {
      updateData.tipoDocumento = data.documentType;
    }
    if (data.acceptsPhotocopy !== undefined) {
      updateData.aceptaFotocopia = data.acceptsPhotocopy;
    }
    if (data.required !== undefined) {
      updateData.requerido = data.required;
    }
    if (data.order !== undefined) {
      updateData.orden = data.order;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description;
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
    return 'documentaciones';
  }

  /**
   * Buscar documentación por tipo
   * @param {string} tipoDocumento
   * @param {Object} options - Opciones opcionales
   * @returns {Promise<DocumentacionEntity[]>}
   */
  async findByTipoDocumento(tipoDocumento, options = {}) {
    const where = {
      tipoDocumento,
      activo: options.includeInactive ? undefined : true,
    };

    const models = await this.getModel().findAll({
      where,
      order: this.getDefaultSort(),
    });

    return models.map((model) => this.toEntity(model));
  }

  /**
   * Buscar documentación requerida
   * @param {Object} options - Opciones opcionales (includeInactive, tipoDocumento)
   * @returns {Promise<DocumentacionEntity[]>}
   */
  async findRequeridos(options = {}) {
    const where = {
      requerido: true,
      activo: options.includeInactive ? undefined : true,
    };

    if (options.tipoDocumento) {
      where.tipoDocumento = options.tipoDocumento;
    }

    const models = await this.getModel().findAll({
      where,
      order: this.getDefaultSort(),
    });

    return models.map((model) => this.toEntity(model));
  }

}

