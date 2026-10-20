import { IMetodoPagoRepository } from '../../domain/interfaces/repositories/IMetodoPagoRepository.js';
import { MetodoPago as MetodoPagoModel } from '../database/models/metodo_pago.js';
import { BaseRepository } from './BaseRepository.js';
import { PaymentMethodMapper } from '../mappers/PaymentMethodMapper.js';

/**
 * Implementación del repositorio de métodos de pago usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * @implements {IMetodoPagoRepository}
 */
export class PaymentMethodRepository extends BaseRepository {
  getModel() {
    return MetodoPagoModel;
  }

  toEntity(model) {
    return PaymentMethodMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
    return PaymentMethodMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return PaymentMethodMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'paymentMethods';
  }
}
