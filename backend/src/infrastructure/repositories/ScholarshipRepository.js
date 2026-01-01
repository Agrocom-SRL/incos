import { IBecaDescuentoRepository } from '../../domain/interfaces/repositories/IBecaDescuentoRepository.js';
import { BecaDescuento as BecaDescuentoModel } from '../database/models/beca_descuento.js';
import { Scholarship } from '../../domain/entities/Scholarship.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de becas y descuentos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IBecaDescuentoRepository}
 * 
 * Esta clase cumple con el contrato IBecaDescuentoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo(), findByPorcentaje() y findAutomaticas() que son requeridos por IBecaDescuentoRepository
 */
export class ScholarshipRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de becas y descuentos
   * @returns {Object} Modelo BecaDescuento
   */
  getModel() {
    return BecaDescuentoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Scholarship|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Scholarship({
      id: model.id,
      name: model.nombre,
      code: model.codigo,
      percentage: model.porcentaje ? parseFloat(model.porcentaje) : null,
      description: model.descripcion,
      requiresDocumentation: model.requiereDocumentacion,
      requiresRectorApproval: model.requiereAprobacionRector,
      isAutomatic: model.esAutomatica,
      automaticType: model.tipoAutomatica,
      minimumAverage: model.promedioMinimo ? parseFloat(model.promedioMinimo) : null,
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

    if (filters.isAutomatic !== undefined) {
      where.esAutomatica = filters.isAutomatic;
    }
    if (filters.requiresRectorApproval !== undefined) {
      where.requiereAprobacionRector = filters.requiresRectorApproval;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'codigo', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['porcentaje', 'ASC']];
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
      codigo: data.code || null,
      porcentaje: data.percentage,
      descripcion: data.description || null,
      requiereDocumentacion: data.requiresDocumentation !== undefined ? data.requiresDocumentation : true,
      requiereAprobacionRector: data.requiresRectorApproval !== undefined ? data.requiresRectorApproval : false,
      esAutomatica: data.isAutomatic !== undefined ? data.isAutomatic : false,
      tipoAutomatica: data.automaticType || 'MANUAL',
      promedioMinimo: data.minimumAverage || null,
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
    if (data.code !== undefined) {
      updateData.codigo = data.code || null;
    }
    if (data.percentage !== undefined) {
      updateData.porcentaje = data.percentage;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.requiresDocumentation !== undefined) {
      updateData.requiereDocumentacion = data.requiresDocumentation;
    }
    if (data.requiresRectorApproval !== undefined) {
      updateData.requiereAprobacionRector = data.requiresRectorApproval;
    }
    if (data.isAutomatic !== undefined) {
      updateData.esAutomatica = data.isAutomatic;
    }
    if (data.automaticType !== undefined) {
      updateData.tipoAutomatica = data.automaticType;
    }
    if (data.minimumAverage !== undefined) {
      updateData.promedioMinimo = data.minimumAverage || null;
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
    return 'scholarships';
  }

  /**
   * Método específico: Buscar beca por código
   * @param {string} codigo
   * @returns {Promise<Scholarship|null>}
   */
  async findByCodigo(codigo) {
    const model = await this.getModel().findOne({
      where: {
        codigo: codigo,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar beca por porcentaje
   * @param {number} porcentaje
   * @returns {Promise<Scholarship|null>}
   */
  async findByPorcentaje(porcentaje) {
    const model = await this.getModel().findOne({
      where: {
        porcentaje: porcentaje,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar becas automáticas
   * @returns {Promise<Scholarship[]>}
   */
  async findAutomaticas() {
    const models = await this.getModel().findAll({
      where: {
        esAutomatica: true,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['porcentaje', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

