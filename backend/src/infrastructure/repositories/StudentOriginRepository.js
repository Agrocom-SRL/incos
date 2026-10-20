import { EstudianteOrigen as EstudianteOrigenModel } from '../database/models/estudiante_origen.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentOriginMapper } from '../mappers/StudentOriginMapper.js';

/**
 * Repositorio de orígenes de estudiantes
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentOriginMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentOriginMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteOrigenRepository
 * - Usa StudentOriginMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IEstudianteOrigenRepository}
 *
 * Esta clase cumple con el contrato IEstudianteOrigenRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - NOTA: createMultiple, deleteByEstudianteId y determinarTipoNacionalidadEstudiante deben moverse a casos de uso
 */
export class StudentOriginRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize
   * @returns {Object} Modelo EstudianteOrigen
   */
  getModel() {
    return EstudianteOrigenModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentOrigin|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentOriginMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad StudentOrigin
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ studentId: 1 }) → Busca orígenes de un estudiante
   * - findAll({ originType: 'BOLIVIANA', isPrincipal: true }) → Busca origen principal boliviano
   * - findBy({ studentId: 1, countryId: 1 }) → Busca origen específico
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante
   *   - countryId: ID del país
   *   - birthMunicipalityId: ID del municipio de nacimiento
   *   - birthCity: Ciudad de nacimiento (búsqueda exacta, para búsqueda de texto usar search())
   *   - motherTongueId: ID del idioma materno
   *   - secondaryLanguageId: ID del idioma secundario
   *   - originType: Tipo de origen (BOLIVIANA, EXTRANJERA, etc.)
   *   - isPrincipal: Si es principal (true/false)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.countryId) {
      where.paisId = filters.countryId;
    }
    if (filters.birthMunicipalityId) {
      where.municipioNacimientoId = filters.birthMunicipalityId;
    }
    if (filters.birthCity !== undefined) {
      where.ciudadNacimiento = filters.birthCity;
    }
    if (filters.motherTongueId) {
      where.idiomaMaternoId = filters.motherTongueId;
    }
    if (filters.secondaryLanguageId) {
      where.idiomaSecundarioId = filters.secondaryLanguageId;
    }
    if (filters.originType) {
      where.tipoOrigen = filters.originType;
    }
    if (filters.isPrincipal !== undefined) {
      where.esPrincipal = filters.isPrincipal;
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
    return ['ciudadNacimiento'];
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
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   *
   * @param {StudentOrigin|Object} data - Entidad StudentOrigin o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return StudentOriginMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentOriginMapper
   *
   * @param {StudentOrigin|Object} data - Entidad StudentOrigin o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return StudentOriginMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studentOrigins';
  }
}
