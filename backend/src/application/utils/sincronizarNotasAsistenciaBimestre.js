import { esBimestreEditable } from './assertBimestreEditable.js';
import { recalcularNotasAsistenciaCurso } from './recalcularNotasAsistenciaCurso.js';

/**
 * Sincroniza la(s) columna(s) ASISTENCIA de un curso/bimestre como SIDE-EFFECT
 * tolerante a fallos: recalcula la nota proporcional de asistencia y la persiste
 * (upsert en evaluaciones_notas) SIN esperar al cierre del bimestre.
 *
 * GUARD de estado: solo recalcula si el bimestre está REABIERTO o EN_CURSO
 * (señal booleana de {@link esBimestreEditable}). NUNCA si está CERRADO: pisaría
 * las notas ya consolidadas. PENDIENTE/CERRADO → no-op.
 *
 * Pensado para invocarse en lecturas (GET cuaderno/registro de notas) y tras
 * registrar/cerrar asistencia. Cualquier error se loguea y se ignora: la lectura
 * o la escritura de asistencia NUNCA debe romperse por este recálculo. Si el
 * curso no tiene columna ASISTENCIA en el bimestre, el helper subyacente es un
 * no-op barato.
 *
 * @returns {Promise<{ columnasAsistencia:number, celdasAsistencia:number }>}
 */
export async function sincronizarNotasAsistenciaBimestre({
  calificacionContextoRepository,
  cuadernoRepository,
  asistenciaPlanillaViewRepository,
  subjectEnrollmentBimesterRepository,
  bimesterEvaluationGradeRepository,
  asignacionId,
  gestionId,
  bimestreNumero,
  usuarioId,
  logger
}) {
  const vacio = { columnasAsistencia: 0, celdasAsistencia: 0 };
  try {
    const editable = await esBimestreEditable({
      calificacionContextoRepository,
      subjectEnrollmentBimesterRepository,
      gestionId,
      asignacionId,
      bimestreNum: bimestreNumero
    });

    // CERRADO o PENDIENTE: no tocar las notas consolidadas / aún no abiertas.
    if (!editable) {
      return vacio;
    }

    return await recalcularNotasAsistenciaCurso({
      cuadernoRepository,
      asistenciaPlanillaViewRepository,
      subjectEnrollmentBimesterRepository,
      bimesterEvaluationGradeRepository,
      asignacionId: Number(asignacionId),
      gestionId: Number(gestionId),
      bimestreNumero: Number(bimestreNumero),
      usuarioId
    });
  } catch (error) {
    logger?.warn?.('[Asistencia] Recalculo de columna ASISTENCIA omitido (side-effect)', {
      asignacionId: Number(asignacionId),
      gestionId: Number(gestionId),
      bimestre: Number(bimestreNumero),
      error: error?.message ?? String(error)
    });
    return vacio;
  }
}
