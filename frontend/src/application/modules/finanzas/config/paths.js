/** Rutas del dominio Finanzas (FIN) — fuente única de URLs del módulo. */

export const FINANZAS_BASE = '/finanzas';

/** Pagos (solo lectura: Finanzas no registra pagos, ver `finanzasPagosRoutes`) */
export const PAGOS_LIST_PATH = `${FINANZAS_BASE}/pagos`;
export const pagoCompromisoPath = `${FINANZAS_BASE}/pagos/compromiso`;
export const pagoDetallePath = (id) => `${FINANZAS_BASE}/pagos/${id}`;

/** Configuración de becas (catálogo maestro) */
export const BECAS_LIST_PATH = `${FINANZAS_BASE}/becas`;
export const becaDescuentoNuevaPath = `${BECAS_LIST_PATH}/nueva`;
export const becaDescuentoDetallePath = (id) => `${BECAS_LIST_PATH}/${id}`;
export const becaDescuentoEditarPath = (id) => `${BECAS_LIST_PATH}/${id}/editar`;

/** Reportes de pagos */
export const REPORTES_BASE = `${FINANZAS_BASE}/reportes`;
export const reportePorCarreraPath = `${REPORTES_BASE}/carrera`;
export const reportePorEstudiantePath = `${REPORTES_BASE}/estudiante`;
export const reportePorGestionPath = `${REPORTES_BASE}/gestion`;
export const cuentasPorCobrarPath = `${REPORTES_BASE}/cuentas-por-cobrar`;
export const becasPorCarreraPath = `${REPORTES_BASE}/becas`;

/** Config. de pagos */
export const CONFIGURACION_PATH = `${FINANZAS_BASE}/configuracion`;

/** Fichas de detalle de bancos/cuentas/métodos (tab de origen: `?tab=` en configPagosTabs.js). */
export const bancoDetallePath = (id) => `${CONFIGURACION_PATH}/bancos/${id}`;
export const cuentaDetallePath = (id) => `${CONFIGURACION_PATH}/cuentas/${id}`;
export const metodoDetallePath = (id) => `${CONFIGURACION_PATH}/metodos/${id}`;

/** Alta/edición de bancos y cuentas; métodos son catálogo fijo, solo edición. */
export const bancoNuevoPath = `${CONFIGURACION_PATH}/bancos/nuevo`;
export const bancoEditarPath = (id) => `${CONFIGURACION_PATH}/bancos/${id}/editar`;
export const cuentaNuevoPath = `${CONFIGURACION_PATH}/cuentas/nueva`;
export const cuentaEditarPath = (id) => `${CONFIGURACION_PATH}/cuentas/${id}/editar`;
export const metodoEditarPath = (id) => `${CONFIGURACION_PATH}/metodos/${id}/editar`;
