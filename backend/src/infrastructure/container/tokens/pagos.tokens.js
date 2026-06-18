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
    deletePaymentInstallmentUseCase: 'pagos.deletePaymentInstallmentUseCase',
    updatePaymentInstallmentUseCase: 'pagos.updatePaymentInstallmentUseCase',
    generateReciboPagoUseCase: 'pagos.generateReciboPagoUseCase',
    exportPaymentAporteByCareerExcelUseCase: 'pagos.exportPaymentAporteByCareerExcelUseCase',
    getBecasPorCarreraReporteUseCase: 'pagos.getBecasPorCarreraReporteUseCase',
    searchStudentsForAporteRegistroUseCase: 'pagos.searchStudentsForAporteRegistroUseCase',

    // Use Cases - Compromiso de pago (CRUD) y Cuentas por cobrar (reporte)
    getCompromisoByPagoAporteUseCase: 'pagos.getCompromisoByPagoAporteUseCase',
    upsertCompromisoUseCase: 'pagos.upsertCompromisoUseCase',
    updateCompromisoUseCase: 'pagos.updateCompromisoUseCase',
    deleteCompromisoUseCase: 'pagos.deleteCompromisoUseCase',
    getCuentasPorCobrarReporteUseCase: 'pagos.getCuentasPorCobrarReporteUseCase',

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
    deletePaymentInstallmentController: 'pagos.deletePaymentInstallmentController',
    updatePaymentInstallmentController: 'pagos.updatePaymentInstallmentController',
    generateReciboPagoController: 'pagos.generateReciboPagoController',
    exportListaAportesPorCarreraExcelController: 'pagos.exportListaAportesPorCarreraExcelController',
    getBecasPorCarreraReporteController: 'pagos.getBecasPorCarreraReporteController',
    searchStudentsForAporteRegistroController: 'pagos.searchStudentsForAporteRegistroController',

    // Controllers - Compromiso de pago (CRUD) y Cuentas por cobrar (reporte)
    getCompromisoController: 'pagos.getCompromisoController',
    upsertCompromisoController: 'pagos.upsertCompromisoController',
    updateCompromisoController: 'pagos.updateCompromisoController',
    deleteCompromisoController: 'pagos.deleteCompromisoController',
    getCuentasPorCobrarReporteController: 'pagos.getCuentasPorCobrarReporteController',

    // Routers
    metodosPagoRouter: 'pagos.metodosPagoRouter',
    bancosAutorizadosRouter: 'pagos.bancosAutorizadosRouter',
    cuentasPagoRouter: 'pagos.cuentasPagoRouter',
    configuracionAportesRouter: 'pagos.configuracionAportesRouter',
    pagosAportesRouter: 'pagos.pagosAportesRouter',
};