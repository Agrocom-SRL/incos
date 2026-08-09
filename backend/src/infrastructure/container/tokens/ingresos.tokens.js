/**
 * Tokens del módulo Ingresos (Finanzas · registro de ingresos)
 *
 * Recurso de solo lectura que cruza dos dominios (aportes académicos y
 * capacitación) sobre la vista 184 (vista_ingresos_listado). Se separa de
 * PAGOS_TOKENS/CAPACITACION_TOKENS para no forzar una pertenencia de dominio
 * que no existe: es un listado transaccional propio de Finanzas.
 */

export const INGRESOS_TOKENS = {
    // Repositorios
    ingresoRepository: 'ingresos.ingresoRepository',

    // Use Cases
    listIngresosUseCase: 'ingresos.listIngresosUseCase',

    // Controllers
    listIngresosController: 'ingresos.listIngresosController',

    // Routers
    ingresosRouter: 'ingresos.ingresosRouter',
};
