/**
 * Registro de dependencias del recurso Pagos de Capacitación (módulo CAP)
 *
 * Responsabilidades:
 * - Registrar el Use Case de registro de pago (RegisterPagoCapacitacionUseCase)
 * - Registrar su Controller
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
import { RegisterPagoCapacitacionController } from '../../../../presentation/controllers/capacitacion/index.js';

export function registerPagosCapacitacionResource(container) {
    registerComponent(
        container,
        CAPACITACION_TOKENS.registerPagoCapacitacionUseCase,
        (c) =>
            new RegisterPagoCapacitacionUseCase({
                pagoCapacitacionRepository: c.resolve(CAPACITACION_TOKENS.pagoCapacitacionRepository),
                inscripcionCapacitacionRepository: c.resolve(
                    CAPACITACION_TOKENS.inscripcionCapacitacionRepository
                ),
                cursoCapacitacionRepository: c.resolve(CAPACITACION_TOKENS.cursoCapacitacionRepository),
                paymentMethodRepository: c.resolve(REPOSITORIOS_TOKENS.paymentMethodRepository),
                paymentAccountRepository: c.resolve(REPOSITORIOS_TOKENS.paymentAccountRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
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

    return container;
}
