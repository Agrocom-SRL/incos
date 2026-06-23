/**
 * Utilidades del compromiso de pago (sin JSX) — fuente única de la traducción
 * contrato → presentación. Vive aparte del átomo para no romper el fast-refresh
 * (un archivo de componente solo exporta componentes).
 *
 * Contrato del compromiso (camelCase, embebido en detalle y en cada fila):
 *   { id, fechaCompromiso, observacion, estado, diasAtraso, alerta } | null
 *   - estado: 'VIGENTE' | 'CUMPLIDO' | 'INCUMPLIDO'
 *   - alerta: 'AL_DIA' | 'PROXIMA' | 'VENCIDA'
 *   - diasAtraso: >0 vencido, <=0 faltan días, null sin fecha
 */

/**
 * Formatea la fecha de compromiso 'YYYY-MM-DD' a 'DD/MM/YYYY' sin dependencias de zona.
 * @param {string|null|undefined} fecha
 * @returns {string} fecha formateada o '—' si no hay.
 */
export const formatFechaCompromiso = (fecha) => {
  if (!fecha) return '—';
  const solo = String(fecha).slice(0, 10);
  const [y, m, d] = solo.split('-');
  if (!y || !m || !d) return solo;
  return `${d}/${m}/${y}`;
};

/** Prioridad para ordenar listados por compromiso (vencida primero, sin compromiso al final). */
export const ALERTA_ORDEN = { VENCIDA: 0, PROXIMA: 1, AL_DIA: 2 };

/**
 * Valor de orden de un compromiso (para sorters de tabla).
 * @param {Object|null} compromiso
 * @returns {number}
 */
export const compromisoSortValue = (compromiso) => {
  if (!compromiso) return 99;
  if (compromiso.estado === 'CUMPLIDO') return 50;
  return ALERTA_ORDEN[compromiso.alerta] ?? 40;
};

/**
 * Resuelve color semántico de AntD (→ token del theme), etiqueta y clave de ícono
 * a partir del compromiso. CUMPLIDO gana sobre la alerta.
 * @param {Object|null} compromiso
 * @returns {{ color: string, label: string, icon: 'cumplido'|'vencida'|'proxima'|'aldia' }}
 */
export const resolverCompromisoEstado = (compromiso) => {
  const estado = compromiso?.estado;
  const alerta = compromiso?.alerta;
  const dias = Number(compromiso?.diasAtraso);

  if (estado === 'CUMPLIDO') {
    return { color: 'default', label: 'Cumplido', icon: 'cumplido' };
  }
  if (alerta === 'VENCIDA' || estado === 'INCUMPLIDO') {
    const sufijo = Number.isFinite(dias) && dias > 0 ? ` · ${dias}d` : '';
    return { color: 'error', label: `Vencida${sufijo}`, icon: 'vencida' };
  }
  if (alerta === 'PROXIMA') {
    return { color: 'warning', label: 'Próxima', icon: 'proxima' };
  }
  // AL_DIA / VIGENTE
  return { color: 'success', label: 'Al día', icon: 'aldia' };
};
