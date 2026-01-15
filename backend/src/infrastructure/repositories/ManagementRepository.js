import { IGestionRepository } from '../../domain/interfaces/repositories/IGestionRepository.js';
import { Gestion as GestionModel } from '../database/models/gestion.js';
import { BaseRepository } from './BaseRepository.js';
import { ManagementMapper } from '../mappers/ManagementMapper.js';

/**
 * Implementación del repositorio de gestiones académicas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ManagementMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ManagementMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IGestionRepository
 * - Usa ManagementMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IGestionRepository}
 * 
 * Esta clase cumple con el contrato IGestionRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminaron findByCodigo(), findByAnio() y findActive() porque son redundantes.
 * Usar en su lugar:
 * - findBy({ code: '2025-REG' }) → Reemplaza findByCodigo()
 * - findAll({ year: 2025 }) → Reemplaza findByAnio()
 * - findAll({ isActive: true, startDate: { [Op.lte]: today }, endDate: { [Op.gte]: today } }) → Reemplaza findActive()
 */
export class ManagementRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de gestiones
   * @returns {Object} Modelo Gestion
   */
  getModel() {
    return GestionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ManagementMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Management|null} Entidad de dominio
   */
  toEntity(model) {
    return ManagementMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Management
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ code: '2025-REG' }) → Busca por código
   * - findAll({ year: 2025 }) → Busca gestiones de un año
   * - findAll({ type: 'REGULAR' }) → Busca gestiones regulares
   * - findAll({ isActive: true }) → Busca gestiones activas
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - code: Código de la gestión (búsqueda exacta, para búsqueda de texto usar search())
   *   - name: Nombre de la gestión (búsqueda exacta, para búsqueda de texto usar search())
   *   - year: Año académico
   *   - type: Tipo de gestión (REGULAR, VERANO, NIVELACION, etc.)
   *   - startDate: Fecha de inicio
   *   - endDate: Fecha de fin
   *   - isActive: Si la gestión está activa (true/false)
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
    if (filters.year) {
      where.anio = filters.year;
    }
    if (filters.type !== undefined) {
      where.tipo = filters.type;
    }
    if (filters.startDate !== undefined) {
      where.fechaInicioAdministrativa = filters.startDate;
    }
    if (filters.endDate !== undefined) {
      where.fechaFinAdministrativa = filters.endDate;
    }
    if (filters.isActive !== undefined) {
      where.activo = filters.isActive;
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
    return ['codigo'];
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

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a ManagementMapper
   * 
   * @param {Management|Object} data - Entidad Management o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ManagementMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ManagementMapper
   * 
   * @param {Management|Object} data - Entidad Management o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ManagementMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'managements';
  }
}

