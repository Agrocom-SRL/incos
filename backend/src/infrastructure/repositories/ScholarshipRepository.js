import { IBecaDescuentoRepository } from '../../domain/interfaces/repositories/IBecaDescuentoRepository.js';
import { BecaDescuento as BecaDescuentoModel } from '../database/models/beca_descuento.js';
import { BaseRepository } from './BaseRepository.js';
import { ScholarshipMapper } from '../mappers/ScholarshipMapper.js';

/**
 * Implementación del repositorio de becas y descuentos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ScholarshipMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ScholarshipMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IBecaDescuentoRepository
 * - Usa ScholarshipMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IBecaDescuentoRepository}
 * 
 * Esta clase cumple con el contrato IBecaDescuentoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminaron findByCodigo(), findByPorcentaje() y findAutomaticas() porque son redundantes.
 * Usar en su lugar:
 * - findBy({ code: 'BECA_100' }) → Reemplaza findByCodigo()
 * - findBy({ percentage: 100 }) → Reemplaza findByPorcentaje()
 * - findAll({ isAutomatic: true }) → Reemplaza findAutomaticas()
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
   * Delega la responsabilidad de mapeo a ScholarshipMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Scholarship|null} Entidad de dominio
   */
  toEntity(model) {
    return ScholarshipMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Scholarship
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ isAutomatic: true }) → Busca becas automáticas
   * - findBy({ code: 'BECA_100' }) → Busca beca por código
   * - findAll({ percentage: 50, requiresRectorApproval: false }) → Busca becas del 50% sin aprobación
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - name: Nombre de la beca (búsqueda exacta, para búsqueda de texto usar search())
   *   - code: Código de la beca (búsqueda exacta, para búsqueda de texto usar search())
   *   - percentage: Porcentaje de la beca (0-100)
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   *   - requiresDocumentation: Si requiere documentación (true/false)
   *   - requiresRectorApproval: Si requiere aprobación del rector (true/false)
   *   - isAutomatic: Si es automática (true/false)
   *   - automaticType: Tipo de beca automática (MANUAL, PROMEDIO, etc.)
   *   - minimumAverage: Promedio mínimo requerido
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.percentage !== undefined) {
      where.porcentaje = filters.percentage;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
    }
    if (filters.requiresDocumentation !== undefined) {
      where.requiereDocumentacion = filters.requiresDocumentation;
    }
    if (filters.requiresRectorApproval !== undefined) {
      where.requiereAprobacionRector = filters.requiresRectorApproval;
    }
    if (filters.isAutomatic !== undefined) {
      where.esAutomatica = filters.isAutomatic;
    }
    if (filters.automaticType) {
      where.tipoAutomatica = filters.automaticType;
    }
    if (filters.minimumAverage !== undefined) {
      where.promedioMinimo = filters.minimumAverage;
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
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a ScholarshipMapper
   * 
   * @param {Scholarship|Object} data - Entidad Scholarship o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return ScholarshipMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ScholarshipMapper
   * 
   * @param {Scholarship|Object} data - Entidad Scholarship o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return ScholarshipMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'scholarships';
  }
}

