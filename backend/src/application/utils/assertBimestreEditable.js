import { ForbiddenError } from '../../domain/errors/AppError.js';
import { ESTADOS_INSTITUCIONALES_BIMESTRE } from '../../domain/constants/evaluaciones.constants.js';

/**
 * Versión BOOLEANA (sin throw) de la misma señal de estado que usa
 * {@link assertBimestreEditable}: el bimestre es editable si fue REABIERTO por
 * curso o está institucionalmente EN_CURSO (vista 114). PENDIENTE o CERRADO → false.
 *
 * Pensada para usarse como GUARD de side-effects tolerantes a fallos (p. ej.
 * recalcular la columna ASISTENCIA al leer el cuaderno/notas), donde lanzar una
 * excepción rompería la lectura. NUNCA recalcular si el bimestre está CERRADO:
 * pisaría las notas ya consolidadas.
 *
 * @returns {Promise<boolean>} true si REABIERTO o EN_CURSO.
 */
export async function esBimestreEditable({
  calificacionContextoRepository,
  subjectEnrollmentBimesterRepository,
  gestionId,
  asignacionId,
  bimestreNum
}) {
  const reabierto =
    (await subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso(
      Number(asignacionId),
      Number(bimestreNum)
    )) > 0;

  if (reabierto) {
    return true;
  }

  const estadoInstitucional =
    await calificacionContextoRepository.obtenerEstadoInstitucionalBimestre(
      Number(gestionId),
      Number(bimestreNum)
    );

  return estadoInstitucional === ESTADOS_INSTITUCIONALES_BIMESTRE.EN_CURSO;
}

/**
 * Compuerta de edición de notas/actividades del cuaderno por ESTADO del bimestre.
 *
 * La habilitación NO depende de la fecha vigente: se permite escribir si
 *   - el bimestre está institucionalmente EN_CURSO (vista 114, por gestión × bimestre), o
 *   - el bimestre fue REABIERTO por curso (contarBimestreReabiertoCurso > 0).
 * Se bloquea si está PENDIENTE (aún no abierto) o CERRADO.
 *
 * Solo gobierna notas/actividades; la asistencia se rige por fecha+sesión.
 *
 * @returns {Promise<{ reabierto: boolean, estadoInstitucional: string|null }>}
 */
export async function assertBimestreEditable({
  calificacionContextoRepository,
  subjectEnrollmentBimesterRepository,
  gestionId,
  asignacionId,
  bimestreNum
}) {
  const reabierto =
    (await subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso(
      Number(asignacionId),
      Number(bimestreNum)
    )) > 0;

  if (reabierto) {
    return { reabierto: true, estadoInstitucional: null };
  }

  const estadoInstitucional =
    await calificacionContextoRepository.obtenerEstadoInstitucionalBimestre(
      Number(gestionId),
      Number(bimestreNum)
    );

  if (estadoInstitucional === ESTADOS_INSTITUCIONALES_BIMESTRE.EN_CURSO) {
    return { reabierto: false, estadoInstitucional };
  }

  if (estadoInstitucional === ESTADOS_INSTITUCIONALES_BIMESTRE.CERRADO) {
    throw new ForbiddenError(`El bimestre ${bimestreNum} está cerrado.`);
  }

  // PENDIENTE o sin filas (aún no abierto institucionalmente).
  throw new ForbiddenError(
    `El bimestre ${bimestreNum} no está abierto. El administrador debe abrirlo desde Control de bimestres.`
  );
}
