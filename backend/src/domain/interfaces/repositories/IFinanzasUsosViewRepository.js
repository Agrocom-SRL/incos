/**
 * Interfaz de Repositorio (solo lectura): IFinanzasUsosViewRepository
 *
 * Contrato del repositorio que lee los conteos de uso de los catálogos de
 * configuración de Finanzas (métodos de pago, bancos autorizados, cuentas de
 * pago, becas/descuentos) desde la vista delgada
 * vista_catalogos_finanzas_usos (152).
 *
 * NO extiende IRepository: es un repositorio de SOLO LECTURA sobre vistas,
 * no un CRUD de entidad. Declara únicamente sus métodos de consulta. Devuelve
 * un mapa plano item_id -> conteos (DTO), no entidades de dominio.
 */
export class IFinanzasUsosViewRepository {
  /**
   * Conteos de uso de los ítems de un catálogo de Finanzas.
   *
   * @param {'METODO_PAGO'|'BANCO'|'CUENTA_PAGO'|'BECA_DESCUENTO'} _catalogo
   * @returns {Promise<Map<number, {cantidadPagos: number, cantidadCuentas: number, cantidadAsignaciones: number}>>}
   *          Mapa item_id -> conteos. Los ítems sin uso NO aparecen en el mapa
   *          (el consumidor debe asumir 0 por defecto).
   */
  async getUsosByCatalogo(_catalogo) {
    throw new Error('Method getUsosByCatalogo() must be implemented');
  }
}
