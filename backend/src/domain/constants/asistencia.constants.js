/**
 * Constantes del dominio de Asistencia (Académico · ítem ACA-ASI).
 *
 * Modelo revisado basado en `sesiones_clase` (schema 17):
 *   - ESTADOS_SESION_CLASE: gobierna el cierre/reapertura del registro por sesión.
 *   - ESTADOS_ASISTENCIA: marcas persistidas (sparse) en `asistencias`. Solo se
 *     persisten AUSENTE/TARDANZA; la sesión existente sin fila del estudiante =
 *     PRESENTE implícito (NUNCA se inserta una fila PRESENTE).
 *   - MARCAS_PLANILLA: vocabulario del docente que la UI renderiza (P/R/F/L). La "L"
 *     (Licencia) se deriva por cruce dinámico con licencias APROBADAS, no se persiste.
 *   - MOTIVOS_NEUTRO: por qué un día no cuenta al % (fuera del denominador).
 */

export const ESTADOS_SESION_CLASE = {
  ABIERTA: 'ABIERTA',
  CERRADA: 'CERRADA',
};

export const ESTADOS_SESION_CLASE_VALUES = Object.values(ESTADOS_SESION_CLASE);

export const ESTADOS_ASISTENCIA = {
  PRESENTE: 'PRESENTE',
  AUSENTE: 'AUSENTE',
  TARDANZA: 'TARDANZA',
};

export const ESTADOS_ASISTENCIA_VALUES = Object.values(ESTADOS_ASISTENCIA);

/**
 * Estados que SÍ se persisten en `asistencias` (modelo sparse).
 * PRESENTE nunca se persiste: es el implícito de una sesión existente.
 */
export const ESTADOS_ASISTENCIA_PERSISTIBLES = [
  ESTADOS_ASISTENCIA.AUSENTE,
  ESTADOS_ASISTENCIA.TARDANZA,
];

/**
 * Marcas que el docente ve en la planilla (vocabulario oficial INCOS).
 */
export const MARCAS_PLANILLA = {
  PRESENTE: 'P',
  TARDANZA: 'R', // Retraso
  AUSENTE: 'F', // Falta
  LICENCIA: 'L', // Licencia aprobada (derivada, no persistida)
};

/**
 * Motivos por los que un día es NEUTRO (no cuenta al % de asistencia).
 */
export const MOTIVOS_NEUTRO = {
  FERIADO: 'FERIADO',
  CLASE_NO_DICTADA: 'CLASE_NO_DICTADA',
  LICENCIA: 'LICENCIA',
};

/**
 * Días de la semana (ENUM de `horarios.dia`) → índice de getDay() de JS
 * (0=DOMINGO … 6=SABADO). Usado en la expansión "día-de-semana → fechas del rango".
 */
export const DIA_SEMANA_A_INDICE = {
  DOMINGO: 0,
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
};

/**
 * Estado agregado del registro por curso × bimestre (derivado por vista).
 */
export const ESTADOS_REGISTRO_ASISTENCIA = {
  ABIERTO: 'ABIERTO',
  CERRADO: 'CERRADO',
};
