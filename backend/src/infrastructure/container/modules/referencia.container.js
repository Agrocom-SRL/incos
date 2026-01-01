/**
 * Registro de dependencias del módulo Referencia (REF)
 * 
 * Responsabilidades:
 * - Registrar Use Cases con sus dependencias (repositorios, logger)
 * - Registrar Controllers vinculados a Use Cases
 * - Construir y registrar los routers del módulo con middlewares
 * 
 * Nota: Los repositorios y servicios base se registran en sus propios containers.
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo de referencia registrado
 */

import { TOKENS } from '../tokens.js';

// ============================================
// USE CASES
// ============================================
import { ListIdiomasUseCase } from '../../../application/use-cases/referencia/ListIdiomasUseCase.js';
import { ListEstadosCivilesUseCase } from '../../../application/use-cases/referencia/ListEstadosCivilesUseCase.js';
import { ListTiposParentescoUseCase } from '../../../application/use-cases/referencia/ListTiposParentescoUseCase.js';
import { ListDocumentacionUseCase } from '../../../application/use-cases/referencia/ListDocumentacionUseCase.js';
// TODO: Agregar otros Use Cases cuando se implementen sus endpoints
// import { CreateIdiomaUseCase } from '../../../application/use-cases/referencia/CreateIdiomaUseCase.js';
// import { GetIdiomaByIdUseCase } from '../../../application/use-cases/referencia/GetIdiomaByIdUseCase.js';
// import { UpdateIdiomaUseCase } from '../../../application/use-cases/referencia/UpdateIdiomaUseCase.js';

// ============================================
// CONTROLLERS
// ============================================
import { ListIdiomasController, ListEstadosCivilesController, ListTiposParentescoController, ListDocumentacionController } from '../../../presentation/controllers/referencia/index.js';
// TODO: Agregar otros Controllers cuando se implementen sus endpoints
// import { CreateIdiomaController } from '../../../presentation/controllers/referencia/create.controller.js';
// import { GetIdiomaByIdController } from '../../../presentation/controllers/referencia/get-by-id.controller.js';
// import { UpdateIdiomaController } from '../../../presentation/controllers/referencia/update.controller.js';

// ============================================
// ROUTER BUILDERS
// ============================================
import { buildIdiomasRouter } from '../../../presentation/routes/idiomas.routes.js';
import { buildEstadosCivilesRouter } from '../../../presentation/routes/estados-civiles.routes.js';
import { buildTiposParentescoRouter } from '../../../presentation/routes/tipos-parentesco.routes.js';
import { buildDocumentacionRouter } from '../../../presentation/routes/documentacion.routes.js';

/**
 * Registra el módulo de Referencia en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerReferenciaModule(container) {
    // ============================================
    // USE CASES - IDIOMAS
    // ============================================
    container.register(
        TOKENS.ref_listIdiomasUseCase,
        (c) =>
            new ListIdiomasUseCase({
                languageRepository: c.resolve(TOKENS.languageRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.ref_createIdiomaUseCase,
    //     (c) => new CreateIdiomaUseCase({ ... }),
    //     { singleton: true }
    // );

    // ============================================
    // USE CASES - ESTADOS CIVILES
    // ============================================
    container.register(
        TOKENS.ref_listEstadosCivilesUseCase,
        (c) =>
            new ListEstadosCivilesUseCase({
                civilStatusRepository: c.resolve(TOKENS.civilStatusRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // USE CASES - TIPOS PARENTESCO
    // ============================================
    container.register(
        TOKENS.ref_listTiposParentescoUseCase,
        (c) =>
            new ListTiposParentescoUseCase({
                relationshipTypeRepository: c.resolve(TOKENS.relationshipTypeRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // USE CASES - DOCUMENTACIÓN
    // ============================================
    container.register(
        TOKENS.ref_listDocumentacionUseCase,
        (c) =>
            new ListDocumentacionUseCase({
                documentacionRepository: c.resolve(TOKENS.documentacionRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - IDIOMAS
    // ============================================
    container.register(
        TOKENS.ref_listIdiomasController,
        (c) =>
            new ListIdiomasController({
                listIdiomasUseCase: c.resolve(TOKENS.ref_listIdiomasUseCase),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.ref_createIdiomaController,
    //     (c) => new CreateIdiomaController({ ... }),
    //     { singleton: true }
    // );

    // ============================================
    // CONTROLLERS - ESTADOS CIVILES
    // ============================================
    container.register(
        TOKENS.ref_listEstadosCivilesController,
        (c) =>
            new ListEstadosCivilesController({
                listEstadosCivilesUseCase: c.resolve(TOKENS.ref_listEstadosCivilesUseCase),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - TIPOS PARENTESCO
    // ============================================
    container.register(
        TOKENS.ref_listTiposParentescoController,
        (c) =>
            new ListTiposParentescoController({
                listTiposParentescoUseCase: c.resolve(TOKENS.ref_listTiposParentescoUseCase),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - DOCUMENTACIÓN
    // ============================================
    container.register(
        TOKENS.ref_listDocumentacionController,
        (c) =>
            new ListDocumentacionController({
                listDocumentacionUseCase: c.resolve(TOKENS.ref_listDocumentacionUseCase),
            }),
        { singleton: true }
    );

    // ============================================
    // ROUTERS
    // ============================================
    
    // Router de Idiomas
    container.register(
        TOKENS.ref_idiomasRouter,
        (c) => {
            const controllers = {
                listIdiomasController: c.resolve(TOKENS.ref_listIdiomasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildIdiomasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Estados Civiles
    container.register(
        TOKENS.ref_estadosCivilesRouter,
        (c) => {
            const controllers = {
                listEstadosCivilesController: c.resolve(TOKENS.ref_listEstadosCivilesController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildEstadosCivilesRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Tipos Parentesco
    container.register(
        TOKENS.ref_tiposParentescoRouter,
        (c) => {
            const controllers = {
                listTiposParentescoController: c.resolve(TOKENS.ref_listTiposParentescoController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildTiposParentescoRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Documentación
    container.register(
        TOKENS.ref_documentacionRouter,
        (c) => {
            const controllers = {
                listDocumentacionController: c.resolve(TOKENS.ref_listDocumentacionController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {};

            return buildDocumentacionRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

