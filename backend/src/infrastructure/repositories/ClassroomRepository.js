import { Op } from 'sequelize';
import { IClassroomRepository } from '../../domain/interfaces/repositories/IClassroomRepository.js';
import { Aula as AulaModel } from '../database/models/aula.js';
import { BaseRepository } from './BaseRepository.js';
import { ClassroomMapper } from '../mappers/ClassroomMapper.js';

/**
 * Implementación del repositorio de aulas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ClassroomMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ClassroomMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IClassroomRepository
 * - Usa ClassroomMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IClassroomRepository}
 * 
 * Esta clase cumple con el contrato IClassroomRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class ClassroomRepository extends BaseRepository {
  getModel() {
    return AulaModel;
  }

  toEntity(model) {
    return ClassroomMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Classroom
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ code: 'A-101' }) → Busca por código
   * - findAll({ category: 'AULA' }) → Busca aulas regulares
   * - findAll({ minCapacity: 30, maxCapacity: 50 }) → Busca aulas con capacidad entre 30 y 50
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - code: Código del aula (búsqueda exacta, para búsqueda de texto usar search())
   *   - name: Nombre del aula (búsqueda exacta, para búsqueda de texto usar search())
   *   - category: Categoría (AULA, LABORATORIO, TALLER, etc.)
   *   - capacity: Capacidad exacta
   *   - minCapacity: Capacidad mínima (usa >=)
   *   - maxCapacity: Capacidad máxima (usa <=)
   *   - observations: Observaciones (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.category) {
      where.categoria = filters.category;
    }
    // Manejo de capacidad: priorizar capacity exacta, luego rango min-max
    if (filters.capacity !== undefined) {
      where.capacidad = filters.capacity;
    } else if (filters.minCapacity !== undefined && filters.maxCapacity !== undefined) {
      where.capacidad = { [Op.between]: [filters.minCapacity, filters.maxCapacity] };
    } else if (filters.minCapacity !== undefined) {
      where.capacidad = { [Op.gte]: filters.minCapacity };
    } else if (filters.maxCapacity !== undefined) {
      where.capacidad = { [Op.lte]: filters.maxCapacity };
    }
    if (filters.observations !== undefined) {
      where.observaciones = filters.observations;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['codigo', 'nombre', 'observaciones'];
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Delega el orden al BaseRepository que ordena por ID ASC
   * 
   * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository (id ASC)
   */
  getDefaultSort() {
    return []; // Usa el orden por defecto de BaseRepository: [['id', 'ASC']]
  }

  mapDataToModel(data, userId = null) {
    return ClassroomMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ClassroomMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'classrooms';
  }
}
