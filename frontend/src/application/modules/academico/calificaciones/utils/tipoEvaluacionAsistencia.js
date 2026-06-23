/**
 * Identificación de la actividad especial de ASISTENCIA dentro del cuaderno.
 *
 * El cuaderno (DTO `mapEvaluacionEntityToDto`) NO expone el código del tipo ni un
 * flag propio: cada evaluación llega solo con `tipoEvaluacionId`. El catálogo de
 * tipos (`useTiposEvaluacion`), en cambio, sí trae `codigo` (p. ej. 'ASISTENCIA').
 * Para reconocer de forma robusta una columna de asistencia cruzamos el
 * `tipoEvaluacionId` de la evaluación con el `id` del tipo cuyo `codigo` es
 * ASISTENCIA, en lugar de depender de un nombre libre.
 *
 * La nota de estas columnas la calcula y la pisa el backend
 * (round(%asistencia × puntos)); en el front son solo lectura.
 */

/** Código institucional del tipo de evaluación calculado desde la asistencia. */
export const CODIGO_TIPO_EVALUACION_ASISTENCIA = 'ASISTENCIA';

/**
 * Devuelve el `id` del tipo de evaluación ASISTENCIA dentro del catálogo, o `null`
 * si todavía no se cargó o el instituto no lo tiene habilitado.
 *
 * @param {Array<{ id: number, codigo?: string }>} tipos catálogo de tipos de evaluación
 * @returns {number|null}
 */
export const resolverTipoEvaluacionAsistenciaId = (tipos = []) => {
  const tipo = (Array.isArray(tipos) ? tipos : []).find(
    (t) => t?.codigo === CODIGO_TIPO_EVALUACION_ASISTENCIA,
  );
  return tipo?.id ?? null;
};

/**
 * Indica si una evaluación del cuaderno es la columna calculada desde la asistencia.
 *
 * @param {{ tipoEvaluacionId?: number }} evaluacion evaluación del cuaderno
 * @param {number|null} tipoAsistenciaId id resuelto con `resolverTipoEvaluacionAsistenciaId`
 * @returns {boolean}
 */
export const esEvaluacionAsistencia = (evaluacion, tipoAsistenciaId) =>
  tipoAsistenciaId != null && evaluacion?.tipoEvaluacionId === tipoAsistenciaId;
