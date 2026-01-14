/**
 * Registro de dependencias del recurso Paralelos
 * 
 * Responsabilidades:
 * - Registrar Use Cases del recurso Paralelos
 * - Registrar Controllers del recurso Paralelos
 * - Construir y registrar el router del recurso Paralelos
 * 
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Paralelos registrado
 */

import { ACADEMICO_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListParalelosUseCase } from '../../../../application/use-cases/academico/ListParalelosUseCase.js';
import { GetParaleloHorariosUseCase } from '../../../../application/use-cases/academico/GetParaleloHorariosUseCase.js';
import { ListParalelosController, GetParaleloScheduleController } from '../../../../presentation/controllers/academico/index.js';
import { buildParalelosRouter } from '../../../../presentation/routes/paralelos.routes.js';

/**
 * Registra el recurso Paralelos en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

export function registerParalelosResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        ACADEMICO_TOKENS.listParalelosUseCase,
        (c) =>
            new ListParalelosUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getParaleloHorariosUseCase,
        (c) =>
            new GetParaleloHorariosUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                courseRepository: c.resolve(REPOSITORIOS_TOKENS.courseRepository),
                courseScheduleRepository: c.resolve(REPOSITORIOS_TOKENS.courseScheduleRepository),
                planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // TODO: Agregar otros Use Cases cuando se implementen sus endpoints

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        ACADEMICO_TOKENS.listParalelosController,
        (c) =>
            new ListParalelosController({
                listParalelosUseCase: c.resolve(ACADEMICO_TOKENS.listParalelosUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getParaleloScheduleController,
        (c) =>
            new GetParaleloScheduleController({
                getParaleloHorariosUseCase: c.resolve(ACADEMICO_TOKENS.getParaleloHorariosUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // TODO: Agregar otros Controllers cuando se implementen sus endpoints

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        ACADEMICO_TOKENS.paralelosRouter,
        (c) => {
            const controllers = {
                listParalelosController: c.resolve(ACADEMICO_TOKENS.listParalelosController),
                getParaleloScheduleController: c.resolve(ACADEMICO_TOKENS.getParaleloScheduleController),
                // TODO: Agregar otros controllers cuando se implementen sus rutas
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildParalelosRouter({ controllers, middlewares });
        }
    );

    return container;
}
