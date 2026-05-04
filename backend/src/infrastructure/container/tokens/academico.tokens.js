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

    // ROUTERS
    paralelosRouter: 'academico.paralelosRouter',
    gestionesRouter: 'academico.gestionesRouter',
};
