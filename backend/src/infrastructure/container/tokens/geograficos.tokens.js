/**
 * Tokens del Módulo Geográficos
 * 
 * Convenciones:
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'geograficos.listPaisesUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'geograficos.listPaisesController')
 * - Routers: {modulo}_{entity}Router (ej: 'geograficos.paisesRouter')
 */

export const GEOGRAFICOS_TOKENS = {
    // USE CASES
    listPaisesUseCase: 'geograficos.listPaisesUseCase',
    listDepartamentosUseCase: 'geograficos.listDepartamentosUseCase',
    listProvinciasUseCase: 'geograficos.listProvinciasUseCase',
    listMunicipiosUseCase: 'geograficos.listMunicipiosUseCase',

    // CONTROLLERS
    listPaisesController: 'geograficos.listPaisesController',
    listDepartamentosController: 'geograficos.listDepartamentosController',
    listProvinciasController: 'geograficos.listProvinciasController',
    listMunicipiosController: 'geograficos.listMunicipiosController',

    // ROUTERS
    paisesRouter: 'geograficos.paisesRouter',
    departamentosRouter: 'geograficos.departamentosRouter',
    provinciasRouter: 'geograficos.provinciasRouter',
    municipiosRouter: 'geograficos.municipiosRouter',
};

