/**
 * Registro del módulo Ingresos (Finanzas · registro de ingresos)
 *
 * Recurso de solo lectura sobre la vista 184 (vista_ingresos_listado), que
 * cruza aportes académicos (pago_cuotas) y pagos de capacitación
 * (capacitacion_pagos). Se registra como módulo propio (no dentro de
 * modules/pagos ni modules/capacitacion) porque el repositorio no pertenece
 * a ninguno de los dos dominios en particular — mismo criterio que el
 * módulo Pasantías (repos + recurso propios, tokens scoped).
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con módulo Ingresos registrado
 */

import { INGRESOS_TOKENS } from '../../tokens/index.js';
import { registerRepository } from '../../utils/container.helpers.js';
import { IngresoRepository } from '../../../repositories/views/IngresoRepository.js';
import { registerIngresosResource } from './ingresos.container.js';

export function registerIngresosModule(container) {
    // ============================================
    // REPOSITORIOS (singleton del módulo)
    // ============================================
    registerRepository(container, INGRESOS_TOKENS.ingresoRepository, IngresoRepository);

    // ============================================
    // RECURSO (use case + controller + router)
    // ============================================
    registerIngresosResource(container);

    return container;
}
