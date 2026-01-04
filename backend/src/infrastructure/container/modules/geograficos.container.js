/**
 * Registro de dependencias del módulo Geográficos (GEO)
 * 
 * Responsabilidades:
 * - Registrar Use Cases con sus dependencias (repositorios, logger)
 * - Registrar Controllers vinculados a Use Cases
 * - Construir y registrar los routers del módulo con middlewares
 * 
 * Nota: Los repositorios y servicios base se registran en sus propios containers.
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo de geográficos registrado
 */

import { TOKENS } from '../tokens.js';

// ============================================
// USE CASES
// ============================================
import { ListPaisesUseCase } from '../../../application/use-cases/geograficos/ListPaisesUseCase.js';
import { ListDepartamentosUseCase } from '../../../application/use-cases/geograficos/ListDepartamentosUseCase.js';
import { ListProvinciasUseCase } from '../../../application/use-cases/geograficos/ListProvinciasUseCase.js';
import { ListMunicipiosUseCase } from '../../../application/use-cases/geograficos/ListMunicipiosUseCase.js';
// TODO: Agregar otros Use Cases cuando se implementen sus endpoints
// import { CreatePaisUseCase } from '../../../application/use-cases/geograficos/CreatePaisUseCase.js';
// import { GetPaisByIdUseCase } from '../../../application/use-cases/geograficos/GetPaisByIdUseCase.js';
// import { UpdatePaisUseCase } from '../../../application/use-cases/geograficos/UpdatePaisUseCase.js';

// ============================================
// CONTROLLERS
// ============================================
import { ListPaisesController, ListDepartamentosController, ListProvinciasController, ListMunicipiosController } from '../../../presentation/controllers/geograficos/index.js';
// TODO: Agregar otros Controllers cuando se implementen sus endpoints
// import { CreatePaisController } from '../../../presentation/controllers/geograficos/create.controller.js';
// import { GetPaisByIdController } from '../../../presentation/controllers/geograficos/get-by-id.controller.js';
// import { UpdatePaisController } from '../../../presentation/controllers/geograficos/update.controller.js';

// ============================================
// ROUTER BUILDERS
// ============================================
import { buildPaisesRouter } from '../../../presentation/routes/paises.routes.js';
import { buildDepartamentosRouter } from '../../../presentation/routes/departamentos.routes.js';
import { buildProvinciasRouter } from '../../../presentation/routes/provincias.routes.js';
import { buildMunicipiosRouter } from '../../../presentation/routes/municipios.routes.js';

/**
 * Registra el módulo de Geográficos en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerGeograficosModule(container) {
    // ============================================
    // USE CASES - PAÍSES
    // ============================================
    container.register(
        TOKENS.geo_listPaisesUseCase,
        (c) =>
            new ListPaisesUseCase({
                countryRepository: c.resolve(TOKENS.countryRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.geo_createPaisUseCase,
    //     (c) => new CreatePaisUseCase({ ... }),
    //     { singleton: true }
    // );

    // ============================================
    // USE CASES - DEPARTAMENTOS
    // ============================================
    container.register(
        TOKENS.geo_listDepartamentosUseCase,
        (c) =>
            new ListDepartamentosUseCase({
                departmentRepository: c.resolve(TOKENS.departmentRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // USE CASES - PROVINCIAS
    // ============================================
    container.register(
        TOKENS.geo_listProvinciasUseCase,
        (c) =>
            new ListProvinciasUseCase({
                provinceRepository: c.resolve(TOKENS.provinceRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // USE CASES - MUNICIPIOS
    // ============================================
    container.register(
        TOKENS.geo_listMunicipiosUseCase,
        (c) =>
            new ListMunicipiosUseCase({
                municipalityRepository: c.resolve(TOKENS.municipalityRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - PAÍSES
    // ============================================
    container.register(
        TOKENS.geo_listPaisesController,
        (c) =>
            new ListPaisesController({
                listPaisesUseCase: c.resolve(TOKENS.geo_listPaisesUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.geo_createPaisController,
    //     (c) => new CreatePaisController({ ... }),
    //     { singleton: true }
    // );

    // ============================================
    // CONTROLLERS - DEPARTAMENTOS
    // ============================================
    container.register(
        TOKENS.geo_listDepartamentosController,
        (c) =>
            new ListDepartamentosController({
                listDepartamentosUseCase: c.resolve(TOKENS.geo_listDepartamentosUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - PROVINCIAS
    // ============================================
    container.register(
        TOKENS.geo_listProvinciasController,
        (c) =>
            new ListProvinciasController({
                listProvinciasUseCase: c.resolve(TOKENS.geo_listProvinciasUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - MUNICIPIOS
    // ============================================
    container.register(
        TOKENS.geo_listMunicipiosController,
        (c) =>
            new ListMunicipiosController({
                listMunicipiosUseCase: c.resolve(TOKENS.geo_listMunicipiosUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // ROUTERS
    // ============================================
    
    // Router de Países
    container.register(
        TOKENS.geo_paisesRouter,
        (c) => {
            const controllers = {
                listPaisesController: c.resolve(TOKENS.geo_listPaisesController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildPaisesRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Departamentos
    container.register(
        TOKENS.geo_departamentosRouter,
        (c) => {
            const controllers = {
                listDepartamentosController: c.resolve(TOKENS.geo_listDepartamentosController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildDepartamentosRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Provincias
    container.register(
        TOKENS.geo_provinciasRouter,
        (c) => {
            const controllers = {
                listProvinciasController: c.resolve(TOKENS.geo_listProvinciasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildProvinciasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Municipios
    container.register(
        TOKENS.geo_municipiosRouter,
        (c) => {
            const controllers = {
                listMunicipiosController: c.resolve(TOKENS.geo_listMunicipiosController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildMunicipiosRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

