import { IPaisRepository } from '../../domain/interfaces/repositories/IPaisRepository.js';
import { Pais as PaisModel } from '../database/models/pais.js';
import { BaseRepository } from './BaseRepository.js';
import { CountryMapper } from '../mappers/CountryMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de países usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CountryMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CountryMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPaisRepository
 * - Usa CountryMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IPaisRepository}
 * 
 * Esta clase cumple con el contrato IPaisRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigoIso() que es requerido por IPaisRepository
 */
export class CountryRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de países
   * @returns {Object} Modelo Pais
   */
  getModel() {
    return PaisModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CountryMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Country|null} Entidad de dominio
   */
  toEntity(model) {
    return CountryMapper.toEntity(model);
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'codigoIso'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['nombre', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a CountryMapper
   * 
   * @param {Country|Object} data - Entidad Country o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CountryMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CountryMapper
   * 
   * @param {Country|Object} data - Entidad Country o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CountryMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'countries';
  }

  /**
   * Método específico: Buscar país por código ISO
   * 
   * @param {string} codigoIso - Código ISO del país
   * @returns {Promise<Country|null>} Entidad Country o null si no se encuentra
   */
  async findByCodigoIso(codigoIso) {
    const model = await this.getModel().findOne({
      where: {
        codigoIso: codigoIso.toUpperCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Sobrescribe el método search para incluir búsqueda case-insensitive en código ISO
   * Respeta el filtro de registros eliminados (paranoid: true) y el estado activo
   * @param {string} searchTerm
   * @param {Object} options - Opciones opcionales (includeInactive)
   * @returns {Promise<Country[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { codigoIso: { [Op.like]: `%${searchTerm.toUpperCase()}%` } },
      ],
    };

    // Filtrar por estado activo/inactivo (solo si no se solicita incluir inactivos)
    if (!options.includeInactive) {
      where.activo = true; // Solo registros activos por defecto
    }

    const models = await Model.findAll({
      where,
      order: this.getDefaultSort(),
      limit: 50,
    });

    return CountryMapper.toEntityList(models);
  }
}
