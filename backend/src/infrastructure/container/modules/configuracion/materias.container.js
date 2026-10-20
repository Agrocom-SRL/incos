/**
 * Registro de dependencias del recurso Materias
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Materias
 * - Registrar Controllers del recurso Materias
 * - Construir y registrar el router del recurso Materias
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Materias registrado
 */

import { CONFIGURACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListMateriasUseCase } from '../../../../application/use-cases/configuracion/ListMateriasUseCase.js';
import { CreateMateriaUseCase } from '../../../../application/use-cases/configuracion/CreateMateriaUseCase.js';
import { UpdateMateriaUseCase } from '../../../../application/use-cases/configuracion/UpdateMateriaUseCase.js';
import { DeleteMateriaUseCase } from '../../../../application/use-cases/configuracion/DeleteMateriaUseCase.js';
import { GetMateriaByIdUseCase } from '../../../../application/use-cases/configuracion/GetMateriaByIdUseCase.js';
import {
    CreateMateriaController,
    DeleteMateriaController,
    GetMateriaByIdController,
    ListMateriasController,
    UpdateMateriaController,
} from '../../../../presentation/controllers/configuracion/index.js';
import { buildMateriasRouter } from '../../../../presentation/routes/materias.routes.js';

/**
 * Registra el recurso Materias en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerMateriasResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listMateriasUseCase,
        (c) =>
            new ListMateriasUseCase({
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getMateriaByIdUseCase,
        (c) =>
            new GetMateriaByIdUseCase({
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createMateriaUseCase,
        (c) =>
            new CreateMateriaUseCase({
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateMateriaUseCase,
        (c) =>
            new UpdateMateriaUseCase({
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteMateriaUseCase,
        (c) =>
            new DeleteMateriaUseCase({
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.listMateriasController,
        (c) =>
            new ListMateriasController({
                listMateriasUseCase: c.resolve(CONFIGURACION_TOKENS.listMateriasUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getMateriaByIdController,
        (c) =>
            new GetMateriaByIdController({
                getMateriaByIdUseCase: c.resolve(CONFIGURACION_TOKENS.getMateriaByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.createMateriaController,
        (c) =>
            new CreateMateriaController({
                createMateriaUseCase: c.resolve(CONFIGURACION_TOKENS.createMateriaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateMateriaController,
        (c) =>
            new UpdateMateriaController({
                updateMateriaUseCase: c.resolve(CONFIGURACION_TOKENS.updateMateriaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteMateriaController,
        (c) =>
            new DeleteMateriaController({
                deleteMateriaUseCase: c.resolve(CONFIGURACION_TOKENS.deleteMateriaUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.materiasRouter,
        (c) => {
            const controllers = {
                listMateriasController: c.resolve(CONFIGURACION_TOKENS.listMateriasController),
                getMateriaByIdController: c.resolve(CONFIGURACION_TOKENS.getMateriaByIdController),
                createMateriaController: c.resolve(CONFIGURACION_TOKENS.createMateriaController),
                updateMateriaController: c.resolve(CONFIGURACION_TOKENS.updateMateriaController),
                deleteMateriaController: c.resolve(CONFIGURACION_TOKENS.deleteMateriaController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildMateriasRouter({ controllers, middlewares });
        }
    );

    return container;
}
