import { Traspaso as TraspasoModel } from '../database/models/traspaso.js';
import { BaseRepository } from './BaseRepository.js';
import { TransferMapper } from '../mappers/TransferMapper.js';

/**
 * Implementación del repositorio de traspasos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a TransferMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa TransferMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITraspasoRepository
 * - Usa TransferMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {ITraspasoRepository}
 *
 * Esta clase cumple con el contrato ITraspasoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class TransferRepository extends BaseRepository {
  /**
   * Modelo Sequelize asociado.
   */
  getModel() {
    return TraspasoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio.
   */
  toEntity(model) {
    return TransferMapper.toEntity(model);
  }

  /**
   * WHERE específico para filtros de traspaso.
   *
   * Filtros soportados (alineados con tabla traspasos):
   * - studentId: id del estudiante (estudiante_id)
   * - originInstitutionId: institución de origen (institucion_origen_id)
   * - status: estado de la solicitud (estado)
   * - yearCompleted: año cursado en origen (anio_cursado: PRIMERO / SEGUNDO)
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
    if (filters.yearCompleted !== undefined) {
      where.anioCursado = filters.yearCompleted;
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
    return TransferMapper.toModel(data);
  }

  /**
   * Mapeo de datos de dominio → modelo Sequelize (UPDATE).
   */
  mapDataToUpdate(data, _userId = null) {
    return TransferMapper.toModelForUpdate(data);
  }

  /**
   * Nombre de la colección en las respuestas JSON.
   */
  getCollectionName() {
    return 'transfers';
  }
}
