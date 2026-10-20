import { Director as DirectorModel } from '../database/models/director.js';
import { BaseRepository } from './BaseRepository.js';
import { DirectorMapper } from '../mappers/DirectorMapper.js';

/**
 * @implements {IDirectorRepository}
 */
export class DirectorRepository extends BaseRepository {
  getModel() {
    return DirectorModel;
  }

  toEntity(model) {
    return DirectorMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.staffId) {
      where.personalId = filters.staffId;
    }
    if (filters.type) {
      where.tipo = filters.type;
    }
    return where;
  }

  getSearchFields() {
    return ['tituloProfesional', 'especialidad', 'resolucionNombramiento'];
  }

  getDefaultSort() {
    return [];
  }

  mapDataToModel(data, _userId = null) {
    return DirectorMapper.toModel(data);
  }

  mapDataToUpdate(data, _userId = null) {
    return DirectorMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'directors';
  }
}
