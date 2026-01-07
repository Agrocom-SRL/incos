/**
 * Tokens del Módulo Referencia
 * 
 * Convenciones:
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'referencia.listIdiomasUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'referencia.listIdiomasController')
 * - Routers: {modulo}_{entity}Router (ej: 'referencia.idiomasRouter')
 */

export const REFERENCIA_TOKENS = {
    // USE CASES
    listIdiomasUseCase: 'referencia.listIdiomasUseCase',
    listEstadosCivilesUseCase: 'referencia.listEstadosCivilesUseCase',
    listTiposParentescoUseCase: 'referencia.listTiposParentescoUseCase',
    listDocumentacionUseCase: 'referencia.listDocumentacionUseCase',
    listDiscapacidadUseCase: 'referencia.listDiscapacidadUseCase',

    // CONTROLLERS
    listIdiomasController: 'referencia.listIdiomasController',
    listEstadosCivilesController: 'referencia.listEstadosCivilesController',
    listTiposParentescoController: 'referencia.listTiposParentescoController',
    listDocumentacionController: 'referencia.listDocumentacionController',
    listDiscapacidadController: 'referencia.listDiscapacidadController',

    // ROUTERS
    idiomasRouter: 'referencia.idiomasRouter',
    estadosCivilesRouter: 'referencia.estadosCivilesRouter',
    tiposParentescoRouter: 'referencia.tiposParentescoRouter',
    documentacionRouter: 'referencia.documentacionRouter',
    discapacidadRouter: 'referencia.discapacidadRouter',
};

