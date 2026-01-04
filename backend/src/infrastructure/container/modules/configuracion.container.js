/**
 * Registro de dependencias del módulo Configuración (CFG)
 * 
 * Responsabilidades:
 * - Registrar Use Cases con sus dependencias (repositorios, logger)
 * - Registrar Controllers vinculados a Use Cases
 * - Construir y registrar los routers del módulo con middlewares
 * 
 * Nota: Los repositorios y servicios base se registran en sus propios containers.
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo de configuración registrado
 */

import { TOKENS } from '../tokens.js';

// ============================================
// USE CASES
// ============================================
import { ListCarrerasUseCase } from '../../../application/use-cases/configuracion/ListCarrerasUseCase.js';
import { ListMateriasUseCase } from '../../../application/use-cases/configuracion/ListMateriasUseCase.js';
import { ListDiscapacidadUseCase } from '../../../application/use-cases/configuracion/ListDiscapacidadUseCase.js';
// TODO: Agregar otros Use Cases cuando se implementen sus endpoints
// import { CreateCarreraUseCase } from '../../../application/use-cases/configuracion/CreateCarreraUseCase.js';
// import { GetCarreraByIdUseCase } from '../../../application/use-cases/configuracion/GetCarreraByIdUseCase.js';
// import { UpdateCarreraUseCase } from '../../../application/use-cases/configuracion/UpdateCarreraUseCase.js';

// ============================================
// CONTROLLERS
// ============================================
import { ListCarrerasController, ListMateriasController, ListDiscapacidadController } from '../../../presentation/controllers/configuracion/index.js';
// TODO: Agregar otros Controllers cuando se implementen sus endpoints
// import { CreateCarreraController } from '../../../presentation/controllers/configuracion/create.controller.js';
// import { GetCarreraByIdController } from '../../../presentation/controllers/configuracion/get-by-id.controller.js';
// import { UpdateCarreraController } from '../../../presentation/controllers/configuracion/update.controller.js';

// ============================================
// ROUTER BUILDERS
// ============================================
import { buildCarrerasRouter } from '../../../presentation/routes/carreras.routes.js';
import { buildMateriasRouter } from '../../../presentation/routes/materias.routes.js';
import { buildDiscapacidadRouter } from '../../../presentation/routes/discapacidad.routes.js';

/**
 * Registra el módulo de Configuración en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerConfiguracionModule(container) {
    // ============================================
    // USE CASES - CARRERAS
    // ============================================
    container.register(
        TOKENS.cfg_listCarrerasUseCase,
        (c) =>
            new ListCarrerasUseCase({
                careerRepository: c.resolve(TOKENS.careerRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.cfg_createCarreraUseCase,
    //     (c) => new CreateCarreraUseCase({ ... }),
    //     { singleton: true }
    // );

    // ============================================
    // USE CASES - MATERIAS
    // ============================================
    container.register(
        TOKENS.cfg_listMateriasUseCase,
        (c) =>
            new ListMateriasUseCase({
                subjectRepository: c.resolve(TOKENS.subjectRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // USE CASES - DISCAPACIDAD
    // ============================================
    container.register(
        TOKENS.cfg_listDiscapacidadUseCase,
        (c) =>
            new ListDiscapacidadUseCase({
                disabilityTypeRepository: c.resolve(TOKENS.disabilityTypeRepository),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - CARRERAS
    // ============================================
    container.register(
        TOKENS.cfg_listCarrerasController,
        (c) =>
            new ListCarrerasController({
                listCarrerasUseCase: c.resolve(TOKENS.cfg_listCarrerasUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints
    // container.register(
    //     TOKENS.cfg_createCarreraController,
    //     (c) => new CreateCarreraController({ ... }),
    //     { singleton: true }
    // );

    // ============================================
    // CONTROLLERS - MATERIAS
    // ============================================
    container.register(
        TOKENS.cfg_listMateriasController,
        (c) =>
            new ListMateriasController({
                listMateriasUseCase: c.resolve(TOKENS.cfg_listMateriasUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // CONTROLLERS - DISCAPACIDAD
    // ============================================
    container.register(
        TOKENS.cfg_listDiscapacidadController,
        (c) =>
            new ListDiscapacidadController({
                listDiscapacidadUseCase: c.resolve(TOKENS.cfg_listDiscapacidadUseCase),
                logger: c.resolve(TOKENS.logger),
            }),
        { singleton: true }
    );

    // ============================================
    // ROUTERS
    // ============================================
    
    // Router de Carreras
    container.register(
        TOKENS.cfg_carrerasRouter,
        (c) => {
            const controllers = {
                listCarrerasController: c.resolve(TOKENS.cfg_listCarrerasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
                // createCarreraController: c.resolve(TOKENS.cfg_createCarreraController),
                // getCarreraByIdController: c.resolve(TOKENS.cfg_getCarreraByIdController),
                // updateCarreraController: c.resolve(TOKENS.cfg_updateCarreraController),
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildCarrerasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Materias
    container.register(
        TOKENS.cfg_materiasRouter,
        (c) => {
            const controllers = {
                listMateriasController: c.resolve(TOKENS.cfg_listMateriasController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildMateriasRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    // Router de Discapacidad
    container.register(
        TOKENS.cfg_discapacidadRouter,
        (c) => {
            const controllers = {
                listDiscapacidadController: c.resolve(TOKENS.cfg_listDiscapacidadController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(TOKENS.validateRequest),
            };

            return buildDiscapacidadRouter({ controllers, middlewares });
        },
        { singleton: true }
    );

    return container;
}

