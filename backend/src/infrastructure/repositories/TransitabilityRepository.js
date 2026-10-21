import { Transitabilidad as TransitabilidadModel } from '../database/models/transitabilidad.js';
import { BaseRepository } from './BaseRepository.js';
import { TransitabilityMapper } from '../mappers/TransitabilityMapper.js';

/**
 * Implementación del repositorio de transitabilidades usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a TransitabilityMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa TransitabilityMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITransitabilidadRepository
 * - Usa TransitabilityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {ITransitabilidadRepository}
 *
 * Esta clase cumple con el contrato ITransitabilidadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class TransitabilityRepository extends BaseRepository {
  /**
   * Modelo Sequelize asociado.
   */
  getModel() {
    return TransitabilidadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio.
   */
  toEntity(model) {
    return TransitabilityMapper.toEntity(model);
  }

  /**
   * WHERE específico para filtros de transitabilidad.
   *
   * Filtros soportados (alineados con tabla transitabilidades):
   * - studentId: id del estudiante (estudiante_id)
   * - originInstitutionId: institución de origen (institucion_origen_id)
   * - status: estado de la solicitud (estado)
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.studentId !== undefined) {
      where.estudianteId = filters.studentId;
    }
    if (filters.originInstitutionId !== undefined) {
      where.institucionOrigenId = filters.originInstitutionId;
    }
    if (filters.status !== undefined) {
      where.estado = filters.status;
    }

    return where;
  }

  /**
   * Campos usados en búsqueda de texto (search()).
   */
  getSearchFields() {
    return ['carreraOrigen'];
  }

  /**
   * Orden por defecto: delega en BaseRepository (id ASC).
   */
  getDefaultSort() {
    return [];
  }

  /**
   * Mapeo de datos de dominio → modelo Sequelize (INSERT).
   */
  mapDataToModel(data, _userId = null) {
    return TransitabilityMapper.toModel(data);
  }

  /**
   * Mapeo de datos de dominio → modelo Sequelize (UPDATE).
   */
  mapDataToUpdate(data, _userId = null) {
    return TransitabilityMapper.toModelForUpdate(data);
  }

  /**
   * Nombre de la colección en las respuestas JSON.
   */
  getCollectionName() {
    return 'transitabilities';
  }
}
