/**
 * Interfaz de Repositorio (solo lectura): ICuentasPorCobrarViewRepository
 *
 * Filas crudas (1 por estudiante matriculado por carrera/paralelo/gestión) para
 * la planilla de control de Cuentas por cobrar, desde la vista SQL existente
 * `vista_base_reporte_excel_lista_aportes_por_carrera_filas` (vista 89), que ya
 * entrega carrera, paralelo, CI, nombres, monto obligatorio, total pagado y saldo.
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA para reportes
 * (arquetipo B / `views/`).
 */
export class ICuentasPorCobrarViewRepository {
  /**
   * Devuelve filas crudas por gestión (1 por estudiante matriculado):
   * carrera_id, carrera_nombre, paralelo_id, paralelo_nombre, paralelo_turno,
   * estudiante_id, codigo_estudiante, ci, apellido_paterno, apellido_materno,
   * nombres, nombre_completo, pago_aporte_id, monto_total_deuda (monto_obligatorio),
   * monto_pagado, saldo_pendiente, estado_aporte.
   *
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findRowsByGestionId(_gestionId) {
    throw new Error('Method findRowsByGestionId() must be implemented');
  }

  /**
   * Fecha del último pago (MAX fecha_pago) por cabecera (pago_aporte_id) para las
   * cabeceras de una gestión. Se separa de la vista 89 porque ésta no expone el
   * detalle de cuotas (es cabecera agregada).
   *
   * @param {number} gestionId
   * @returns {Promise<Array<{ pago_aporte_id: number, fecha_ultimo_pago: string|null }>>}
   */
  async findUltimoPagoByGestionId(_gestionId) {
    throw new Error('Method findUltimoPagoByGestionId() must be implemented');
  }
}
