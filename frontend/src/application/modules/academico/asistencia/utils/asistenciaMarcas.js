/**
 * Reglas de marcado de asistencia (sparse + ciclo de celda).
 *
 * - El default vacío es PRESENTE. Para que el backend BORRE una fila al volver a presente,
 *   la celda modificada se envía con `estado: 'PRESENTE'` explícito (nunca se omite).
 * - Primera marcación (la celda aún no se guardó como falta): el click cicla
 *   PRESENTE ↔ AUSENTE. Solo se puede marcar falta.
 * - Re-marcación (la falta ya se guardó: el backend trae AUSENTE/TARDANZA): el click
 *   cicla AUSENTE → TARDANZA → PRESENTE. Volver a tocar una falta guardada deja
 *   «atrasado» (R/TARDANZA). TARDANZA solo es accesible sobre una falta ya guardada
 *   (o con el registro reabierto en modo corrección).
 */

export const ESTADO = {
  PRESENTE: 'PRESENTE',
  AUSENTE: 'AUSENTE',
  TARDANZA: 'TARDANZA',
};

/** Marca derivada (P/R/F/L) a partir del estado. L (licencia) viene como `neutro`, no como estado. */
export const MARCA = {
  PRESENTE: 'P',
  TARDANZA: 'R',
  AUSENTE: 'F',
  LICENCIA: 'L',
};

/** Motivos neutros (solo lectura, no editables ni computables). */
export const NEUTRO = {
  FERIADO: 'FERIADO',
  CLASE_NO_DICTADA: 'CLASE_NO_DICTADA',
  LICENCIA: 'LICENCIA',
};

/** Estado vacío equivale a PRESENTE; cualquier otro es el propio estado. */
export const estadoEfectivo = (estado) => estado ?? ESTADO.PRESENTE;

/** Marca visible (P/R/F/L) de una celda según estado y neutralidad. */
export const marcaDeEstado = (estado, neutro) => {
  if (neutro === NEUTRO.LICENCIA) return MARCA.LICENCIA;
  switch (estado) {
    case ESTADO.AUSENTE:
      return MARCA.AUSENTE;
    case ESTADO.TARDANZA:
      return MARCA.TARDANZA;
    case ESTADO.PRESENTE:
    default:
      return MARCA.PRESENTE;
  }
};

/**
 * Siguiente estado del ciclo de la celda.
 * @param {string|null} estadoActual
 * @param {boolean} permiteAtraso  TARDANZA solo accesible si true (falta ya guardada
 *   o registro reabierto en modo corrección).
 * @returns {string} próximo estado (PRESENTE | AUSENTE | TARDANZA)
 */
export const siguienteEstado = (estadoActual, permiteAtraso) => {
  const actual = estadoEfectivo(estadoActual);
  if (permiteAtraso) {
    // AUSENTE → TARDANZA → PRESENTE → AUSENTE
    if (actual === ESTADO.AUSENTE) return ESTADO.TARDANZA;
    if (actual === ESTADO.TARDANZA) return ESTADO.PRESENTE;
    return ESTADO.AUSENTE;
  }
  // Primera marcación: PRESENTE ↔ AUSENTE
  return actual === ESTADO.AUSENTE ? ESTADO.PRESENTE : ESTADO.AUSENTE;
};

/**
 * ¿La celda puede pasar a TARDANZA? Solo si la falta ya quedó guardada en el backend
 * (AUSENTE/TARDANZA) o el registro fue reabierto para corregir.
 */
export const permiteAtraso = (estadoBackend, modoCorreccion = false) => {
  const guardado = estadoEfectivo(estadoBackend);
  return modoCorreccion || guardado === ESTADO.AUSENTE || guardado === ESTADO.TARDANZA;
};

/** Una celda es editable solo si es día de clase, no neutro, no futuro y el registro no está cerrado. */
export const celdaEditable = ({ esDiaClase, neutro, esFuturo, registroCerrado }) =>
  Boolean(esDiaClase) && !neutro && !esFuturo && !registroCerrado;
