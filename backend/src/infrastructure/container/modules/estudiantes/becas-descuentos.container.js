/**
 * Registro de dependencias del recurso Becas y Descuentos
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Becas y Descuentos
 * - Registrar Controllers del recurso Becas y Descuentos
 * - Construir y registrar el router del recurso Becas y Descuentos
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Becas y Descuentos registrado
 */

import { ESTUDIANTES_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListBecasDescuentosUseCase } from '../../../../application/use-cases/estudiantes/ListBecasDescuentosUseCase.js';
import { CreateBecaDescuentoUseCase } from '../../../../application/use-cases/estudiantes/CreateBecaDescuentoUseCase.js';
import { UpdateBecaDescuentoUseCase } from '../../../../application/use-cases/estudiantes/UpdateBecaDescuentoUseCase.js';
import { GetBecaDescuentoByIdUseCase } from '../../../../application/use-cases/estudiantes/GetBecaDescuentoByIdUseCase.js';
import { DeleteBecaDescuentoUseCase } from '../../../../application/use-cases/estudiantes/DeleteBecaDescuentoUseCase.js';
import { SetEstadoBecaDescuentoUseCase } from '../../../../application/use-cases/estudiantes/SetEstadoBecaDescuentoUseCase.js';
import {
    ListBecasDescuentosController,
    CreateBecaDescuentoController,
    UpdateBecaDescuentoController,
    GetBecaDescuentoByIdController,
    DeleteBecaDescuentoController,
    SetEstadoBecaDescuentoController,
} from '../../../../presentation/controllers/estudiantes/becas/index.js';
import { buildBecasDescuentosRouter } from '../../../../presentation/routes/becas-descuentos.routes.js';

/**
 * Registra el recurso Becas y Descuentos en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerBecasDescuentosResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listBecasDescuentosUseCase,
        (c) =>
            new ListBecasDescuentosUseCase({
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                finanzasUsosViewRepository: c.resolve(
                    REPOSITORIOS_TOKENS.finanzasUsosViewRepository,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.createBecaDescuentoUseCase,
        (c) =>
            new CreateBecaDescuentoUseCase({
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.updateBecaDescuentoUseCase,
        (c) =>
            new UpdateBecaDescuentoUseCase({
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getBecaDescuentoByIdUseCase,
        (c) =>
            new GetBecaDescuentoByIdUseCase({
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.deleteBecaDescuentoUseCase,
        (c) =>
            new DeleteBecaDescuentoUseCase({
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.setEstadoBecaDescuentoUseCase,
        (c) =>
            new SetEstadoBecaDescuentoUseCase({
                scholarshipRepository: c.resolve(REPOSITORIOS_TOKENS.scholarshipRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.listBecasDescuentosController,
        (c) =>
            new ListBecasDescuentosController({
                listBecasDescuentosUseCase: c.resolve(ESTUDIANTES_TOKENS.listBecasDescuentosUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.createBecaDescuentoController,
        (c) =>
            new CreateBecaDescuentoController({
                createBecaDescuentoUseCase: c.resolve(ESTUDIANTES_TOKENS.createBecaDescuentoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.updateBecaDescuentoController,
        (c) =>
            new UpdateBecaDescuentoController({
                updateBecaDescuentoUseCase: c.resolve(ESTUDIANTES_TOKENS.updateBecaDescuentoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.getBecaDescuentoByIdController,
        (c) =>
            new GetBecaDescuentoByIdController({
                getBecaDescuentoByIdUseCase: c.resolve(ESTUDIANTES_TOKENS.getBecaDescuentoByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.deleteBecaDescuentoController,
        (c) =>
            new DeleteBecaDescuentoController({
                deleteBecaDescuentoUseCase: c.resolve(ESTUDIANTES_TOKENS.deleteBecaDescuentoUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ESTUDIANTES_TOKENS.setEstadoBecaDescuentoController,
        (c) =>
            new SetEstadoBecaDescuentoController({
                setEstadoBecaDescuentoUseCase: c.resolve(
                    ESTUDIANTES_TOKENS.setEstadoBecaDescuentoUseCase,
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        ESTUDIANTES_TOKENS.becasDescuentosRouter,
        (c) => {
            const controllers = {
                listBecasDescuentosController: c.resolve(ESTUDIANTES_TOKENS.listBecasDescuentosController),
                createBecaDescuentoController: c.resolve(ESTUDIANTES_TOKENS.createBecaDescuentoController),
                updateBecaDescuentoController: c.resolve(ESTUDIANTES_TOKENS.updateBecaDescuentoController),
                getBecaDescuentoByIdController: c.resolve(ESTUDIANTES_TOKENS.getBecaDescuentoByIdController),
                deleteBecaDescuentoController: c.resolve(ESTUDIANTES_TOKENS.deleteBecaDescuentoController),
                setEstadoBecaDescuentoController: c.resolve(
                    ESTUDIANTES_TOKENS.setEstadoBecaDescuentoController,
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildBecasDescuentosRouter({ controllers, middlewares });
        }
    );

    return container;
}
