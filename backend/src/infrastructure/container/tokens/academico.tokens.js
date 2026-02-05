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
    listGestionesUseCase: 'academico.listGestionesUseCase',

    // CONTROLLERS
    listParalelosController: 'academico.listParalelosController',
    getParaleloScheduleController: 'academico.getParaleloScheduleController',
    listGestionesController: 'academico.listGestionesController',

    // ROUTERS
    paralelosRouter: 'academico.paralelosRouter',
    gestionesRouter: 'academico.gestionesRouter',
};
