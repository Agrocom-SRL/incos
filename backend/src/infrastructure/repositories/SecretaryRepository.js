import { ISecretaryRepository } from '../../domain/interfaces/repositories/ISecretaryRepository.js';
import { Secretaria as SecretariaModel } from '../database/models/secretaria.js';
import { BaseRepository } from './BaseRepository.js';
import { SecretaryMapper } from '../mappers/SecretaryMapper.js';

/**
 * @implements {ISecretaryRepository}
 */
export class SecretaryRepository extends BaseRepository {
  getModel() {
    return SecretariaModel;
  }

  toEntity(model) {
    return SecretaryMapper.toEntity(model);
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
    return [];
  }

  getDefaultSort() {
    return [];
  }

  mapDataToModel(data, userId = null) {
    return SecretaryMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return SecretaryMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'secretaries';
  }
}
