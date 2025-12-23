import { EstudianteDiscapacidad as EstudianteDiscapacidadModel } from '../database/models/EstudianteDiscapacidad.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Repositorio de discapacidades de estudiantes
 * Utiliza el patrón Template Method heredando de BaseRepository
 */
export class StudentDisabilityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize
   * @returns {Object} Modelo EstudianteDiscapacidad
   */
  getModel() {
    return EstudianteDiscapacidadModel;
  }

  /**
   * Convierte un modelo Sequelize a objeto plano
   * @param {Object} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    return {
      id: model.id,
      estudianteId: model.estudianteId,
      tipoDiscapacidadId: model.tipoDiscapacidadId,
      descripcion: model.descripcion,
      gradoDiscapacidad: model.gradoDiscapacidad,
      causa: model.causa,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['tipoDiscapacidadId', 'ASC']];
  }

  /**
   * Mapea datos a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      estudianteId: data.estudianteId,
      tipoDiscapacidadId: data.tipoDiscapacidadId,
      descripcion: data.descripcion || null,
      gradoDiscapacidad: data.gradoDiscapacidad || null,
      causa: data.causa || null,
      created_by: userId,
    };
  }

  /**
   * Mapea datos de actualización
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.descripcion !== undefined) {
      updateData.descripcion = data.descripcion;
    }
    if (data.gradoDiscapacidad !== undefined) {
      updateData.gradoDiscapacidad = data.gradoDiscapacidad;
    }
    if (data.causa !== undefined) {
      updateData.causa = data.causa;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }
    if (userId) {
      updateData.updated_by = userId;
    }

    return updateData;
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'studentDisabilities';
  }

  /**
   * Buscar discapacidades por estudiante
   * @param {number} estudianteId
   * @returns {Promise<Object[]>}
   */
  async findByEstudianteId(estudianteId) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
      order: this.getDefaultSort(),
    });

    return models.map((model) => this.toEntity(model));
  }

  /**
   * Crear múltiples discapacidades para un estudiante
   * @param {number} estudianteId
   * @param {Array<{tipoDiscapacidadId: number, descripcion?: string, gradoDiscapacidad?: string, gradoInvalidez?: string, causa?: string}>} discapacidades
   * @param {number} userId
   * @returns {Promise<Object[]>}
   */
  async createMultiple(estudianteId, discapacidades, userId = null) {
    const created = [];
    
    for (const discapacidad of discapacidades) {
      const data = {
        estudianteId,
        tipoDiscapacidadId: discapacidad.tipoDiscapacidadId,
        descripcion: discapacidad.descripcion || null,
        gradoDiscapacidad: discapacidad.gradoDiscapacidad || discapacidad.gradoInvalidez || null,
        causa: discapacidad.causa || null,
      };
      
      const createdItem = await this.create(data, userId);
      created.push(createdItem);
    }
    
    return created;
  }

  /**
   * Eliminar todas las discapacidades de un estudiante (soft delete)
   * @param {number} estudianteId
   * @param {number} userId
   * @returns {Promise<number>} Número de registros eliminados
   */
  async deleteByEstudianteId(estudianteId, userId = null) {
    const models = await this.getModel().findAll({
      where: {
        estudianteId: estudianteId,
        activo: true,
      },
    });

    let deletedCount = 0;
    for (const model of models) {
      await this.delete(model.id, userId);
      deletedCount++;
    }

    return deletedCount;
  }
}

