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
import { GetAsignaturasSinCursoDashboardUseCase } from '../../../../application/use-cases/academico/GetAsignaturasSinCursoDashboardUseCase.js';
import { GetCapacidadTurnoDashboardUseCase } from '../../../../application/use-cases/academico/GetCapacidadTurnoDashboardUseCase.js';
import { GetParalelosEstadoDashboardUseCase } from '../../../../application/use-cases/academico/GetParalelosEstadoDashboardUseCase.js';
import {
    GetDashboardAsignaturasSinCursoController,
    GetDashboardCapacidadTurnoController,
    GetDashboardParalelosEstadoController,
    GetParaleloScheduleController,
    ListParalelosController,
} from '../../../../presentation/controllers/academico/index.js';
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
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.configuracionSistemaRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
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

    registerComponent(
        container,
        ACADEMICO_TOKENS.getParalelosEstadoDashboardUseCase,
        (c) =>
            new GetParalelosEstadoDashboardUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getAsignaturasSinCursoDashboardUseCase,
        (c) =>
            new GetAsignaturasSinCursoDashboardUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getCapacidadTurnoDashboardUseCase,
        (c) =>
            new GetCapacidadTurnoDashboardUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

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

    registerComponent(
        container,
        ACADEMICO_TOKENS.getDashboardParalelosEstadoController,
        (c) =>
            new GetDashboardParalelosEstadoController({
                getParalelosEstadoDashboardUseCase: c.resolve(ACADEMICO_TOKENS.getParalelosEstadoDashboardUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getDashboardAsignaturasSinCursoController,
        (c) =>
            new GetDashboardAsignaturasSinCursoController({
                getAsignaturasSinCursoDashboardUseCase: c.resolve(ACADEMICO_TOKENS.getAsignaturasSinCursoDashboardUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getDashboardCapacidadTurnoController,
        (c) =>
            new GetDashboardCapacidadTurnoController({
                getCapacidadTurnoDashboardUseCase: c.resolve(ACADEMICO_TOKENS.getCapacidadTurnoDashboardUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

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
                getDashboardParalelosEstadoController: c.resolve(ACADEMICO_TOKENS.getDashboardParalelosEstadoController),
                getDashboardAsignaturasSinCursoController: c.resolve(ACADEMICO_TOKENS.getDashboardAsignaturasSinCursoController),
                getDashboardCapacidadTurnoController: c.resolve(ACADEMICO_TOKENS.getDashboardCapacidadTurnoController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildParalelosRouter({ controllers, middlewares });
        }
    );

    return container;
}
