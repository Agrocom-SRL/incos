/**
 * Mapper de aplicación: UsosComplementarios
 * Fusiona los conteos de uso (vista_catalogos_complementarios_usos, 151) en los
 * ítems de presentación de los catálogos complementarios de referencia
 * (discapacidades, tiposParentesco, idiomas, estadosCiviles).
 *
 * Contrato con el frontend: cada ítem de listado expone SIEMPRE los campos
 * numéricos `cantidadEstudiantes`, `cantidadDocentes` y `cantidadPersonal`
 * (0 por defecto, nunca null).
 */

/**
 * Fusiona los conteos de uso en los ítems ya convertidos a presentación.
 *
 * @param {Object[]} items - Ítems en formato de presentación (con campo `id`)
 * @param {Map<number, {cantidadEstudiantes: number, cantidadDocentes: number, cantidadPersonal: number}>} usos
 *        Mapa item_id -> conteos (los ítems sin uso no aparecen en el mapa)
 * @returns {Object[]} Ítems con los 3 campos de conteo (0 por defecto)
 */
export function mergeUsosComplementarios(items, usos) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const conteos = usos?.get(item.id);
    return {
      ...item,
      cantidadEstudiantes: conteos?.cantidadEstudiantes ?? 0,
      cantidadDocentes: conteos?.cantidadDocentes ?? 0,
      cantidadPersonal: conteos?.cantidadPersonal ?? 0,
    };
  });
}
