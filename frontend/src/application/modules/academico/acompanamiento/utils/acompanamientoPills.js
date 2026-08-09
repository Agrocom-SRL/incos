/**
 * Vocabularios del dominio Acompañamiento pedagógico → etiqueta legible +
 * clase de StatusPill.
 *
 * Mismo enfoque que `titulacionPills` / `capacitacionPills`: clases GLOBALES
 * `cfg-materia-pill--*` (styles/components/atoms/table-cells.css), sin CSS
 * propio del módulo. Dos vocabularios:
 *   - estado de la SESIÓN de refuerzo (ENUM sesiones_refuerzo.estado)
 *   - PROGRESO del estudiante (ENUM sesion_refuerzo_estudiantes.progreso)
 *
 * Rename 2026-07-31 (`tutoriasPills` → split): estos dos vocabularios se
 * reclasificaron desde Titulación (TIT) al dominio ACADÉMICO (ACA) — ver
 * `titulacion/utils/titulacionPills.js` para los vocabularios de proyecto.
 *
 * Semántica de color del kit: PENDIENTE = ámbar (warning), SUBSANADO/APROBADO
 * = verde (success), riesgo = rojo SEMÁNTICO del theme (danger — la clase usa
 * el token, nunca hex), inactivo/cerrado = gris (inactiva).
 */

/** ENUM del backend (sesiones_refuerzo.estado). */
export const ESTADOS_SESION = ['PROGRAMADA', 'REALIZADA', 'CANCELADA'];

const SESION_ESTADO_META = {
  PROGRAMADA: { label: 'Programada', pill: 'cfg-materia-pill--info' },
  REALIZADA: { label: 'Realizada', pill: 'cfg-materia-pill--success' },
  CANCELADA: { label: 'Cancelada', pill: 'cfg-materia-pill--inactiva' },
};

/** Etiqueta legible del estado de la sesión. */
export const formatEstadoSesion = (estado) => SESION_ESTADO_META[estado]?.label ?? estado ?? '—';

/** Clase completa del StatusPill para el estado de la sesión. */
export const getEstadoSesionPillClass = (estado) =>
  `cfg-materia-pill ${SESION_ESTADO_META[estado]?.pill ?? 'cfg-materia-pill--default'}`;

/** ENUM del backend (sesion_refuerzo_estudiantes.progreso). */
export const PROGRESOS_ESTUDIANTE = ['SIN_EVALUAR', 'EN_PROGRESO', 'MEJORADO', 'SIN_MEJORA'];

const PROGRESO_META = {
  SIN_EVALUAR: { label: 'Sin evaluar', pill: 'cfg-materia-pill--default' },
  EN_PROGRESO: { label: 'En progreso', pill: 'cfg-materia-pill--info' },
  MEJORADO: { label: 'Mejorado', pill: 'cfg-materia-pill--success' },
  SIN_MEJORA: { label: 'Sin mejora', pill: 'cfg-materia-pill--danger' },
};

/** Etiqueta legible del progreso del estudiante. */
export const formatProgresoEstudiante = (progreso) =>
  PROGRESO_META[progreso]?.label ?? progreso ?? '—';

/** Clase completa del StatusPill para el progreso del estudiante. */
export const getProgresoEstudiantePillClass = (progreso) =>
  `cfg-materia-pill ${PROGRESO_META[progreso]?.pill ?? 'cfg-materia-pill--default'}`;

/** Opciones del select de progreso (registro de asistencia, A9). */
export const PROGRESO_ESTUDIANTE_OPTIONS = PROGRESOS_ESTUDIANTE.map((progreso) => ({
  value: progreso,
  label: formatProgresoEstudiante(progreso),
}));

/** ENUM del backend (sesion_refuerzo_estudiantes.origen). */
const ORIGEN_ESTUDIANTE_META = {
  RIESGO: 'Alerta de riesgo',
  DOCENTE: 'Invitado por el docente',
  VOLUNTARIO: 'Voluntario',
};

/** Etiqueta legible del origen del estudiante. */
export const formatOrigenEstudiante = (origen) => ORIGEN_ESTUDIANTE_META[origen] ?? origen ?? '—';

/** Pill de riesgo pedagógico (vista 156): SIEMPRE el rojo semántico del kit. */
export const RIESGO_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--danger';

/** Pill neutro para estudiantes sin riesgo (drawer de detalle A3). */
export const SIN_RIESGO_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--success';

/**
 * Etiqueta de la columna "Situación" combinando las 2 dimensiones de riesgo
 * de la vista 156 (nota `enRiesgo` + asistencia `enRiesgoAsistencia`, ambas
 * 100% informativas — nunca cambian estado por sí solas). Mismo criterio en
 * el listado de alertas, "Mis alumnos en riesgo", el panel y el drawer de
 * detalle, para no repetir la combinación 4 veces.
 * @param {{enRiesgo?: boolean, enRiesgoAsistencia?: boolean, umbralRiesgo?: number|null}} record
 * @returns {string}
 */
export const formatSituacionRiesgo = ({ enRiesgo, enRiesgoAsistencia, umbralRiesgo } = {}) => {
  if (enRiesgo && enRiesgoAsistencia) return `En riesgo (nota y asistencia < ${umbralRiesgo})`;
  if (enRiesgo) return `En riesgo (< ${umbralRiesgo})`;
  if (enRiesgoAsistencia) return 'En riesgo (asistencia)';
  return 'Regular';
};

/**
 * Clase del StatusPill de "Situación": rojo si CUALQUIERA de las 2
 * dimensiones está en riesgo, verde si ninguna.
 * @param {{enRiesgo?: boolean, enRiesgoAsistencia?: boolean}} record
 * @returns {string}
 */
export const getSituacionRiesgoPillClass = ({ enRiesgo, enRiesgoAsistencia } = {}) =>
  enRiesgo || enRiesgoAsistencia ? RIESGO_PILL_CLASS : SIN_RIESGO_PILL_CLASS;
