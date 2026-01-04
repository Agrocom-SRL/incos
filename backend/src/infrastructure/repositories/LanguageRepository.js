import { IIdiomaRepository } from '../../domain/interfaces/repositories/IIdiomaRepository.js';
import { Idioma as IdiomaModel } from '../database/models/idioma.js';
import { BaseRepository } from './BaseRepository.js';
import { LanguageMapper } from '../mappers/LanguageMapper.js';
import { Op } from 'sequelize';

/**
 * Implementación del repositorio de idiomas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a LanguageMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa LanguageMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IIdiomaRepository
 * - Usa LanguageMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IIdiomaRepository}
 * 
 * Esta clase cumple con el contrato IIdiomaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByCodigoIso() que es requerido por IIdiomaRepository
 */
export class LanguageRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de idiomas
   * @returns {Object} Modelo Idioma
   */
  getModel() {
    return IdiomaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a LanguageMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Language|null} Entidad de dominio
   */
  toEntity(model) {
    return LanguageMapper.toEntity(model);
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
   * Delega la responsabilidad de mapeo a LanguageMapper
   * 
   * @param {Language|Object} data - Entidad Language o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return LanguageMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a LanguageMapper
   * 
   * @param {Language|Object} data - Entidad Language o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return LanguageMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'languages';
  }

  /**
   * Método específico: Buscar idioma por código ISO
   * 
   * @param {string} codigoIso - Código ISO del idioma
   * @returns {Promise<Language|null>} Entidad Language o null si no se encuentra
   */
  async findByCodigoIso(codigoIso) {
    const model = await this.getModel().findOne({
      where: {
        codigoIso: codigoIso.toLowerCase(),
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
   * @returns {Promise<Language[]>}
   */
  async search(searchTerm, options = {}) {
    const Model = this.getModel();

    const where = {
      // paranoid: true automáticamente excluye deletedAt !== null (registros eliminados lógicamente)
      [Op.or]: [
        { nombre: { [Op.like]: `%${searchTerm}%` } },
        { codigoIso: { [Op.like]: `%${searchTerm.toLowerCase()}%` } },
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

    return LanguageMapper.toEntityList(models);
  }
}

