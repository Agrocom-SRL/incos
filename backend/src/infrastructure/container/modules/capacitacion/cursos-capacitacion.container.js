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
import { ListGruposCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/ListGruposCapacitacionUseCase.js';
import { ListHorariosCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/ListHorariosCapacitacionUseCase.js';
import { CreateHorarioCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/CreateHorarioCapacitacionUseCase.js';
import { GetHorarioCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/GetHorarioCapacitacionUseCase.js';
import { UpdateHorarioCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/UpdateHorarioCapacitacionUseCase.js';
import { DeleteHorarioCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/DeleteHorarioCapacitacionUseCase.js';
import { GetCursoCapacitacionByIdUseCase } from '../../../../application/use-cases/capacitacion/GetCursoCapacitacionByIdUseCase.js';
import { CreateCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/CreateCursoCapacitacionUseCase.js';
import { UpdateCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/UpdateCursoCapacitacionUseCase.js';
import { DeleteCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/DeleteCursoCapacitacionUseCase.js';
import { SetEstadoCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/SetEstadoCursoCapacitacionUseCase.js';
import { AbrirCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/AbrirCursoCapacitacionUseCase.js';
import { CancelarCursoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/CancelarCursoCapacitacionUseCase.js';
import { ExportListadoInscritosCapacitacionExcelUseCase } from '../../../../application/use-cases/capacitacion/ExportListadoInscritosCapacitacionExcelUseCase.js';
import {
    ListCursosCapacitacionController,
    ListHorariosDisponiblesCapacitacionController,
    ListGruposCapacitacionController,
    ListHorariosCapacitacionController,
    CreateHorarioCapacitacionController,
    GetHorarioCapacitacionController,
    UpdateHorarioCapacitacionController,
    DeleteHorarioCapacitacionController,
    GetCursoCapacitacionByIdController,
    CreateCursoCapacitacionController,
    UpdateCursoCapacitacionController,
    DeleteCursoCapacitacionController,
    SetEstadoCursoCapacitacionController,
    AbrirCursoCapacitacionController,
    CancelarCursoCapacitacionController,
    ExportListadoInscritosCapacitacionController,
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
        CAPACITACION_TOKENS.listGruposCapacitacionUseCase,
        (c) =>
            new ListGruposCapacitacionUseCase({
                grupoCapacitacionListadoViewRepository: c.resolve(
                    CAPACITACION_TOKENS.grupoCapacitacionListadoViewRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.listHorariosCapacitacionUseCase,
        (c) =>
            new ListHorariosCapacitacionUseCase({
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createHorarioCapacitacionUseCase,
        (c) =>
            new CreateHorarioCapacitacionUseCase({
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getHorarioCapacitacionUseCase,
        (c) =>
            new GetHorarioCapacitacionUseCase({
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                bloqueCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.bloqueCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateHorarioCapacitacionUseCase,
        (c) =>
            new UpdateHorarioCapacitacionUseCase({
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteHorarioCapacitacionUseCase,
        (c) =>
            new DeleteHorarioCapacitacionUseCase({
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                bloqueCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.bloqueCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getCursoCapacitacionByIdUseCase,
        (c) =>
            new GetCursoCapacitacionByIdUseCase({
                grupoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.grupoCapacitacionRepository
                ),
                cursoCapacitacionFichaViewRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionFichaViewRepository
                ),
                capacitacionRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionRequisitoRepository
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
                capacitacionRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionRequisitoRepository
                ),
                grupoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.grupoCapacitacionRepository
                ),
                bloqueCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.bloqueCapacitacionRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
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
                capacitacionRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionRequisitoRepository
                ),
                grupoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.grupoCapacitacionRepository
                ),
                bloqueCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.bloqueCapacitacionRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                scheduleRepository: c.resolve(REPOSITORIOS_TOKENS.scheduleRepository),
                classroomRepository: c.resolve(REPOSITORIOS_TOKENS.classroomRepository),
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                capacitacionInscritoRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionInscritoRequisitoRepository
                ),
                capacitacionCompromisoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionCompromisoRepository
                ),
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

    registerComponent(
        container,
        CAPACITACION_TOKENS.abrirCursoCapacitacionUseCase,
        (c) =>
            new AbrirCursoCapacitacionUseCase({
                grupoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.grupoCapacitacionRepository
                ),
                bloqueCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.bloqueCapacitacionRepository
                ),
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.cancelarCursoCapacitacionUseCase,
        (c) =>
            new CancelarCursoCapacitacionUseCase({
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.exportListadoInscritosCapacitacionUseCase,
        (c) =>
            new ExportListadoInscritosCapacitacionExcelUseCase({
                cursoCapacitacionFichaViewRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionFichaViewRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                listadoInscritosCapacitacionExcelGenerator: c.resolve(
                    SERVICIOS_TOKENS.listadoInscritosCapacitacionExcelGenerator
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
        CAPACITACION_TOKENS.listGruposCapacitacionController,
        (c) =>
            new ListGruposCapacitacionController({
                listGruposCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.listGruposCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.listHorariosCapacitacionController,
        (c) =>
            new ListHorariosCapacitacionController({
                listHorariosCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.listHorariosCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createHorarioCapacitacionController,
        (c) =>
            new CreateHorarioCapacitacionController({
                createHorarioCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.createHorarioCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getHorarioCapacitacionController,
        (c) =>
            new GetHorarioCapacitacionController({
                getHorarioCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.getHorarioCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateHorarioCapacitacionController,
        (c) =>
            new UpdateHorarioCapacitacionController({
                updateHorarioCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.updateHorarioCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteHorarioCapacitacionController,
        (c) =>
            new DeleteHorarioCapacitacionController({
                deleteHorarioCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.deleteHorarioCapacitacionUseCase
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

    registerComponent(
        container,
        CAPACITACION_TOKENS.abrirCursoCapacitacionController,
        (c) =>
            new AbrirCursoCapacitacionController({
                abrirCursoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.abrirCursoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.cancelarCursoCapacitacionController,
        (c) =>
            new CancelarCursoCapacitacionController({
                cancelarCursoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.cancelarCursoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.exportListadoInscritosCapacitacionController,
        (c) =>
            new ExportListadoInscritosCapacitacionController({
                exportListadoInscritosCapacitacionExcelUseCase: c.resolve(
                    CAPACITACION_TOKENS.exportListadoInscritosCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
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
                listGruposCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.listGruposCapacitacionController
                ),
                listHorariosCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.listHorariosCapacitacionController
                ),
                createHorarioCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.createHorarioCapacitacionController
                ),
                getHorarioCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.getHorarioCapacitacionController
                ),
                updateHorarioCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.updateHorarioCapacitacionController
                ),
                deleteHorarioCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.deleteHorarioCapacitacionController
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
                abrirCursoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.abrirCursoCapacitacionController
                ),
                cancelarCursoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.cancelarCursoCapacitacionController
                ),
                exportListadoInscritosCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.exportListadoInscritosCapacitacionController
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
