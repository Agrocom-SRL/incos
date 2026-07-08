/**
 * Tokens del Módulo Configuración
 *
 * Convenciones:
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'configuracion.listCarrerasUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'configuracion.listCarrerasController')
 * - Routers: {modulo}_{entity}Router (ej: 'configuracion.carrerasRouter')
 */

export const CONFIGURACION_TOKENS = {
    // USE CASES
    listCarrerasUseCase: 'configuracion.listCarrerasUseCase',
    getCarreraByIdUseCase: 'configuracion.getCarreraByIdUseCase',
    createCarreraUseCase: 'configuracion.createCarreraUseCase',
    updateCarreraUseCase: 'configuracion.updateCarreraUseCase',
    deleteCarreraUseCase: 'configuracion.deleteCarreraUseCase',
    uploadCarreraImagenUseCase: 'configuracion.uploadCarreraImagenUseCase',

    listMateriasUseCase: 'configuracion.listMateriasUseCase',
    getMateriaByIdUseCase: 'configuracion.getMateriaByIdUseCase',
    createMateriaUseCase: 'configuracion.createMateriaUseCase',
    updateMateriaUseCase: 'configuracion.updateMateriaUseCase',
    deleteMateriaUseCase: 'configuracion.deleteMateriaUseCase',

    listPlanesEstudiosUseCase: 'configuracion.listPlanesEstudiosUseCase',
    getPlanEstudiosByIdUseCase: 'configuracion.getPlanEstudiosByIdUseCase',
    getPlanEstudiosMatrizUseCase: 'configuracion.getPlanEstudiosMatrizUseCase',
    validarPlanEstudiosUseCase: 'configuracion.validarPlanEstudiosUseCase',
    createPlanEstudiosUseCase: 'configuracion.createPlanEstudiosUseCase',
    updatePlanEstudiosUseCase: 'configuracion.updatePlanEstudiosUseCase',
    marcarPlanEstudiosVigenteUseCase: 'configuracion.marcarPlanEstudiosVigenteUseCase',

    listPeriodosByPlanUseCase: 'configuracion.listPeriodosByPlanUseCase',
    createPeriodoUseCase: 'configuracion.createPeriodoUseCase',
    updatePeriodoUseCase: 'configuracion.updatePeriodoUseCase',
    deletePeriodoUseCase: 'configuracion.deletePeriodoUseCase',

    listAsignaturasPlanByPlanUseCase: 'configuracion.listAsignaturasPlanByPlanUseCase',
    listAsignaturasPlanByPeriodoUseCase: 'configuracion.listAsignaturasPlanByPeriodoUseCase',
    createAsignaturaPlanUseCase: 'configuracion.createAsignaturaPlanUseCase',
    updateAsignaturaPlanUseCase: 'configuracion.updateAsignaturaPlanUseCase',
    deleteAsignaturaPlanUseCase: 'configuracion.deleteAsignaturaPlanUseCase',

    listPrerrequisitosByAsignaturaUseCase: 'configuracion.listPrerrequisitosByAsignaturaUseCase',
    listEsPrerrequisitoDeUseCase: 'configuracion.listEsPrerrequisitoDeUseCase',
    createPrerrequisitoUseCase: 'configuracion.createPrerrequisitoUseCase',
    deletePrerrequisitoUseCase: 'configuracion.deletePrerrequisitoUseCase',

    listActividadesUseCase: 'configuracion.listActividadesUseCase',
    getActividadByIdUseCase: 'configuracion.getActividadByIdUseCase',
    createActividadUseCase: 'configuracion.createActividadUseCase',
    updateActividadUseCase: 'configuracion.updateActividadUseCase',
    deleteActividadUseCase: 'configuracion.deleteActividadUseCase',
    setEstadoActividadUseCase: 'configuracion.setEstadoActividadUseCase',

    listAulasUseCase: 'configuracion.listAulasUseCase',
    getAulaByIdUseCase: 'configuracion.getAulaByIdUseCase',
    createAulaUseCase: 'configuracion.createAulaUseCase',
    updateAulaUseCase: 'configuracion.updateAulaUseCase',
    deleteAulaUseCase: 'configuracion.deleteAulaUseCase',
    setEstadoAulaUseCase: 'configuracion.setEstadoAulaUseCase',

    createTipoEvaluacionUseCase: 'configuracion.createTipoEvaluacionUseCase',
    getTipoEvaluacionByIdUseCase: 'configuracion.getTipoEvaluacionByIdUseCase',
    updateTipoEvaluacionUseCase: 'configuracion.updateTipoEvaluacionUseCase',
    deleteTipoEvaluacionUseCase: 'configuracion.deleteTipoEvaluacionUseCase',
    setEstadoTipoEvaluacionUseCase: 'configuracion.setEstadoTipoEvaluacionUseCase',

    // CONTROLLERS
    listCarrerasController: 'configuracion.listCarrerasController',
    getCarreraByIdController: 'configuracion.getCarreraByIdController',
    createCarreraController: 'configuracion.createCarreraController',
    updateCarreraController: 'configuracion.updateCarreraController',
    deleteCarreraController: 'configuracion.deleteCarreraController',
    uploadCarreraImagenController: 'configuracion.uploadCarreraImagenController',

    listMateriasController: 'configuracion.listMateriasController',
    getMateriaByIdController: 'configuracion.getMateriaByIdController',
    createMateriaController: 'configuracion.createMateriaController',
    updateMateriaController: 'configuracion.updateMateriaController',
    deleteMateriaController: 'configuracion.deleteMateriaController',

    listPlanesEstudiosController: 'configuracion.listPlanesEstudiosController',
    getPlanEstudiosByIdController: 'configuracion.getPlanEstudiosByIdController',
    getPlanEstudiosMatrizController: 'configuracion.getPlanEstudiosMatrizController',
    validarPlanEstudiosController: 'configuracion.validarPlanEstudiosController',
    createPlanEstudiosController: 'configuracion.createPlanEstudiosController',
    updatePlanEstudiosController: 'configuracion.updatePlanEstudiosController',
    marcarPlanEstudiosVigenteController: 'configuracion.marcarPlanEstudiosVigenteController',

    listPeriodosByPlanController: 'configuracion.listPeriodosByPlanController',
    createPeriodoController: 'configuracion.createPeriodoController',
    updatePeriodoController: 'configuracion.updatePeriodoController',
    deletePeriodoController: 'configuracion.deletePeriodoController',

    listAsignaturasPlanByPlanController: 'configuracion.listAsignaturasPlanByPlanController',
    listAsignaturasPlanByPeriodoController: 'configuracion.listAsignaturasPlanByPeriodoController',
    createAsignaturaPlanController: 'configuracion.createAsignaturaPlanController',
    updateAsignaturaPlanController: 'configuracion.updateAsignaturaPlanController',
    deleteAsignaturaPlanController: 'configuracion.deleteAsignaturaPlanController',

    listPrerrequisitosByAsignaturaController: 'configuracion.listPrerrequisitosByAsignaturaController',
    listEsPrerrequisitoDeController: 'configuracion.listEsPrerrequisitoDeController',
    createPrerrequisitoController: 'configuracion.createPrerrequisitoController',
    deletePrerrequisitoController: 'configuracion.deletePrerrequisitoController',

    listActividadesController: 'configuracion.listActividadesController',
    getActividadByIdController: 'configuracion.getActividadByIdController',
    createActividadController: 'configuracion.createActividadController',
    updateActividadController: 'configuracion.updateActividadController',
    deleteActividadController: 'configuracion.deleteActividadController',
    setEstadoActividadController: 'configuracion.setEstadoActividadController',

    listAulasController: 'configuracion.listAulasController',
    getAulaByIdController: 'configuracion.getAulaByIdController',
    createAulaController: 'configuracion.createAulaController',
    updateAulaController: 'configuracion.updateAulaController',
    deleteAulaController: 'configuracion.deleteAulaController',
    setEstadoAulaController: 'configuracion.setEstadoAulaController',

    createTipoEvaluacionController: 'configuracion.createTipoEvaluacionController',
    getTipoEvaluacionByIdController: 'configuracion.getTipoEvaluacionByIdController',
    updateTipoEvaluacionController: 'configuracion.updateTipoEvaluacionController',
    deleteTipoEvaluacionController: 'configuracion.deleteTipoEvaluacionController',
    setEstadoTipoEvaluacionController: 'configuracion.setEstadoTipoEvaluacionController',

    // ROUTERS
    carrerasRouter: 'configuracion.carrerasRouter',
    materiasRouter: 'configuracion.materiasRouter',
    planesEstudiosRouter: 'configuracion.planesEstudiosRouter',
    periodosRouter: 'configuracion.periodosRouter',
    asignaturasPlanRouter: 'configuracion.asignaturasPlanRouter',
    prerrequisitosRouter: 'configuracion.prerrequisitosRouter',
    actividadesRouter: 'configuracion.actividadesRouter',
    aulasRouter: 'configuracion.aulasRouter',
    tiposEvaluacionRouter: 'configuracion.tiposEvaluacionRouter',
};
