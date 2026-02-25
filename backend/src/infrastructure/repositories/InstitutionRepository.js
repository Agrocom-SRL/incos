import { IInstitucionRepository } from '../../domain/interfaces/repositories/IInstitucionRepository.js';
import { Institucion as InstitucionModel } from '../database/models/institucion.js';
import { BaseRepository } from './BaseRepository.js';
import { InstitutionMapper } from '../mappers/InstitutionMapper.js';

/**
 * Implementación del repositorio de instituciones usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a InstitutionMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa InstitutionMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IInstitucionRepository
 * - Usa InstitutionMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IInstitucionRepository}
 *
 * Esta clase cumple con el contrato IInstitucionRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class InstitutionRepository extends BaseRepository {
  /**
   * Modelo Sequelize asociado.
   */
  getModel() {
    return InstitucionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio.
   */
  toEntity(model) {
    return InstitutionMapper.toEntity(model);
  }

  /**
   * WHERE específico para filtros de instituciones.
   *
   * Filtros soportados:
   * - name: nombre exacto
   * - type: tipo de institución (UETHP, CEA, ITT, UNIVERSIDAD)
   * - dependency: dependencia (FISCAL, CONVENIO, PRIVADO)
   * - sieCode: código SIE-UE
   * - departmentId: id de departamento
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.type !== undefined) {
      where.tipo = filters.type;
    }
    if (filters.dependency !== undefined) {
      where.dependencia = filters.dependency;
    }
    if (filters.sieCode !== undefined) {
      where.codigoSie = filters.sieCode;
    }
    if (filters.departmentId !== undefined) {
      where.departamentoId = filters.departmentId;
    }

    return where;
  }

  /**
   * Campos usados en búsqueda de texto (search()).
   */
  getSearchFields() {
    return ['nombre', 'codigoSie', 'distritoEducativo'];
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
  mapDataToModel(data, userId = null) {
    return InstitutionMapper.toModel(data);
  }

  /**
   * Mapeo de datos de dominio → modelo Sequelize (UPDATE).
   */
  mapDataToUpdate(data, userId = null) {
    return InstitutionMapper.toModelForUpdate(data);
  }

  /**
   * Nombre de la colección en las respuestas JSON.
   */
  getCollectionName() {
    return 'institutions';
  }
}

