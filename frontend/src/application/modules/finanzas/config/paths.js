/** Rutas del dominio Finanzas (FIN) — fuente única de URLs del módulo. */

export const FINANZAS_BASE = '/finanzas';

/** Pagos */
export const PAGOS_LIST_PATH = `${FINANZAS_BASE}/pagos`;
export const pagoRegistrarPath = `${FINANZAS_BASE}/pagos/registrar`;
export const pagoCompromisoPath = `${FINANZAS_BASE}/pagos/compromiso`;
export const pagoDetallePath = (id) => `${FINANZAS_BASE}/pagos/${id}`;

/** Pagos adicionales */
export const PAGOS_ADICIONALES_PATH = `${FINANZAS_BASE}/adicional`;

/** Reportes de pagos */
export const REPORTES_BASE = `${FINANZAS_BASE}/reportes`;
export const reportePorCarreraPath = `${REPORTES_BASE}/carrera`;
export const reportePorEstudiantePath = `${REPORTES_BASE}/estudiante`;
export const reportePorGestionPath = `${REPORTES_BASE}/gestion`;
export const cuentasPorCobrarPath = `${REPORTES_BASE}/cuentas-por-cobrar`;
export const becasPorCarreraPath = `${REPORTES_BASE}/becas`;

/** Config. de pagos */
export const CONFIGURACION_PATH = `${FINANZAS_BASE}/configuracion`;
