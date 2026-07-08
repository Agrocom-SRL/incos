/**
 * Mapper de aplicación: UsosFinanzas
 * Fusiona los conteos de uso (vista_catalogos_finanzas_usos, 152) en los
 * ítems de presentación de los catálogos de configuración de Finanzas
 * (metodosPago, bancosAutorizados, cuentasPago, becasDescuentos).
 *
 * Contrato con el frontend: cada ítem de listado expone SIEMPRE los campos
 * numéricos `cantidadPagos`, `cantidadCuentas`, `cantidadAsignaciones` y
 * `totalReferencias` (suma de los tres; 0 por defecto, nunca null).
 */

/**
 * Fusiona los conteos de uso en los ítems ya convertidos a presentación.
 *
 * @param {Object[]} items - Ítems en formato de presentación (con campo `id`)
 * @param {Map<number, {cantidadPagos: number, cantidadCuentas: number, cantidadAsignaciones: number}>} usos
 *        Mapa item_id -> conteos (los ítems sin uso no aparecen en el mapa)
 * @returns {Object[]} Ítems con los 3 campos de conteo + totalReferencias (0 por defecto)
 */
export function mergeUsosFinanzas(items, usos) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const conteos = usos?.get(item.id);
    const cantidadPagos = conteos?.cantidadPagos ?? 0;
    const cantidadCuentas = conteos?.cantidadCuentas ?? 0;
    const cantidadAsignaciones = conteos?.cantidadAsignaciones ?? 0;
    return {
      ...item,
      cantidadPagos,
      cantidadCuentas,
      cantidadAsignaciones,
      totalReferencias: cantidadPagos + cantidadCuentas + cantidadAsignaciones,
    };
  });
}
