/**
 * Contexto de navegación por querystring entre la grilla de Nivelación (P1
 * nivel 2) y los Drawers de `/inscribir` y `/aprobar` — no hay endpoint de
 * detalle por `historialMatriculaId`/`nivelacionId` suelto, así que TODO lo
 * que el Drawer necesita mostrar viaja en la URL en el momento del click
 * (documento de diseño B1 nivel 2 / B4: "clicable → navega a /inscribir o
 * /aprobar con querystring de contexto").
 *
 * Dos formas de contexto:
 * - `aprobar`: la celda YA tiene una nivelación activa (PROGRAMADA/EN_CURSO)
 *   → se navega a /aprobar con SOLO el `nivelacionId` en la URL. La bandeja
 *   de esa pantalla (`GET /nivelaciones/pendientes`) YA trae, por
 *   construcción, toda nivelación PROGRAMADA/EN_CURSO — incluida esta —, así
 *   que la página busca la fila real ahí (con `subjectEnrollmentId` incluido
 *   cuando aplica) en vez de duplicar contexto por querystring.
 * - `detalle`: la celda tiene un evento SIN nivelación activa (bloqueo,
 *   cronología, decisión ya registrada, o examen ya cerrado) → se navega a
 *   /inscribir en modo solo lectura: no hay ancla reutilizable
 *   (`subjectEnrollmentId`/`enrollmentId`+`planSubjectId`) para registrar un
 *   evento NUEVO sobre la misma materia sin ese dato, que la grilla no
 *   expone (gap conocido, ver reporte de esta fase) ni una lista ya cargada
 *   donde buscarlo — por eso ESTE contexto sí viaja completo en la URL.
 */

const toQueryValue = (value) => (value == null || value === '' ? undefined : String(value));

/** Arma los params de contexto para navegar desde una celda con nivelación activa. */
export const buildAprobarContextoParams = ({ nivelacionId } = {}) => {
  const params = new URLSearchParams();
  if (nivelacionId != null) params.set('nivelacionId', String(nivelacionId));
  return params;
};

/** Lee el `nivelacionId` de contexto de /aprobar cuando llega desde un deep-link de la grilla. */
export const parseAprobarContexto = (searchParams) => {
  const nivelacionId = searchParams.get('nivelacionId');
  return nivelacionId ? Number(nivelacionId) : null;
};

/** Arma los params de contexto para navegar desde una celda con evento sin nivelación activa. */
export const buildDetalleEventoContextoParams = ({
  historialMatriculaId,
  estudianteNombre,
  estudianteCodigo,
  asignaturaSigla,
  asignaturaNombre,
  stateType,
  transitionDate,
  observations,
  resultingGrade,
  forcedGrade,
  esAnclaDirecta,
  nivelacion,
} = {}) => {
  const params = new URLSearchParams();
  const set = (key, value) => {
    const v = toQueryValue(value);
    if (v !== undefined) params.set(key, v);
  };
  set('historialMatriculaId', historialMatriculaId);
  set('estudiante', estudianteNombre);
  set('codigo', estudianteCodigo);
  set('asignaturaSigla', asignaturaSigla);
  set('asignaturaNombre', asignaturaNombre);
  set('stateType', stateType);
  set('transitionDate', transitionDate);
  set('observations', observations);
  set('resultingGrade', resultingGrade);
  set('forcedGrade', forcedGrade != null ? String(Boolean(forcedGrade)) : undefined);
  set('esAnclaDirecta', esAnclaDirecta != null ? String(Boolean(esAnclaDirecta)) : undefined);
  if (nivelacion) {
    set('nivelacionId', nivelacion.id);
    set('nivelacionStatus', nivelacion.status);
    set('nivelacionGrade', nivelacion.levelingGrade);
    set('nivelacionPassed', nivelacion.passed != null ? String(Boolean(nivelacion.passed)) : undefined);
    set('nivelacionExamDate', nivelacion.examDate);
  }
  return params;
};

/**
 * Lee el contexto de CREACIÓN de /inscribir cuando el deep-link SÍ trae un
 * ancla de escritura real (`subjectEnrollmentId` XOR `enrollmentId`+
 * `planSubjectId`). Hoy no hay ningún llamador que arme este querystring
 * (la grilla solo expone `historialMatriculaId` en celdas con evento —
 * `parseDetalleEventoContexto` — y la landing sin contexto todavía no
 * resuelve el ancla, ver `useNivelacionSelector.js`), pero el Drawer queda
 * listo para consumirlo en cuanto exista un origen real.
 */
export const parseCrearEventoContexto = (searchParams) => {
  const subjectEnrollmentId = searchParams.get('subjectEnrollmentId');
  const enrollmentId = searchParams.get('enrollmentId');
  const planSubjectId = searchParams.get('planSubjectId');
  const tieneAncla = subjectEnrollmentId || (enrollmentId && planSubjectId);
  if (!tieneAncla) return null;
  return {
    ancla: subjectEnrollmentId
      ? { subjectEnrollmentId: Number(subjectEnrollmentId) }
      : { enrollmentId: Number(enrollmentId), planSubjectId: Number(planSubjectId) },
    contexto: {
      estudianteNombre: searchParams.get('estudiante') ?? null,
      estudianteCodigo: searchParams.get('codigo') ?? null,
      asignaturaSigla: searchParams.get('asignaturaSigla') ?? null,
      asignaturaNombre: searchParams.get('asignaturaNombre') ?? null,
    },
  };
};

/** Lee el contexto de detalle (solo lectura) de /inscribir cuando llega desde un deep-link. */
export const parseDetalleEventoContexto = (searchParams) => {
  const historialMatriculaId = searchParams.get('historialMatriculaId');
  if (!historialMatriculaId) return null;
  const nivelacionId = searchParams.get('nivelacionId');
  return {
    historialMatriculaId: Number(historialMatriculaId),
    estudianteNombre: searchParams.get('estudiante') ?? null,
    estudianteCodigo: searchParams.get('codigo') ?? null,
    asignaturaSigla: searchParams.get('asignaturaSigla') ?? null,
    asignaturaNombre: searchParams.get('asignaturaNombre') ?? null,
    stateType: searchParams.get('stateType') ?? null,
    transitionDate: searchParams.get('transitionDate') ?? null,
    observations: searchParams.get('observations') ?? null,
    resultingGrade: searchParams.get('resultingGrade')
      ? Number(searchParams.get('resultingGrade'))
      : null,
    forcedGrade: searchParams.get('forcedGrade') === 'true',
    esAnclaDirecta: searchParams.get('esAnclaDirecta') === 'true',
    nivelacion: nivelacionId
      ? {
          id: Number(nivelacionId),
          status: searchParams.get('nivelacionStatus') ?? null,
          levelingGrade: searchParams.get('nivelacionGrade')
            ? Number(searchParams.get('nivelacionGrade'))
            : null,
          passed: searchParams.get('nivelacionPassed') === 'true',
          examDate: searchParams.get('nivelacionExamDate') ?? null,
        }
      : null,
  };
};
