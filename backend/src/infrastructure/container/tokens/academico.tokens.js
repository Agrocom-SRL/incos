/**
 * Tokens del Módulo Académico
 * 
 * Convenciones:
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'academico.listParalelosUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'academico.listParalelosController')
 * - Routers: {modulo}_{entity}Router (ej: 'academico.paralelosRouter')
 */

export const ACADEMICO_TOKENS = {
    // USE CASES
    listParalelosUseCase: 'academico.listParalelosUseCase',
    getParaleloHorariosUseCase: 'academico.getParaleloHorariosUseCase',
    getParaleloCursosOfertaUseCase: 'academico.getParaleloCursosOfertaUseCase',
    createParaleloCursoOfertaUseCase: 'academico.createParaleloCursoOfertaUseCase',
    putParaleloScheduleUseCase: 'academico.putParaleloScheduleUseCase',
    listGestionesUseCase: 'academico.listGestionesUseCase',
    getParalelosEstadoDashboardUseCase: 'academico.getParalelosEstadoDashboardUseCase',
    getAsignaturasSinCursoDashboardUseCase: 'academico.getAsignaturasSinCursoDashboardUseCase',
    getCapacidadTurnoDashboardUseCase: 'academico.getCapacidadTurnoDashboardUseCase',
    getHorariosSidebarPendientesUseCase: 'academico.getHorariosSidebarPendientesUseCase',
    getHorariosPublicacionPlanesUseCase: 'academico.getHorariosPublicacionPlanesUseCase',
    listCoordinacionCalificacionesDocentesUseCase: 'academico.listCoordinacionCalificacionesDocentesUseCase',
    listCursosCalificacionesUseCase: 'academico.listCursosCalificacionesUseCase',
    getPoliticaInstitucionalUseCase: 'academico.getPoliticaInstitucionalUseCase',
    getPoliticaCatalogoUseCase: 'academico.getPoliticaCatalogoUseCase',
    listTiposEvaluacionUseCase: 'academico.listTiposEvaluacionUseCase',
    savePoliticaInstitucionalUseCase: 'academico.savePoliticaInstitucionalUseCase',
    getGestionBimestresUseCase: 'academico.getGestionBimestresUseCase',
    iniciarGestionAcademicaUseCase: 'academico.iniciarGestionAcademicaUseCase',
    validarCierreBimestreUseCase: 'academico.validarCierreBimestreUseCase',
    cerrarBimestreGestionUseCase: 'academico.cerrarBimestreGestionUseCase',
    getAjustesCursoUseCase: 'academico.getAjustesCursoUseCase',
    saveAjustesCursoUseCase: 'academico.saveAjustesCursoUseCase',
    getRegistroNotasCursoUseCase: 'academico.getRegistroNotasCursoUseCase',
    getCuadernoBimestreUseCase: 'academico.getCuadernoBimestreUseCase',
    createEvaluacionCuadernoUseCase: 'academico.createEvaluacionCuadernoUseCase',
    updateEvaluacionCuadernoUseCase: 'academico.updateEvaluacionCuadernoUseCase',
    deleteEvaluacionCuadernoUseCase: 'academico.deleteEvaluacionCuadernoUseCase',
    upsertNotaCuadernoUseCase: 'academico.upsertNotaCuadernoUseCase',
    resetNotasEvaluacionCuadernoUseCase: 'academico.resetNotasEvaluacionCuadernoUseCase',
    guardarNotasCuadernoBimestreUseCase: 'academico.guardarNotasCuadernoBimestreUseCase',

    // CONTROLLERS
    listParalelosController: 'academico.listParalelosController',
    getParaleloScheduleController: 'academico.getParaleloScheduleController',
    getParaleloCursosOfertaController: 'academico.getParaleloCursosOfertaController',
    postParaleloCursoController: 'academico.postParaleloCursoController',
    putParaleloScheduleController: 'academico.putParaleloScheduleController',
    listGestionesController: 'academico.listGestionesController',
    getDashboardParalelosEstadoController: 'academico.getDashboardParalelosEstadoController',
    getDashboardAsignaturasSinCursoController: 'academico.getDashboardAsignaturasSinCursoController',
    getDashboardCapacidadTurnoController: 'academico.getDashboardCapacidadTurnoController',
    getDashboardHorariosPendientesController: 'academico.getDashboardHorariosPendientesController',
    getHorariosPublicacionPlanesController: 'academico.getHorariosPublicacionPlanesController',
    listCoordinacionCalificacionesDocentesController: 'academico.listCoordinacionCalificacionesDocentesController',
    listCursosCalificacionesController: 'academico.listCursosCalificacionesController',
    getPoliticaInstitucionalController: 'academico.getPoliticaInstitucionalController',
    getPoliticaCatalogoController: 'academico.getPoliticaCatalogoController',
    listTiposEvaluacionController: 'academico.listTiposEvaluacionController',
    savePoliticaInstitucionalController: 'academico.savePoliticaInstitucionalController',
    getGestionBimestresController: 'academico.getGestionBimestresController',
    iniciarGestionAcademicaController: 'academico.iniciarGestionAcademicaController',
    validarCierreBimestreController: 'academico.validarCierreBimestreController',
    cerrarBimestreGestionController: 'academico.cerrarBimestreGestionController',
    getAjustesCursoController: 'academico.getAjustesCursoController',
    saveAjustesCursoController: 'academico.saveAjustesCursoController',
    getRegistroNotasCursoController: 'academico.getRegistroNotasCursoController',
    getCuadernoBimestreController: 'academico.getCuadernoBimestreController',
    createEvaluacionCuadernoController: 'academico.createEvaluacionCuadernoController',
    updateEvaluacionCuadernoController: 'academico.updateEvaluacionCuadernoController',
    deleteEvaluacionCuadernoController: 'academico.deleteEvaluacionCuadernoController',
    upsertNotaCuadernoController: 'academico.upsertNotaCuadernoController',
    resetNotasEvaluacionCuadernoController: 'academico.resetNotasEvaluacionCuadernoController',
    guardarNotasCuadernoBimestreController: 'academico.guardarNotasCuadernoBimestreController',

    updateCursoOfertaUseCase: 'academico.updateCursoOfertaUseCase',
    deleteCursoOfertaUseCase: 'academico.deleteCursoOfertaUseCase',

    patchCursoOfertaController: 'academico.patchCursoOfertaController',
    deleteCursoOfertaController: 'academico.deleteCursoOfertaController',

    // ROUTERS
    paralelosRouter: 'academico.paralelosRouter',
    gestionesRouter: 'academico.gestionesRouter',
    cursosRouter: 'academico.cursosRouter',
    calificacionesRouter: 'academico.calificacionesRouter',
};
