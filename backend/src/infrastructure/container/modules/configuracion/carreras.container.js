/**
 * Registro de dependencias del recurso Carreras
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Carreras
 * - Registrar Controllers del recurso Carreras
 * - Construir y registrar el router del recurso Carreras
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Carreras registrado
 */

import { CONFIGURACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListCarrerasUseCase } from '../../../../application/use-cases/configuracion/ListCarrerasUseCase.js';
import { CreateCarreraUseCase } from '../../../../application/use-cases/configuracion/CreateCarreraUseCase.js';
import { UpdateCarreraUseCase } from '../../../../application/use-cases/configuracion/UpdateCarreraUseCase.js';
import { DeleteCarreraUseCase } from '../../../../application/use-cases/configuracion/DeleteCarreraUseCase.js';
import { GetCarreraByIdUseCase } from '../../../../application/use-cases/configuracion/GetCarreraByIdUseCase.js';
import {
    CreateCarreraController,
    DeleteCarreraController,
    GetCarreraByIdController,
    ListCarrerasController,
    UpdateCarreraController,
} from '../../../../presentation/controllers/configuracion/index.js';
import { buildCarrerasRouter } from '../../../../presentation/routes/carreras.routes.js';

/**
 * Registra el recurso Carreras en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerCarrerasResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listCarrerasUseCase,
        (c) =>
            new ListCarrerasUseCase({
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getCarreraByIdUseCase,
        (c) =>
            new GetCarreraByIdUseCase({
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createCarreraUseCase,
        (c) =>
            new CreateCarreraUseCase({
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateCarreraUseCase,
        (c) =>
            new UpdateCarreraUseCase({
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteCarreraUseCase,
        (c) =>
            new DeleteCarreraUseCase({
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listCarrerasController,
        (c) =>
            new ListCarrerasController({
                listCarrerasUseCase: c.resolve(CONFIGURACION_TOKENS.listCarrerasUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getCarreraByIdController,
        (c) =>
            new GetCarreraByIdController({
                getCarreraByIdUseCase: c.resolve(CONFIGURACION_TOKENS.getCarreraByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createCarreraController,
        (c) =>
            new CreateCarreraController({
                createCarreraUseCase: c.resolve(CONFIGURACION_TOKENS.createCarreraUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateCarreraController,
        (c) =>
            new UpdateCarreraController({
                updateCarreraUseCase: c.resolve(CONFIGURACION_TOKENS.updateCarreraUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteCarreraController,
        (c) =>
            new DeleteCarreraController({
                deleteCarreraUseCase: c.resolve(CONFIGURACION_TOKENS.deleteCarreraUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.carrerasRouter,
        (c) => {
            const controllers = {
                listCarrerasController: c.resolve(CONFIGURACION_TOKENS.listCarrerasController),
                getCarreraByIdController: c.resolve(CONFIGURACION_TOKENS.getCarreraByIdController),
                createCarreraController: c.resolve(CONFIGURACION_TOKENS.createCarreraController),
                updateCarreraController: c.resolve(CONFIGURACION_TOKENS.updateCarreraController),
                deleteCarreraController: c.resolve(CONFIGURACION_TOKENS.deleteCarreraController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildCarrerasRouter({ controllers, middlewares });
        }
    );

    return container;
}

