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
import { CreateParaleloUseCase } from '../../../../application/use-cases/configuracion/CreateParaleloUseCase.js';
import { GetParaleloByIdUseCase } from '../../../../application/use-cases/configuracion/GetParaleloByIdUseCase.js';
import { UpdateParaleloUseCase } from '../../../../application/use-cases/configuracion/UpdateParaleloUseCase.js';
import { DeleteParaleloUseCase } from '../../../../application/use-cases/configuracion/DeleteParaleloUseCase.js';
import { SetEstadoParaleloUseCase } from '../../../../application/use-cases/configuracion/SetEstadoParaleloUseCase.js';
import { ListParalelosGestionByParaleloUseCase } from '../../../../application/use-cases/configuracion/ListParalelosGestionByParaleloUseCase.js';
import {
    CreateParaleloController,
    DeleteParaleloController,
    GetParaleloByIdController,
    ListParalelosGestionByParaleloController,
    SetEstadoParaleloController,
    UpdateParaleloController,
} from '../../../../presentation/controllers/configuracion/index.js';
import { GetAsignaturasSinCursoDashboardUseCase } from '../../../../application/use-cases/academico/GetAsignaturasSinCursoDashboardUseCase.js';
import { GetCapacidadTurnoDashboardUseCase } from '../../../../application/use-cases/academico/GetCapacidadTurnoDashboardUseCase.js';
import { GetParalelosEstadoDashboardUseCase } from '../../../../application/use-cases/academico/GetParalelosEstadoDashboardUseCase.js';
import { GetHorariosSidebarPendientesUseCase } from '../../../../application/use-cases/academico/GetHorariosSidebarPendientesUseCase.js';
import { GetHorariosPublicacionPlanesUseCase } from '../../../../application/use-cases/academico/GetHorariosPublicacionPlanesUseCase.js';
import { GetParaleloScheduleUseCase } from '../../../../application/use-cases/academico/GetParaleloScheduleUseCase.js';
import { PutParaleloScheduleUseCase } from '../../../../application/use-cases/academico/PutParaleloScheduleUseCase.js';
import {
    GetDashboardAsignaturasSinCursoController,
    GetDashboardCapacidadTurnoController,
    GetDashboardHorariosPendientesController,
    GetDashboardParalelosEstadoController,
    GetHorariosPublicacionPlanesController,
    GetParaleloScheduleController,
    PutParaleloScheduleController,
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
        ACADEMICO_TOKENS.createParaleloUseCase,
        (c) =>
            new CreateParaleloUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
                studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getParaleloByIdUseCase,
        (c) =>
            new GetParaleloByIdUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.updateParaleloUseCase,
        (c) =>
            new UpdateParaleloUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
                studyPlanRepository: c.resolve(REPOSITORIOS_TOKENS.studyPlanRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.deleteParaleloUseCase,
        (c) =>
            new DeleteParaleloUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.setEstadoParaleloUseCase,
        (c) =>
            new SetEstadoParaleloUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.listParalelosGestionByParaleloUseCase,
        (c) =>
            new ListParalelosGestionByParaleloUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                parallelManagementRepository: c.resolve(REPOSITORIOS_TOKENS.parallelManagementRepository),
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

    registerComponent(
        container,
        ACADEMICO_TOKENS.getParaleloScheduleUseCase,
        (c) =>
            new GetParaleloScheduleUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
                asignacionHorarioRepository: c.resolve(REPOSITORIOS_TOKENS.asignacionHorarioRepository),
                teacherAssignmentRepository: c.resolve(REPOSITORIOS_TOKENS.teacherAssignmentRepository),
                teacherRepository: c.resolve(REPOSITORIOS_TOKENS.teacherRepository),
                planSubjectRepository: c.resolve(REPOSITORIOS_TOKENS.planSubjectRepository),
                subjectRepository: c.resolve(REPOSITORIOS_TOKENS.subjectRepository),
                careerRepository: c.resolve(REPOSITORIOS_TOKENS.careerRepository),
                periodRepository: c.resolve(REPOSITORIOS_TOKENS.periodRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.putParaleloScheduleUseCase,
        (c) =>
            new PutParaleloScheduleUseCase({
                parallelRepository: c.resolve(REPOSITORIOS_TOKENS.parallelRepository),
                courseOfferRepository: c.resolve(REPOSITORIOS_TOKENS.courseOfferRepository),
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
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
        ACADEMICO_TOKENS.createParaleloController,
        (c) =>
            new CreateParaleloController({
                createParaleloUseCase: c.resolve(ACADEMICO_TOKENS.createParaleloUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.getParaleloByIdController,
        (c) =>
            new GetParaleloByIdController({
                getParaleloByIdUseCase: c.resolve(ACADEMICO_TOKENS.getParaleloByIdUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.updateParaleloController,
        (c) =>
            new UpdateParaleloController({
                updateParaleloUseCase: c.resolve(ACADEMICO_TOKENS.updateParaleloUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.deleteParaleloController,
        (c) =>
            new DeleteParaleloController({
                deleteParaleloUseCase: c.resolve(ACADEMICO_TOKENS.deleteParaleloUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.setEstadoParaleloController,
        (c) =>
            new SetEstadoParaleloController({
                setEstadoParaleloUseCase: c.resolve(ACADEMICO_TOKENS.setEstadoParaleloUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.listParalelosGestionByParaleloController,
        (c) =>
            new ListParalelosGestionByParaleloController({
                listParalelosGestionByParaleloUseCase: c.resolve(
                    ACADEMICO_TOKENS.listParalelosGestionByParaleloUseCase,
                ),
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

    registerComponent(
        container,
        ACADEMICO_TOKENS.getParaleloScheduleController,
        (c) =>
            new GetParaleloScheduleController({
                getParaleloScheduleUseCase: c.resolve(ACADEMICO_TOKENS.getParaleloScheduleUseCase),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        ACADEMICO_TOKENS.putParaleloScheduleController,
        (c) =>
            new PutParaleloScheduleController({
                putParaleloScheduleUseCase: c.resolve(ACADEMICO_TOKENS.putParaleloScheduleUseCase),
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
                createParaleloController: c.resolve(ACADEMICO_TOKENS.createParaleloController),
                getParaleloByIdController: c.resolve(ACADEMICO_TOKENS.getParaleloByIdController),
                updateParaleloController: c.resolve(ACADEMICO_TOKENS.updateParaleloController),
                deleteParaleloController: c.resolve(ACADEMICO_TOKENS.deleteParaleloController),
                setEstadoParaleloController: c.resolve(
                    ACADEMICO_TOKENS.setEstadoParaleloController,
                ),
                listParalelosGestionByParaleloController: c.resolve(
                    ACADEMICO_TOKENS.listParalelosGestionByParaleloController,
                ),
                getDashboardParalelosEstadoController: c.resolve(ACADEMICO_TOKENS.getDashboardParalelosEstadoController),
                getDashboardAsignaturasSinCursoController: c.resolve(ACADEMICO_TOKENS.getDashboardAsignaturasSinCursoController),
                getDashboardCapacidadTurnoController: c.resolve(ACADEMICO_TOKENS.getDashboardCapacidadTurnoController),
                getDashboardHorariosPendientesController: c.resolve(ACADEMICO_TOKENS.getDashboardHorariosPendientesController),
                getHorariosPublicacionPlanesController: c.resolve(ACADEMICO_TOKENS.getHorariosPublicacionPlanesController),
                getParaleloScheduleController: c.resolve(ACADEMICO_TOKENS.getParaleloScheduleController),
                putParaleloScheduleController: c.resolve(ACADEMICO_TOKENS.putParaleloScheduleController),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildParalelosRouter({ controllers, middlewares });
        }
    );

    return container;
}
