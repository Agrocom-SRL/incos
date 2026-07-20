/**
 * Registro de dependencias del recurso Cursos de Capacitación (módulo CAP)
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Cursos de Capacitación
 * - Registrar Controllers del recurso Cursos de Capacitación
 * - Construir y registrar el router del recurso Cursos de Capacitación
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * NOTA: Los repositorios del módulo (CAPACITACION_TOKENS.*Repository) se
 * registran en ./index.js (registerCapacitacionModule). Los catálogos
 * reutilizados (aulas, horarios) se consumen de REPOSITORIOS_TOKENS.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { CAPACITACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListCursosCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/ListCursosCapacitacionUseCase.js';
import { ListHorariosDisponiblesCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/ListHorariosDisponiblesCapacitacionUseCase.js';
import { GetCursoCapacitacionByIdUseCase } from '../../../../application/use-cases/capacitacion/GetCursoCapacitacionByIdUseCase.js';
import { CreateCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/CreateCursoCapacitacionUseCase.js';
import { UpdateCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/UpdateCursoCapacitacionUseCase.js';
import { DeleteCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/DeleteCursoCapacitacionUseCase.js';
import { SetEstadoCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/SetEstadoCursoCapacitacionUseCase.js';
import {
    ListCursosCapacitacionController,
    ListHorariosDisponiblesCapacitacionController,
    GetCursoCapacitacionByIdController,
    CreateCursoCapacitacionController,
    UpdateCursoCapacitacionController,
    DeleteCursoCapacitacionController,
    SetEstadoCursoCapacitacionController,
} from '../../../../presentation/controllers/capacitacion/index.js';
import { buildCursosCapacitacionRouter } from '../../../../presentation/routes/cursos-capacitacion.routes.js';

export function registerCursosCapacitacionResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listCursosCapacitacionUseCase,
        (c) =>
            new ListCursosCapacitacionUseCase({
                cursoCapacitacionFichaViewRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionFichaViewRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.listHorariosDisponiblesCapacitacionUseCase,
        (c) =>
            new ListHorariosDisponiblesCapacitacionUseCase({
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getCursoCapacitacionByIdUseCase,
        (c) =>
            new GetCursoCapacitacionByIdUseCase({
                cursoCapacitacionFichaViewRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionFichaViewRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createCursoCapacitacionUseCase,
        (c) =>
            new CreateCursoCapacitacionUseCase({
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateCursoCapacitacionUseCase,
        (c) =>
            new UpdateCursoCapacitacionUseCase({
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteCursoCapacitacionUseCase,
        (c) =>
            new DeleteCursoCapacitacionUseCase({
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.setEstadoCursoCapacitacionUseCase,
        (c) =>
            new SetEstadoCursoCapacitacionUseCase({
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listCursosCapacitacionController,
        (c) =>
            new ListCursosCapacitacionController({
                listCursosCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.listCursosCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.listHorariosDisponiblesCapacitacionController,
        (c) =>
            new ListHorariosDisponiblesCapacitacionController({
                listHorariosDisponiblesCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.listHorariosDisponiblesCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getCursoCapacitacionByIdController,
        (c) =>
            new GetCursoCapacitacionByIdController({
                getCursoCapacitacionByIdUseCase: c.resolve(
                    CAPACITACION_TOKENS.getCursoCapacitacionByIdUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createCursoCapacitacionController,
        (c) =>
            new CreateCursoCapacitacionController({
                createCursoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.createCursoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateCursoCapacitacionController,
        (c) =>
            new UpdateCursoCapacitacionController({
                updateCursoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.updateCursoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteCursoCapacitacionController,
        (c) =>
            new DeleteCursoCapacitacionController({
                deleteCursoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.deleteCursoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.setEstadoCursoCapacitacionController,
        (c) =>
            new SetEstadoCursoCapacitacionController({
                setEstadoCursoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.setEstadoCursoCapacitacionUseCase
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
        CAPACITACION_TOKENS.cursosCapacitacionRouter,
        (c) => {
            const controllers = {
                listCursosCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.listCursosCapacitacionController
                ),
                listHorariosDisponiblesCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.listHorariosDisponiblesCapacitacionController
                ),
                getCursoCapacitacionByIdController: c.resolve(
                    CAPACITACION_TOKENS.getCursoCapacitacionByIdController
                ),
                createCursoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.createCursoCapacitacionController
                ),
                updateCursoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.updateCursoCapacitacionController
                ),
                deleteCursoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.deleteCursoCapacitacionController
                ),
                setEstadoCursoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.setEstadoCursoCapacitacionController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildCursosCapacitacionRouter({ controllers, middlewares });
        }
    );

    return container;
}
