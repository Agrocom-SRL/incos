/**
 * buildFullName — nombre en orden de colección: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
 * Regla del proyecto para listas/tablas/selects/exportación (excepción: ficha de detalle).
 * Función PURA.
 */
export function buildFullName(nombres, apellidoPaterno, apellidoMaterno, fallback = 'Sin nombre') {
  const full = [apellidoPaterno, apellidoMaterno, nombres]
    .map((p) => (p ? String(p).trim() : ''))
    .filter(Boolean)
    .join(' ');
  return full || fallback;
}

export default buildFullName;
