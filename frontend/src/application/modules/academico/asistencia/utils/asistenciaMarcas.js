/**
 * Reglas de marcado de asistencia (sparse + ciclo de celda).
 *
 * - El default vacío es PRESENTE. Para que el backend BORRE una fila al volver a presente,
 *   la celda modificada se envía con `estado: 'PRESENTE'` explícito (nunca se omite).
 * - Modo normal (registro ABIERTO): el click cicla PRESENTE ↔ AUSENTE.
 * - Modo corrección (el usuario REABRIÓ el registro): el click cicla
 *   AUSENTE → TARDANZA → PRESENTE. Quitar una falta deja «atrasado» (R/TARDANZA).
 *   TARDANZA solo es accesible en este modo.
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
 * @param {boolean} modoCorreccion  TARDANZA solo accesible si true (registro reabierto).
 * @returns {string} próximo estado (PRESENTE | AUSENTE | TARDANZA)
 */
export const siguienteEstado = (estadoActual, modoCorreccion) => {
  const actual = estadoEfectivo(estadoActual);
  if (modoCorreccion) {
    // AUSENTE → TARDANZA → PRESENTE → AUSENTE
    if (actual === ESTADO.AUSENTE) return ESTADO.TARDANZA;
    if (actual === ESTADO.TARDANZA) return ESTADO.PRESENTE;
    return ESTADO.AUSENTE;
  }
  // Modo normal: PRESENTE ↔ AUSENTE
  return actual === ESTADO.AUSENTE ? ESTADO.PRESENTE : ESTADO.AUSENTE;
};

/** Una celda es editable solo si es día de clase, no neutro, no futuro y el registro no está cerrado. */
export const celdaEditable = ({ esDiaClase, neutro, esFuturo, registroCerrado }) =>
  Boolean(esDiaClase) && !neutro && !esFuturo && !registroCerrado;
