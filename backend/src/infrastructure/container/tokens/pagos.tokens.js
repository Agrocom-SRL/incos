/**
 * Tokens del módulo Pagos
 */

export const PAGOS_TOKENS = {
    // Use Cases - Lista
    listPaymentMethodsUseCase: 'pagos.listPaymentMethodsUseCase',
    listAuthorizedBanksUseCase: 'pagos.listAuthorizedBanksUseCase',
    listPaymentAccountsUseCase: 'pagos.listPaymentAccountsUseCase',
    listContributionConfigurationsUseCase: 'pagos.listContributionConfigurationsUseCase',

    // Use Cases - Configuración de pagos (mutaciones)
    createContributionConfigurationUseCase: 'pagos.createContributionConfigurationUseCase',
    updateContributionConfigurationUseCase: 'pagos.updateContributionConfigurationUseCase',
    updatePaymentMethodUseCase: 'pagos.updatePaymentMethodUseCase',
    setEstadoMetodoPagoUseCase: 'pagos.setEstadoMetodoPagoUseCase',
    createAuthorizedBankUseCase: 'pagos.createAuthorizedBankUseCase',
    updateAuthorizedBankUseCase: 'pagos.updateAuthorizedBankUseCase',
    deleteAuthorizedBankUseCase: 'pagos.deleteAuthorizedBankUseCase',
    setEstadoBancoAutorizadoUseCase: 'pagos.setEstadoBancoAutorizadoUseCase',
    createPaymentAccountUseCase: 'pagos.createPaymentAccountUseCase',
    updatePaymentAccountUseCase: 'pagos.updatePaymentAccountUseCase',
    deletePaymentAccountUseCase: 'pagos.deletePaymentAccountUseCase',
    setEstadoCuentaPagoUseCase: 'pagos.setEstadoCuentaPagoUseCase',

    // Use Cases - Registro de Pago
    registerPagoAporteUseCase: 'pagos.registerPagoAporteUseCase',
    listPagosAportesUseCase: 'pagos.listPagosAportesUseCase',
    getPaymentAporteByIdUseCase: 'pagos.getPaymentAporteByIdUseCase',
    getMiAporteDetalleEstudianteUseCase: 'pagos.getMiAporteDetalleEstudianteUseCase',
    getEstadoAporteRegistroUseCase: 'pagos.getEstadoAporteRegistroUseCase',
    deletePaymentAporteUseCase: 'pagos.deletePaymentAporteUseCase',
    deletePaymentInstallmentUseCase: 'pagos.deletePaymentInstallmentUseCase',
    updatePaymentInstallmentUseCase: 'pagos.updatePaymentInstallmentUseCase',
    generateReciboPagoUseCase: 'pagos.generateReciboPagoUseCase',
    exportPaymentAporteByCareerExcelUseCase: 'pagos.exportPaymentAporteByCareerExcelUseCase',
    getBecasPorCarreraReporteUseCase: 'pagos.getBecasPorCarreraReporteUseCase',
    exportBecasPorCarreraReporteExcelUseCase: 'pagos.exportBecasPorCarreraReporteExcelUseCase',
    searchStudentsForAporteRegistroUseCase: 'pagos.searchStudentsForAporteRegistroUseCase',

    // Use Cases - Compromiso de pago (CRUD) y Cuentas por cobrar (reporte)
    getCompromisoByPagoAporteUseCase: 'pagos.getCompromisoByPagoAporteUseCase',
    upsertCompromisoUseCase: 'pagos.upsertCompromisoUseCase',
    updateCompromisoUseCase: 'pagos.updateCompromisoUseCase',
    deleteCompromisoUseCase: 'pagos.deleteCompromisoUseCase',
    getCuentasPorCobrarReporteUseCase: 'pagos.getCuentasPorCobrarReporteUseCase',
    exportCuentasPorCobrarReporteExcelUseCase: 'pagos.exportCuentasPorCobrarReporteExcelUseCase',

    // Controllers - Lista
    listMetodosPagoController: 'pagos.listMetodosPagoController',
    listBancosAutorizadosController: 'pagos.listBancosAutorizadosController',
    listCuentasPagoController: 'pagos.listCuentasPagoController',
    listConfiguracionAportesController: 'pagos.listConfiguracionAportesController',

    // Controllers - Configuración de pagos (mutaciones)
    createConfiguracionAporteController: 'pagos.createConfiguracionAporteController',
    updateConfiguracionAporteController: 'pagos.updateConfiguracionAporteController',
    updateMetodoPagoController: 'pagos.updateMetodoPagoController',
    setEstadoMetodoPagoController: 'pagos.setEstadoMetodoPagoController',
    createBancoAutorizadoController: 'pagos.createBancoAutorizadoController',
    updateBancoAutorizadoController: 'pagos.updateBancoAutorizadoController',
    deleteBancoAutorizadoController: 'pagos.deleteBancoAutorizadoController',
    setEstadoBancoAutorizadoController: 'pagos.setEstadoBancoAutorizadoController',
    createCuentaPagoController: 'pagos.createCuentaPagoController',
    updateCuentaPagoController: 'pagos.updateCuentaPagoController',
    deleteCuentaPagoController: 'pagos.deleteCuentaPagoController',
    setEstadoCuentaPagoController: 'pagos.setEstadoCuentaPagoController',

    // Controllers - Registro de Pago
    registerPagoAporteController: 'pagos.registerPagoAporteController',
    listPagosAportesController: 'pagos.listPagosAportesController',
    getPaymentAporteByIdController: 'pagos.getPaymentAporteByIdController',
    misAportesController: 'pagos.misAportesController',
    misAporteDetailController: 'pagos.misAporteDetailController',
    getEstadoAporteRegistroController: 'pagos.getEstadoAporteRegistroController',
    deletePaymentAporteController: 'pagos.deletePaymentAporteController',
    deletePaymentInstallmentController: 'pagos.deletePaymentInstallmentController',
    updatePaymentInstallmentController: 'pagos.updatePaymentInstallmentController',
    generateReciboPagoController: 'pagos.generateReciboPagoController',
    exportListaAportesPorCarreraExcelController: 'pagos.exportListaAportesPorCarreraExcelController',
    getBecasPorCarreraReporteController: 'pagos.getBecasPorCarreraReporteController',
    exportBecasPorCarreraReporteExcelController: 'pagos.exportBecasPorCarreraReporteExcelController',
    searchStudentsForAporteRegistroController: 'pagos.searchStudentsForAporteRegistroController',

    // Controllers - Compromiso de pago (CRUD) y Cuentas por cobrar (reporte)
    getCompromisoController: 'pagos.getCompromisoController',
    upsertCompromisoController: 'pagos.upsertCompromisoController',
    updateCompromisoController: 'pagos.updateCompromisoController',
    deleteCompromisoController: 'pagos.deleteCompromisoController',
    getCuentasPorCobrarReporteController: 'pagos.getCuentasPorCobrarReporteController',
    exportCuentasPorCobrarReporteExcelController: 'pagos.exportCuentasPorCobrarReporteExcelController',

    // Routers
    metodosPagoRouter: 'pagos.metodosPagoRouter',
    bancosAutorizadosRouter: 'pagos.bancosAutorizadosRouter',
    cuentasPagoRouter: 'pagos.cuentasPagoRouter',
    configuracionAportesRouter: 'pagos.configuracionAportesRouter',
    pagosAportesRouter: 'pagos.pagosAportesRouter',
};