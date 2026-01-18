import { IContributionPaymentRepository } from '../../domain/interfaces/repositories/IContributionPaymentRepository.js';
import { PagoAporte as PagoAporteModel } from '../database/models/pago_aporte.js';
import { BaseRepository } from './BaseRepository.js';
import { ContributionPaymentMapper } from '../mappers/ContributionPaymentMapper.js';

/**
 * Implementación del repositorio de pagos de aporte usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IContributionPaymentRepository}
 */
export class ContributionPaymentRepository extends BaseRepository {
  getModel() {
    return PagoAporteModel;
  }

  toEntity(model) {
    return ContributionPaymentMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studentId !== undefined) {
      where.estudianteId = filters.studentId;
    }
    if (filters.managementId !== undefined) {
      where.gestionId = filters.managementId;
    }
    if (filters.enrollmentId !== undefined) {
      where.inscripcionId = filters.enrollmentId;
    }
    if (filters.studentScholarshipId !== undefined) {
      where.estudianteBecaId = filters.studentScholarshipId;
    }
    if (filters.paymentMethodId !== undefined) {
      where.metodoPagoId = filters.paymentMethodId;
    }
    if (filters.paymentAccountId !== undefined) {
      where.cuentaPagoId = filters.paymentAccountId;
    }
    if (filters.receiptNumber !== undefined) {
      where.numeroRecibo = filters.receiptNumber;
    }
    if (filters.paymentDate !== undefined) {
      where.fechaPago = filters.paymentDate;
    }
    if (filters.totalAmount !== undefined) {
      where.montoTotal = filters.totalAmount;
    }
    if (filters.scholarshipDiscount !== undefined) {
      where.descuentoBeca = filters.scholarshipDiscount;
    }
    if (filters.amountPaid !== undefined) {
      where.montoPagado = filters.amountPaid;
    }
    if (filters.transactionNumber !== undefined) {
      where.numeroTransaccion = filters.transactionNumber;
    }
    if (filters.concept !== undefined) {
      where.concepto = filters.concept;
    }
    if (filters.observations !== undefined) {
      where.observaciones = filters.observations;
    }

    return where;
  }

  getSearchFields() {
    return ['numeroRecibo', 'numeroTransaccion', 'concepto', 'observaciones'];
  }

  getDefaultSort() {
    return [['fechaPago', 'DESC'], ['id', 'DESC']];
  }

  mapDataToModel(data, userId = null) {
    return ContributionPaymentMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return ContributionPaymentMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'contributionPayments';
  }
}
