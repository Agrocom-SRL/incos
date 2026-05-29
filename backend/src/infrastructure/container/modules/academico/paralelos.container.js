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
import { GetAsignaturasSinCursoDashboardUseCase } from '../../../../application/use-cases/academico/GetAsignaturasSinCursoDashboardUseCase.js';
import { GetCapacidadTurnoDashboardUseCase } from '../../../../application/use-cases/academico/GetCapacidadTurnoDashboardUseCase.js';
import { GetParalelosEstadoDashboardUseCase } from '../../../../application/use-cases/academico/GetParalelosEstadoDashboardUseCase.js';
import { GetHorariosSidebarPendientesUseCase } from '../../../../application/use-cases/academico/GetHorariosSidebarPendientesUseCase.js';
import { GetHorariosPublicacionPlanesUseCase } from '../../../../application/use-cases/academico/GetHorariosPublicacionPlanesUseCase.js';
import {
    GetDashboardAsignaturasSinCursoController,
    GetDashboardCapacidadTurnoController,
    GetDashboardHorariosPendientesController,
    GetDashboardParalelosEstadoController,
    GetHorariosPublicacionPlanesController,
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
                configuracionSistemaRepository: c.resolve(REPOSITORIOS_TOKENS.systemConfigurationRepository),
                managementRepository: c.resolve(REPOSITORIOS_TOKENS.managementRepository),
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

    registerComponent(
        container,
        ACADEMICO_TOKENS.getHorariosSidebarPendientesUseCase,
        (c) =>
            new GetHorariosSidebarPendientesUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getHorariosPublicacionPlanesUseCase,
        (c) =>
            new GetHorariosPublicacionPlanesUseCase({
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

    registerComponent(
        container,
        ACADEMICO_TOKENS.getDashboardHorariosPendientesController,
        (c) =>
            new GetDashboardHorariosPendientesController({
                getHorariosSidebarPendientesUseCase: c.resolve(ACADEMICO_TOKENS.getHorariosSidebarPendientesUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getHorariosPublicacionPlanesController,
        (c) =>
            new GetHorariosPublicacionPlanesController({
                getHorariosPublicacionPlanesUseCase: c.resolve(ACADEMICO_TOKENS.getHorariosPublicacionPlanesUseCase),
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
                getDashboardParalelosEstadoController: c.resolve(ACADEMICO_TOKENS.getDashboardParalelosEstadoController),
                getDashboardAsignaturasSinCursoController: c.resolve(ACADEMICO_TOKENS.getDashboardAsignaturasSinCursoController),
                getDashboardCapacidadTurnoController: c.resolve(ACADEMICO_TOKENS.getDashboardCapacidadTurnoController),
                getDashboardHorariosPendientesController: c.resolve(ACADEMICO_TOKENS.getDashboardHorariosPendientesController),
                getHorariosPublicacionPlanesController: c.resolve(ACADEMICO_TOKENS.getHorariosPublicacionPlanesController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildParalelosRouter({ controllers, middlewares });
        }
    );

    return container;
}
