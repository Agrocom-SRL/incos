import { ICarreraRepository } from '../../domain/interfaces/repositories/ICarreraRepository.js';
import { Carrera as CarreraModel } from '../database/models/carrera.js';
import { Career } from '../../domain/entities/Career.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de carreras usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {ICarreraRepository}
 * 
 * Esta clase cumple con el contrato ICarreraRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo() que es requerido por ICarreraRepository
 */
export class CareerRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de carreras
   * @returns {Object} Modelo Carrera
   */
  getModel() {
    return CarreraModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Career|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Career({
      id: model.id,
      code: model.codigo,
      name: model.nombre,
      description: model.descripcion,
      durationYears: model.duracionAnios,
      grantedTitle: model.tituloOtorgado,
      ministerialResolution: model.resolucionMinisterial,
      effectiveDate: model.fechaVigencia,
      totalHours: model.cargaHorariaTotal,
      colorHex: model.colorHex,
      imageName: model.imagenNombre,
      imagePath: model.imagenRuta,
      imageUrl: model.imagenUrl,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'nombre', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['nombre', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      codigo: data.code,
      nombre: data.name,
      descripcion: data.description || null,
      duracionAnios: data.durationYears !== undefined ? data.durationYears : 4,
      tituloOtorgado: data.grantedTitle || null,
      resolucionMinisterial: data.ministerialResolution || null,
      fechaVigencia: data.effectiveDate || null,
      cargaHorariaTotal: data.totalHours || null,
      colorHex: data.colorHex || null,
      imagenNombre: data.imageName || null,
      imagenRuta: data.imagePath || null,
      imagenUrl: data.imageUrl || null,
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

    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.durationYears !== undefined) {
      updateData.duracionAnios = data.durationYears;
    }
    if (data.grantedTitle !== undefined) {
      updateData.tituloOtorgado = data.grantedTitle || null;
    }
    if (data.ministerialResolution !== undefined) {
      updateData.resolucionMinisterial = data.ministerialResolution || null;
    }
    if (data.effectiveDate !== undefined) {
      updateData.fechaVigencia = data.effectiveDate || null;
    }
    if (data.totalHours !== undefined) {
      updateData.cargaHorariaTotal = data.totalHours || null;
    }
    if (data.colorHex !== undefined) {
      updateData.colorHex = data.colorHex || null;
    }
    if (data.imageName !== undefined) {
      updateData.imagenNombre = data.imageName || null;
    }
    if (data.imagePath !== undefined) {
      updateData.imagenRuta = data.imagePath || null;
    }
    if (data.imageUrl !== undefined) {
      updateData.imagenUrl = data.imageUrl || null;
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
    return 'careers';
  }

  /**
   * Método específico: Buscar carrera por código
   * @param {string} codigo
   * @returns {Promise<Career|null>}
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
}

