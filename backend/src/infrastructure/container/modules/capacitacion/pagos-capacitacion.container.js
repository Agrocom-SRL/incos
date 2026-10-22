/**
 * Registro de dependencias del recurso Pagos de Capacitación (módulo CAP)
 *
 * Responsabilidades:
 * - Registrar los Use Cases del pago: registro (RegisterPagoCapacitacionUseCase),
 *   corrección, anulación y comprobante (adjuntar / descargar)
 * - Registrar sus Controllers
 *
 * El router NO vive aquí: POST /inscripciones-capacitacion/:id/pagos se monta
 * dentro del router de inscripciones (inscripciones-capacitacion.container.js),
 * con permiso propio `capacitacion.pago` CREAR.
 *
 * Reutiliza los catálogos metodos_pago/cuentas_pago vía REPOSITORIOS_TOKENS
 * (FK de solo lectura, decisión §6.3 del plan).
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */

import { CAPACITACION_TOKENS, REPOSITORIOS_TOKENS, SERVICIOS_TOKENS } from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { RegisterPagoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/RegisterPagoCapacitacionUseCase.js';
import { UpdatePagoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/UpdatePagoCapacitacionUseCase.js';
import { AnularPagoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/AnularPagoCapacitacionUseCase.js';
import { AdjuntarComprobantePagoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/AdjuntarComprobantePagoCapacitacionUseCase.js';
import { DescargarComprobantePagoCapacitacionUseCase } from '../../../../application/use-cases/capacitacion/DescargarComprobantePagoCapacitacionUseCase.js';
import {
    AdjuntarComprobantePagoCapacitacionController,
    DescargarComprobantePagoCapacitacionController,
    RegisterPagoCapacitacionController,
    UpdatePagoCapacitacionController,
    AnularPagoCapacitacionController,
} from '../../../../presentation/controllers/capacitacion/index.js';

export function registerPagosCapacitacionResource(container) {
    registerComponent(
        container,
        CAPACITACION_TOKENS.registerPagoCapacitacionUseCase,
        (c) =>
            new RegisterPagoCapacitacionUseCase({
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                capacitacionCompromisoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionCompromisoRepository
                ),
                capacitacionInscritoRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionInscritoRequisitoRepository
                ),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.updatePagoCapacitacionUseCase,
        (c) =>
            new UpdatePagoCapacitacionUseCase({
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                capacitacionCompromisoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionCompromisoRepository
                ),
                capacitacionInscritoRequisitoRepository: c.resolve(
                    CAPACITACION_TOKENS.capacitacionInscritoRequisitoRepository
                ),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.anularPagoCapacitacionUseCase,
        (c) =>
            new AnularPagoCapacitacionUseCase({
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
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
        CAPACITACION_TOKENS.updatePagoCapacitacionController,
        (c) =>
            new UpdatePagoCapacitacionController({
                updatePagoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.updatePagoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.anularPagoCapacitacionController,
        (c) =>
            new AnularPagoCapacitacionController({
                anularPagoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.anularPagoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.registerPagoCapacitacionController,
        (c) =>
            new RegisterPagoCapacitacionController({
                registerPagoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.registerPagoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.adjuntarComprobantePagoCapacitacionUseCase,
        (c) =>
            new AdjuntarComprobantePagoCapacitacionUseCase({
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.descargarComprobantePagoCapacitacionUseCase,
        (c) =>
            new DescargarComprobantePagoCapacitacionUseCase({
                pagoCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.pagoCapacitacionRepository
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.adjuntarComprobantePagoCapacitacionController,
        (c) =>
            new AdjuntarComprobantePagoCapacitacionController({
                adjuntarComprobantePagoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.adjuntarComprobantePagoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CAPACITACION_TOKENS.descargarComprobantePagoCapacitacionController,
        (c) =>
            new DescargarComprobantePagoCapacitacionController({
                descargarComprobantePagoCapacitacionUseCase: c.resolve(
                    CAPACITACION_TOKENS.descargarComprobantePagoCapacitacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    return container;
}
