import { IParallelRepository } from '../../domain/interfaces/repositories/IParallelRepository.js';
import { Paralelo as ParaleloModel } from '../database/models/paralelo.js';
import { BaseRepository } from './BaseRepository.js';
import { ParallelMapper } from '../mappers/ParallelMapper.js';

/**
 * Implementación del repositorio de paralelos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ParallelMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ParallelMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IParallelRepository
 * - Usa ParallelMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IParallelRepository}
 * 
 * Esta clase cumple con el contrato IParallelRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class ParallelRepository extends BaseRepository {
  getModel() {
    return ParaleloModel;
  }

  toEntity(model) {
    return ParallelMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Parallel
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ careerId: 1 }) → Busca paralelos de una carrera
   * - findAll({ periodId: 2, shift: 'MAÑANA' }) → Busca paralelos de un periodo y turno
   * - findBy({ careerId: 1, periodId: 2, name: 'A' }) → Busca paralelo específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - careerId: ID de la carrera
   *   - periodId: ID del periodo
   *   - name: Nombre del paralelo (búsqueda exacta, para búsqueda de texto usar search())
   *   - shift: Turno (MAÑANA, TARDE, NOCHE)
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.careerId) {
      where.carreraId = filters.careerId;
    }
    if (filters.periodId) {
      where.periodoId = filters.periodId;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.shift) {
      where.turno = filters.shift;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
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
    return ['nombre', 'descripcion'];
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
    return ParallelMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ParallelMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'parallels';
  }
}
