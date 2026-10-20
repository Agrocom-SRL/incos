import { ICuentaPagoRepository } from '../../domain/interfaces/repositories/ICuentaPagoRepository.js';
import { CuentaPago as CuentaPagoModel } from '../database/models/cuenta_pago.js';
import { BaseRepository } from './BaseRepository.js';
import { PaymentAccountMapper } from '../mappers/PaymentAccountMapper.js';

/**
 * Implementación del repositorio de cuentas de pago usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * @implements {ICuentaPagoRepository}
 */
export class PaymentAccountRepository extends BaseRepository {
  getModel() {
    return CuentaPagoModel;
  }

  toEntity(model) {
    return PaymentAccountMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.paymentMethodId !== undefined) {
      where.metodoPagoId = filters.paymentMethodId;
    }
    if (filters.bankId !== undefined) {
      where.bancoId = filters.bankId;
    }
    if (filters.accountHolderName !== undefined) {
      where.nombreTitular = filters.accountHolderName;
    }
    if (filters.accountNumber !== undefined) {
      where.numeroCuenta = filters.accountNumber;
    }
    if (filters.phoneNumber !== undefined) {
      where.numeroCelular = filters.phoneNumber;
    }
    if (filters.qrImageUrl !== undefined) {
      where.qrImagenUrl = filters.qrImageUrl;
    }

    return where;
  }

  getSearchFields() {
    return ['nombreTitular', 'numeroCuenta', 'numeroCelular'];
  }

  getDefaultSort() {
    return [['nombreTitular', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return PaymentAccountMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return PaymentAccountMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'paymentAccounts';
  }
}
