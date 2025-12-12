import { IMateriaRepository } from '../../domain/interfaces/repositories/IMateriaRepository.js';
import { Materia as MateriaModel } from '../database/models/Materia.js';
import { Subject } from '../../domain/entities/Subject.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de materias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IMateriaRepository}
 * 
 * Esta clase cumple con el contrato IMateriaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigo() que es requerido por IMateriaRepository
 */
export class SubjectRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de materias
   * @returns {Object} Modelo Materia
   */
  getModel() {
    return MateriaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Subject|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Subject({
      id: model.id,
      code: model.codigo,
      name: model.nombre,
      shortName: model.nombreCorto,
      description: model.descripcion,
      theoreticalHours: model.cargaHorariaTeorica,
      practicalHours: model.cargaHorariaPractica,
      credits: model.creditos,
      type: model.tipo,
      knowledgeArea: model.areaConocimiento,
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

    if (filters.type) {
      where.tipo = filters.type;
    }
    if (filters.knowledgeArea) {
      where.areaConocimiento = filters.knowledgeArea;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['codigo', 'nombre', 'nombreCorto', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['codigo', 'ASC']];
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
      nombreCorto: data.shortName || null,
      descripcion: data.description || null,
      cargaHorariaTeorica: data.theoreticalHours !== undefined ? data.theoreticalHours : 0,
      cargaHorariaPractica: data.practicalHours !== undefined ? data.practicalHours : 0,
      creditos: data.credits || null,
      tipo: data.type || 'TEORICA_PRACTICA',
      areaConocimiento: data.knowledgeArea || null,
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
    if (data.shortName !== undefined) {
      updateData.nombreCorto = data.shortName || null;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.theoreticalHours !== undefined) {
      updateData.cargaHorariaTeorica = data.theoreticalHours;
    }
    if (data.practicalHours !== undefined) {
      updateData.cargaHorariaPractica = data.practicalHours;
    }
    if (data.credits !== undefined) {
      updateData.creditos = data.credits || null;
    }
    if (data.type !== undefined) {
      updateData.tipo = data.type;
    }
    if (data.knowledgeArea !== undefined) {
      updateData.areaConocimiento = data.knowledgeArea || null;
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
    return 'subjects';
  }

  /**
   * Método específico: Buscar materia por código
   * @param {string} codigo
   * @returns {Promise<Subject|null>}
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

