/**
 * Módulo: Pagos
 * Registra todos los Use Cases relacionados con pagos
 * 
 * Clean Architecture:
 * - Application Layer: Registro de dependencias del módulo de pagos
 * 
 * Ubicación: application/container/modules
 * - Parte del módulo Pagos
 * - Features: Cuentas de Pago, Bancos Autorizados, Métodos de Pago, Configuraciones de Aportes
 */

import {
  GetTodasPaymentAccountsUseCase,
  GetTodosAuthorizedBanksUseCase,
  GetTodosPaymentMethodsUseCase,
  GetTodasContributionConfigurationsUseCase,
} from '@useCases/pagos';

import PaymentAccountRepository from '@infrastructure/repositories/PaymentAccountRepository';
import AuthorizedBankRepository from '@infrastructure/repositories/AuthorizedBankRepository';
import PaymentMethodRepository from '@infrastructure/repositories/PaymentMethodRepository';
import ContributionConfigurationRepository from '@infrastructure/repositories/ContributionConfigurationRepository';

/**
 * Registra los Use Cases del módulo de pagos
 * @param {Object} factory - Factory de Use Cases
 * @returns {Object} Factory con los Use Cases registrados
 */
export function registerPagosModule(factory) {
  // Repositorios singleton (stateless)
  const paymentAccountRepository = PaymentAccountRepository;
  const authorizedBankRepository = AuthorizedBankRepository;
  const paymentMethodRepository = PaymentMethodRepository;
  const contributionConfigurationRepository = ContributionConfigurationRepository;

  // Registrar Use Cases de Cuentas de Pago
  factory.listarCuentasPago = () => {
    return new GetTodasPaymentAccountsUseCase(paymentAccountRepository);
  };

  // Registrar Use Cases de Bancos Autorizados
  factory.listarBancosAutorizados = () => {
    return new GetTodosAuthorizedBanksUseCase(authorizedBankRepository);
  };

  // Registrar Use Cases de Métodos de Pago
  factory.listarMetodosPago = () => {
    return new GetTodosPaymentMethodsUseCase(paymentMethodRepository);
  };

  // Registrar Use Cases de Configuraciones de Aportes
  factory.listarConfiguracionAportes = () => {
    return new GetTodasContributionConfigurationsUseCase(contributionConfigurationRepository);
  };

  return factory;
}
