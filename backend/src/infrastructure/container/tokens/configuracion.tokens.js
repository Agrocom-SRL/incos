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
    listMateriasUseCase: 'configuracion.listMateriasUseCase',

    // CONTROLLERS
    listCarrerasController: 'configuracion.listCarrerasController',
    listMateriasController: 'configuracion.listMateriasController',

    // ROUTERS
    carrerasRouter: 'configuracion.carrerasRouter',
    materiasRouter: 'configuracion.materiasRouter',
};

