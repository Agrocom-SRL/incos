/**
 * Punto de entrada del módulo Pagos
 */

import { registerMetodosPagoResource } from './metodos-pago.container.js';
import { registerBancosAutorizadosResource } from './bancos-autorizados.container.js';
import { registerCuentasPagoResource } from './cuentas-pago.container.js';
import { registerConfiguracionAportesResource } from './configuracion-aportes.container.js';
import { registerPagosAportesResource } from './pagos-aportes.container.js';

/**
 * Registra el módulo completo de Pagos en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerPagosModule(container) {
    registerMetodosPagoResource(container);
    registerBancosAutorizadosResource(container);
    registerCuentasPagoResource(container);
    registerConfiguracionAportesResource(container);
    registerPagosAportesResource(container);

    return container;
}