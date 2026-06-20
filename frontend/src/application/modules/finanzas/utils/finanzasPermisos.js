/**
 * Códigos de permiso · Finanzas (FIN). Seeds RBAC por módulo (60-FIN).
 * @see docs/referencia/matriz-permisos-sistema.md
 *
 * - `finanzas.pago.*` gobierna el listado, la ficha y la edición/eliminación de
 *   cuotas y el recibo (LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/EXPORTAR).
 * - `finanzas.compromiso.gestionar` es el permiso NUEVO del compromiso de pago:
 *   LISTAR para entrar a la página, CREAR (alta), EDITAR (edición) y ELIMINAR
 *   (anular) para sus controles. Se siembra en paralelo (este archivo solo
 *   referencia su código exacto, no lo crea).
 */

export const FINANZAS_PERMISOS = {
  /** Pago de aporte — listado/ficha y edición de cuotas + recibo */
  pagoVer: 'finanzas.pago.ver',
  pagoRegistrar: 'finanzas.pago.registrar',
  pagoEditar: 'finanzas.pago.editar',
  /** Compromiso de pago — permiso propio (alta/edición/anulación del compromiso) */
  compromisoGestionar: 'finanzas.compromiso.gestionar',
  /** Pagos adicionales (ABM completo: LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR) */
  pagoAdicionales: 'finanzas.pago.adicionales',
  /** Reportes de pagos (LISTAR/EXPORTAR) */
  reporteCarrera: 'finanzas.pago.reporte.carrera',
  reporteEstudiante: 'finanzas.pago.reporte.estudiante',
  reporteGestion: 'finanzas.pago.reporte.gestion',
  /** Planillas de control — permisos propios (LISTAR/EXPORTAR) */
  becaReporte: 'finanzas.beca.reporte',
  cuentaCobrarReporte: 'finanzas.cuenta-cobrar.reporte',
};
