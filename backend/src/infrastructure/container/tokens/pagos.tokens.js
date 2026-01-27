/**
 * Tokens del módulo Pagos
 */

export const PAGOS_TOKENS = {
    // Use Cases - Lista
    listPaymentMethodsUseCase: 'pagos.listPaymentMethodsUseCase',
    listAuthorizedBanksUseCase: 'pagos.listAuthorizedBanksUseCase',
    listPaymentAccountsUseCase: 'pagos.listPaymentAccountsUseCase',
    listContributionConfigurationsUseCase: 'pagos.listContributionConfigurationsUseCase',

    // Use Cases - Registro de Pago
    registerPagoAporteUseCase: 'pagos.registerPagoAporteUseCase',
    listPagosAportesUseCase: 'pagos.listPagosAportesUseCase',
    getPaymentAporteByIdUseCase: 'pagos.getPaymentAporteByIdUseCase',
    getEstadoAporteRegistroUseCase: 'pagos.getEstadoAporteRegistroUseCase',
    deletePaymentAporteUseCase: 'pagos.deletePaymentAporteUseCase',
    generateReciboPagoUseCase: 'pagos.generateReciboPagoUseCase',

    // Controllers - Lista
    listMetodosPagoController: 'pagos.listMetodosPagoController',
    listBancosAutorizadosController: 'pagos.listBancosAutorizadosController',
    listCuentasPagoController: 'pagos.listCuentasPagoController',
    listConfiguracionAportesController: 'pagos.listConfiguracionAportesController',

    // Controllers - Registro de Pago
    registerPagoAporteController: 'pagos.registerPagoAporteController',
    listPagosAportesController: 'pagos.listPagosAportesController',
    getPaymentAporteByIdController: 'pagos.getPaymentAporteByIdController',
    getEstadoAporteRegistroController: 'pagos.getEstadoAporteRegistroController',
    deletePaymentAporteController: 'pagos.deletePaymentAporteController',
    generateReciboPagoController: 'pagos.generateReciboPagoController',

    // Routers
    metodosPagoRouter: 'pagos.metodosPagoRouter',
    bancosAutorizadosRouter: 'pagos.bancosAutorizadosRouter',
    cuentasPagoRouter: 'pagos.cuentasPagoRouter',
    configuracionAportesRouter: 'pagos.configuracionAportesRouter',
    pagosAportesRouter: 'pagos.pagosAportesRouter',
};