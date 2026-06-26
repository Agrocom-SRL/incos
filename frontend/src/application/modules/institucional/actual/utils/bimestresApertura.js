/**
 * Habilitación de apertura/cierre de bimestres según fecha + estado institucional.
 *
 * El payload de GET /calificaciones/gestion-bimestres entrega, por bimestre:
 *   { numero, codigo, nombre, fechaInicio, fechaFin, estado, metricas }
 * donde `estado` es el estado de la UI (cerrado | vigente | futuro). El backend
 * NO viaja `estado_calendario` ni `estado_institucional` por bimestre, así que:
 *
 * - Estado de CALENDARIO (por fecha) se deriva aquí con la MISMA lógica de la
 *   vista 105 (`vista_base_calificacion_periodos_bimestre`):
 *     futuro   → CURDATE < fechaInicio
 *     abierto  → fechaInicio <= CURDATE <= fechaFin
 *     cerrado  → CURDATE > fechaFin
 * - Estado INSTITUCIONAL se deriva del `estado` de la UI:
 *     cerrado → CERRADO   ·   vigente → EN_CURSO   ·   resto → PENDIENTE
 *
 * Reglas de habilitación (espejo del backend):
 * - Abrir  (PENDIENTE → EN_CURSO): solo si institucional = PENDIENTE y el
 *   calendario NO es 'futuro'. (El backend bloquea con BIMESTRE_FUTURO.)
 * - Cerrar (EN_CURSO → CERRADO): solo si institucional = EN_CURSO y el calendario
 *   ya venció ('cerrado' por fecha). (El backend valida notas faltantes.)
 */

/** 'YYYY-MM-DD' del día de `value` (recorta hora). */
const soloISO = (value) => (value ? String(value).slice(0, 10) : null);

/** Estado de calendario por fecha — espeja la vista 105. */
export function estadoCalendarioPorFecha(fechaInicio, fechaFin, hoy = new Date()) {
  const ini = soloISO(fechaInicio);
  const fin = soloISO(fechaFin);
  const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate(),
  ).padStart(2, '0')}`;
  if (!ini || !fin) return 'futuro';
  if (hoyISO < ini) return 'futuro';
  if (hoyISO > fin) return 'cerrado';
  return 'abierto';
}

/** Estado institucional derivado del `estado` de la UI del payload. */
export function estadoInstitucional(estadoUi) {
  if (estadoUi === 'cerrado') return 'CERRADO';
  if (estadoUi === 'vigente') return 'EN_CURSO';
  return 'PENDIENTE';
}

/**
 * Mapea un bimestre del payload a la fila de la sección de apertura/cierre,
 * con la decisión de habilitación y tooltips ya resueltos.
 *
 * @param {Object} b - bimestre del payload (numero, nombre, fechaInicio, fechaFin, estado…)
 * @param {{ iniciada?: boolean, hoy?: Date }} [opts]
 */
export function mapBimestreApertura(b = {}, { iniciada = false, hoy = new Date() } = {}) {
  const numero = Number(b.numero);
  const calendario = estadoCalendarioPorFecha(b.fechaInicio, b.fechaFin, hoy);
  const institucional = estadoInstitucional(b.estado);

  // --- Abrir ---------------------------------------------------------------
  let abrirHabilitado = false;
  let abrirTooltip = null;
  if (!iniciada) {
    abrirTooltip = 'Primero inicie la gestión académica.';
  } else if (institucional === 'CERRADO') {
    abrirTooltip = 'El bimestre ya está cerrado.';
  } else if (institucional === 'EN_CURSO') {
    abrirTooltip = 'El bimestre ya está abierto.';
  } else if (calendario === 'futuro') {
    abrirTooltip = 'Aún no llega la fecha de inicio del bimestre.';
  } else {
    abrirHabilitado = true;
  }

  // --- Cerrar --------------------------------------------------------------
  let cerrarHabilitado = false;
  let cerrarTooltip = null;
  if (!iniciada) {
    cerrarTooltip = 'Primero inicie la gestión académica.';
  } else if (institucional === 'CERRADO') {
    cerrarTooltip = 'El bimestre ya está cerrado.';
  } else if (institucional !== 'EN_CURSO') {
    cerrarTooltip = 'El bimestre aún no está en curso.';
  } else if (calendario !== 'cerrado') {
    cerrarTooltip = 'El bimestre aún no llega a su fecha de fin.';
  } else {
    cerrarHabilitado = true;
  }

  return {
    numero,
    codigo: b.codigo ?? `B${numero}`,
    nombre: b.nombre || `Bimestre ${numero}`,
    fechaInicio: b.fechaInicio ?? null,
    fechaFin: b.fechaFin ?? null,
    calendario,
    institucional,
    abrirHabilitado,
    abrirTooltip,
    cerrarHabilitado,
    cerrarTooltip,
  };
}

/** Mapea la lista de bimestres del payload a filas de apertura/cierre. */
export function buildBimestresApertura(bimestres = [], opts = {}) {
  return (bimestres || [])
    .map((b) => mapBimestreApertura(b, opts))
    .sort((a, z) => a.numero - z.numero);
}
