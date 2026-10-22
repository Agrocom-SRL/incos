/**
 * Registro de dependencias del recurso Inscripciones de Capacitación (módulo CAP)
 *
 * Responsabilidades:
 * - Registrar Use Cases del recurso Inscripciones
 * - Registrar Controllers del recurso Inscripciones
 * - Construir y registrar el router (incluye POST /:id/pagos, cuyo
 *   use case/controller registra pagos-capacitacion.container.js)
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { CAPACITACION_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { ListInscripcionesCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/ListInscripcionesCapacitacionUseCase.js';
import { GetInscripcionCapacitacionByIdUseCase } from '../../../../application/use-cases/capacitacion/GetInscripcionCapacitacionByIdUseCase.js';
import { CreateInscripcionCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/CreateInscripcionCapacitacionUseCase.js';
import { UpdateInscripcionCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/UpdateInscripcionCapacitacionUseCase.js';
import { UpdateRequisitosInscripcionUseCase } from '../../../../application/use-cases/capacitacion/UpdateRequisitosInscripcionUseCase.js';
import { DeleteInscripcionCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/DeleteInscripcionCapacitacionUseCase.js';
import { AnularInscripcionCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/AnularInscripcionCapacitacionUseCase.js';
import { ExportFormularioInscripcionCapacitacionPdfUseCase } from '../../../../application/use-cases/capacitacion/ExportFormularioInscripcionCapacitacionPdfUseCase.js';
import { ExportReciboPagoCapacitacionPdfUseCase } from '../../../../application/use-cases/capacitacion/ExportReciboPagoCapacitacionPdfUseCase.js';
import {
    ListInscripcionesCapacitacionController,
    GetInscripcionCapacitacionByIdController,
    CreateInscripcionCapacitacionController,
    UpdateInscripcionCapacitacionController,
    UpdateRequisitosInscripcionController,
    DeleteInscripcionCapacitacionController,
    AnularInscripcionCapacitacionController,
    ExportFormularioInscripcionCapacitacionController,
    ExportReciboPagoCapacitacionController,
} from '../../../../presentation/controllers/capacitacion/index.js';
import { buildInscripcionesCapacitacionRouter } from '../../../../presentation/routes/inscripciones-capacitacion.routes.js';

export function registerInscripcionesCapacitacionResource(container) {
    // ============================================
    // USE CASES
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listInscripcionesCapacitacionUseCase,
        (c) =>
            new ListInscripcionesCapacitacionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                capacitacionCompromisoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionCompromisoRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getInscripcionCapacitacionByIdUseCase,
        (c) =>
            new GetInscripcionCapacitacionByIdUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                capacitacionCompromisoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionCompromisoRepository
                ),
                capacitacionInscritoRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionInscritoRequisitoRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createInscripcionCapacitacionUseCase,
        (c) =>
            new CreateInscripcionCapacitacionUseCase({
                grupoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.grupoCapacitacionRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                participanteRepository: c.resolve(CAPACITACION_TOKENS.participanteRepository),
                cursoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.cursoCapacitacionRepository
                ),
                capacitacionCompromisoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionCompromisoRepository
                ),
                capacitacionRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionRequisitoRepository
                ),
                capacitacionInscritoRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionInscritoRequisitoRepository
                ),
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                registerPagoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.registerPagoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateInscripcionCapacitacionUseCase,
        (c) =>
            new UpdateInscripcionCapacitacionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                grupoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.grupoCapacitacionRepository
                ),
                updateParticipanteUseCase: c.resolve(
                    CAPACITACION_TOKENS.updateParticipanteUseCase
                ),
                getInscripcionCapacitacionByIdUseCase: c.resolve(
                    CAPACITACION_TOKENS.getInscripcionCapacitacionByIdUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateRequisitosInscripcionUseCase,
        (c) =>
            new UpdateRequisitosInscripcionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                capacitacionRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionRequisitoRepository
                ),
                capacitacionInscritoRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionInscritoRequisitoRepository
                ),
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                capacitacionCompromisoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionCompromisoRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteInscripcionCapacitacionUseCase,
        (c) =>
            new DeleteInscripcionCapacitacionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.anularInscripcionCapacitacionUseCase,
        (c) =>
            new AnularInscripcionCapacitacionUseCase({
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.exportFormularioInscripcionCapacitacionPdfUseCase,
        (c) =>
            new ExportFormularioInscripcionCapacitacionPdfUseCase({
                getInscripcionCapacitacionByIdUseCase: c.resolve(
                    CAPACITACION_TOKENS.getInscripcionCapacitacionByIdUseCase
                ),
                formularioInscripcionCapacitacionPdfGenerator: c.resolve(
                    SERVICIOS_TOKENS.formularioInscripcionCapacitacionPdfGenerator
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.exportReciboPagoCapacitacionPdfUseCase,
        (c) =>
            new ExportReciboPagoCapacitacionPdfUseCase({
                getInscripcionCapacitacionByIdUseCase: c.resolve(
                    CAPACITACION_TOKENS.getInscripcionCapacitacionByIdUseCase
                ),
                reciboPagoCapacitacionPdfGenerator: c.resolve(
                    SERVICIOS_TOKENS.reciboPagoCapacitacionPdfGenerator
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.listInscripcionesCapacitacionController,
        (c) =>
            new ListInscripcionesCapacitacionController({
                listInscripcionesCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.listInscripcionesCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.getInscripcionCapacitacionByIdController,
        (c) =>
            new GetInscripcionCapacitacionByIdController({
                getInscripcionCapacitacionByIdUseCase: c.resolve(
                    CAPACITACION_TOKENS.getInscripcionCapacitacionByIdUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.createInscripcionCapacitacionController,
        (c) =>
            new CreateInscripcionCapacitacionController({
                createInscripcionCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.createInscripcionCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateInscripcionCapacitacionController,
        (c) =>
            new UpdateInscripcionCapacitacionController({
                updateInscripcionCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.updateInscripcionCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updateRequisitosInscripcionController,
        (c) =>
            new UpdateRequisitosInscripcionController({
                updateRequisitosInscripcionUseCase: c.resolve(
                    CAPACITACION_TOKENS.updateRequisitosInscripcionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.deleteInscripcionCapacitacionController,
        (c) =>
            new DeleteInscripcionCapacitacionController({
                deleteInscripcionCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.deleteInscripcionCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.anularInscripcionCapacitacionController,
        (c) =>
            new AnularInscripcionCapacitacionController({
                anularInscripcionCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.anularInscripcionCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.exportFormularioInscripcionCapacitacionController,
        (c) =>
            new ExportFormularioInscripcionCapacitacionController({
                exportFormularioInscripcionCapacitacionPdfUseCase: c.resolve(
                    CAPACITACION_TOKENS.exportFormularioInscripcionCapacitacionPdfUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.exportReciboPagoCapacitacionController,
        (c) =>
            new ExportReciboPagoCapacitacionController({
                exportReciboPagoCapacitacionPdfUseCase: c.resolve(
                    CAPACITACION_TOKENS.exportReciboPagoCapacitacionPdfUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CAPACITACION_TOKENS.inscripcionesCapacitacionRouter,
        (c) => {
            const controllers = {
                listInscripcionesCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.listInscripcionesCapacitacionController
                ),
                getInscripcionCapacitacionByIdController: c.resolve(
                    CAPACITACION_TOKENS.getInscripcionCapacitacionByIdController
                ),
                createInscripcionCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.createInscripcionCapacitacionController
                ),
                deleteInscripcionCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.deleteInscripcionCapacitacionController
                ),
                anularInscripcionCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.anularInscripcionCapacitacionController
                ),
                registerPagoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.registerPagoCapacitacionController
                ),
                updateInscripcionCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.updateInscripcionCapacitacionController
                ),
                updatePagoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.updatePagoCapacitacionController
                ),
                anularPagoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.anularPagoCapacitacionController
                ),
                updateRequisitosInscripcionController: c.resolve(
                    CAPACITACION_TOKENS.updateRequisitosInscripcionController
                ),
                adjuntarComprobantePagoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.adjuntarComprobantePagoCapacitacionController
                ),
                descargarComprobantePagoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.descargarComprobantePagoCapacitacionController
                ),
                exportFormularioInscripcionCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.exportFormularioInscripcionCapacitacionController
                ),
                exportReciboPagoCapacitacionController: c.resolve(
                    CAPACITACION_TOKENS.exportReciboPagoCapacitacionController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildInscripcionesCapacitacionRouter({ controllers, middlewares });
        }
    );

    return container;
}
