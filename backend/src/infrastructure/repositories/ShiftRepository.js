import { ITurnoRepository } from '../../domain/interfaces/repositories/ITurnoRepository.js';
import { Turno as TurnoModel } from '../database/models/turno.js';
import { Shift } from '../../domain/entities/Shift.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de turnos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {ITurnoRepository}
 * 
 * Esta clase cumple con el contrato ITurnoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - No tiene métodos específicos adicionales
 */
export class ShiftRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de turnos
   * @returns {Object} Modelo Turno
   */
  getModel() {
    return TurnoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Shift|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Shift({
      id: model.id,
      name: model.nombre,
      startTime: model.horaInicio,
      endTime: model.horaFin,
      description: model.descripcion,
      colorHex: model.colorHex,
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
    return ['nombre', 'descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['horaInicio', 'ASC']];
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
      horaInicio: data.startTime,
      horaFin: data.endTime,
      descripcion: data.description || null,
      colorHex: data.colorHex || null,
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
    if (data.startTime !== undefined) {
      updateData.horaInicio = data.startTime;
    }
    if (data.endTime !== undefined) {
      updateData.horaFin = data.endTime;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
    }
    if (data.colorHex !== undefined) {
      updateData.colorHex = data.colorHex || null;
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
    return 'shifts';
  }
}

