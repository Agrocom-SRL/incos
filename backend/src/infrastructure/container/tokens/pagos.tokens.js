/**
 * Tokens del módulo Pagos
 */

export const PAGOS_TOKENS = {
    // Use Cases
    listPaymentMethodsUseCase: 'pagos.listPaymentMethodsUseCase',
    listAuthorizedBanksUseCase: 'pagos.listAuthorizedBanksUseCase',
    listPaymentAccountsUseCase: 'pagos.listPaymentAccountsUseCase',
    listContributionConfigurationsUseCase: 'pagos.listContributionConfigurationsUseCase',
    
    // Controllers
    listMetodosPagoController: 'pagos.listMetodosPagoController',
    listBancosAutorizadosController: 'pagos.listBancosAutorizadosController',
    listCuentasPagoController: 'pagos.listCuentasPagoController',
    listConfiguracionAportesController: 'pagos.listConfiguracionAportesController',
    
    // Routers
    metodosPagoRouter: 'pagos.metodosPagoRouter',
    bancosAutorizadosRouter: 'pagos.bancosAutorizadosRouter',
    cuentasPagoRouter: 'pagos.cuentasPagoRouter',
    configuracionAportesRouter: 'pagos.configuracionAportesRouter',
};
