import { Rector as RectorModel } from '../database/models/rector.js';
import { BaseRepository } from './BaseRepository.js';
import { RectorMapper } from '../mappers/RectorMapper.js';

/**
 * @implements {IRectorRepository}
 */
export class RectorRepository extends BaseRepository {
  getModel() {
    return RectorModel;
  }

  toEntity(model) {
    return RectorMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.staffId) {
      where.personalId = filters.staffId;
    }
    return where;
  }

  getSearchFields() {
    return ['tituloProfesional', 'especialidad', 'resolucionNombramiento', 'institucionEgreso'];
  }

  getDefaultSort() {
    return [];
  }

  mapDataToModel(data, _userId = null) {
    return RectorMapper.toModel(data);
  }

  mapDataToUpdate(data, _userId = null) {
    return RectorMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'rectors';
  }
}
