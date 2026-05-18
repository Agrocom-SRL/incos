import { IBancoAutorizadoRepository } from '../../domain/interfaces/repositories/IBancoAutorizadoRepository.js';
import { BancoAutorizado as BancoAutorizadoModel } from '../database/models/banco_autorizado.js';
import { BaseRepository } from './BaseRepository.js';
import { AuthorizedBankMapper } from '../mappers/AuthorizedBankMapper.js';

/**
 * Implementación del repositorio de bancos autorizados usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IBancoAutorizadoRepository}
 */
export class AuthorizedBankRepository extends BaseRepository {
  getModel() {
    return BancoAutorizadoModel;
  }

  toEntity(model) {
    return AuthorizedBankMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.paymentMethodId !== undefined) {
      where.metodoPagoId = filters.paymentMethodId;
    }
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }

    return where;
  }

  getSearchFields() {
    return ['codigo', 'nombre'];
  }

  getDefaultSort() {
    return [['nombre', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return AuthorizedBankMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return AuthorizedBankMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'authorizedBanks';
  }
}
