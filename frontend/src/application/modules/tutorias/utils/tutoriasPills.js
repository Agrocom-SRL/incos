/**
 * Estados del dominio Tutorías → etiqueta legible + clase de StatusPill.
 *
 * Mismo enfoque que `capacitacionPills` (CAP): clases GLOBALES
 * `cfg-materia-pill--*` (styles/components/atoms/table-cells.css), sin CSS
 * propio del módulo. Cinco vocabularios:
 *   - estado del PROYECTO de grado (ENUM proyectos_grado.estado, schema 23)
 *   - estado de REVISIÓN de un avance (ENUM tutoria_avances.estado_revision)
 *   - estado de una entrada de BITÁCORA (ENUM tutoria_bitacora.estado)
 *   - estado de la SESIÓN de reforzamiento (ENUM sesiones_reforzamiento.estado)
 *   - PROGRESO del participante (ENUM sesion_reforzamiento_participantes.progreso)
 *
 * Semántica de color del kit: PENDIENTE = ámbar (warning), SUBSANADO/APROBADO
 * = verde (success), riesgo = rojo SEMÁNTICO del theme (danger — la clase usa
 * el token, nunca hex), inactivo/cerrado = gris (inactiva).
 */

/** ENUM del backend (proyectos_grado.estado) — máquina de estados de titulación. */
export const ESTADOS_PROYECTO_GRADO = [
  'PERFIL',
  'APROBADO_PERFIL',
  'DESARROLLO',
  'PREDEFENSA',
  'APROBADO_PREDEFENSA',
  'DEFENSA',
  'APROBADO',
  'REPROBADO',
  'CANCELADO',
];

const PROYECTO_ESTADO_META = {
  PERFIL: { label: 'Perfil', pill: 'cfg-materia-pill--default' },
  APROBADO_PERFIL: { label: 'Perfil aprobado', pill: 'cfg-materia-pill--info' },
  DESARROLLO: { label: 'En desarrollo', pill: 'cfg-materia-pill--primary' },
  PREDEFENSA: { label: 'Predefensa', pill: 'cfg-materia-pill--warning' },
  APROBADO_PREDEFENSA: { label: 'Predefensa aprobada', pill: 'cfg-materia-pill--info' },
  DEFENSA: { label: 'Defensa', pill: 'cfg-materia-pill--warning' },
  APROBADO: { label: 'Aprobado', pill: 'cfg-materia-pill--success' },
  REPROBADO: { label: 'Reprobado', pill: 'cfg-materia-pill--danger' },
  CANCELADO: { label: 'Cancelado', pill: 'cfg-materia-pill--inactiva' },
};

/** Etiqueta legible del estado del proyecto. */
export const formatEstadoProyecto = (estado) =>
  PROYECTO_ESTADO_META[estado]?.label ?? estado ?? '—';

/** Clase completa del StatusPill para el estado del proyecto. */
export const getEstadoProyectoPillClass = (estado) =>
  `cfg-materia-pill ${PROYECTO_ESTADO_META[estado]?.pill ?? 'cfg-materia-pill--default'}`;

/**
 * Transiciones "hacia adelante" de la máquina de estados (T11). El backend es
 * la autoridad; esta tabla solo puebla el select del modal de aprobación.
 */
export const TRANSICIONES_PROYECTO = {
  PERFIL: ['APROBADO_PERFIL', 'CANCELADO'],
  APROBADO_PERFIL: ['DESARROLLO', 'CANCELADO'],
  DESARROLLO: ['PREDEFENSA', 'CANCELADO'],
  PREDEFENSA: ['APROBADO_PREDEFENSA', 'CANCELADO'],
  APROBADO_PREDEFENSA: ['DEFENSA', 'CANCELADO'],
  DEFENSA: ['APROBADO', 'REPROBADO'],
  APROBADO: [],
  REPROBADO: [],
  CANCELADO: [],
};

/** ENUM del backend (tutoria_avances.estado_revision). */
export const ESTADOS_REVISION_AVANCE = [
  'PENDIENTE_REVISION',
  'OBSERVADO',
  'SUBSANADO',
  'APROBADO',
];

const AVANCE_ESTADO_META = {
  PENDIENTE_REVISION: { label: 'Pendiente de revisión', pill: 'cfg-materia-pill--warning' },
  OBSERVADO: { label: 'Observado', pill: 'cfg-materia-pill--danger' },
  SUBSANADO: { label: 'Subsanado', pill: 'cfg-materia-pill--success' },
  APROBADO: { label: 'Aprobado', pill: 'cfg-materia-pill--success' },
};

/** Etiqueta legible del estado de revisión de un avance. */
export const formatEstadoAvance = (estado) => AVANCE_ESTADO_META[estado]?.label ?? estado ?? '—';

/** Clase completa del StatusPill para el estado de revisión de un avance. */
export const getEstadoAvancePillClass = (estado) =>
  `cfg-materia-pill ${AVANCE_ESTADO_META[estado]?.pill ?? 'cfg-materia-pill--default'}`;

/** ENUM del backend (tutoria_bitacora.estado). */
export const ESTADOS_BITACORA = ['PENDIENTE', 'SUBSANADO'];

const BITACORA_ESTADO_META = {
  PENDIENTE: { label: 'Pendiente', pill: 'cfg-materia-pill--warning' },
  SUBSANADO: { label: 'Subsanado', pill: 'cfg-materia-pill--success' },
};

/** Etiqueta legible del estado de una entrada de bitácora. */
export const formatEstadoBitacora = (estado) =>
  BITACORA_ESTADO_META[estado]?.label ?? estado ?? '—';

/** Clase completa del StatusPill para el estado de una entrada de bitácora. */
export const getEstadoBitacoraPillClass = (estado) =>
  `cfg-materia-pill ${BITACORA_ESTADO_META[estado]?.pill ?? 'cfg-materia-pill--default'}`;

/** ENUM del backend (tutoria_bitacora.tipo). */
const BITACORA_TIPO_META = {
  REUNION: 'Reunión de tutoría',
  REVISION_AVANCE: 'Revisión de avance',
};

/** Etiqueta legible del tipo de entrada de bitácora. */
export const formatTipoBitacora = (tipo) => BITACORA_TIPO_META[tipo] ?? tipo ?? '—';

/** ENUM del backend (tutoria_dictamenes.tipo). */
const DICTAMEN_TIPO_META = {
  VIABILIDAD_TECNICA: 'Viabilidad técnica',
  DESIGNACION_OFICIAL: 'Designación oficial de tutor',
};

/** Etiqueta legible del tipo de dictamen. */
export const formatTipoDictamen = (tipo) => DICTAMEN_TIPO_META[tipo] ?? tipo ?? '—';

const DICTAMEN_RESULTADO_META = {
  APROBADO: { label: 'Aprobado', pill: 'cfg-materia-pill--success' },
  OBSERVADO: { label: 'Observado', pill: 'cfg-materia-pill--warning' },
  RECHAZADO: { label: 'Rechazado', pill: 'cfg-materia-pill--danger' },
};

/** Etiqueta legible del resultado de un dictamen (NULL en designaciones). */
export const formatResultadoDictamen = (resultado) =>
  DICTAMEN_RESULTADO_META[resultado]?.label ?? resultado ?? '—';

/** Clase completa del StatusPill para el resultado de un dictamen. */
export const getResultadoDictamenPillClass = (resultado) =>
  `cfg-materia-pill ${DICTAMEN_RESULTADO_META[resultado]?.pill ?? 'cfg-materia-pill--default'}`;

/** ENUM del backend (sesiones_reforzamiento.estado). */
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

/** ENUM del backend (sesion_reforzamiento_participantes.progreso). */
export const PROGRESOS_PARTICIPANTE = ['SIN_EVALUAR', 'EN_PROGRESO', 'MEJORADO', 'SIN_MEJORA'];

const PROGRESO_META = {
  SIN_EVALUAR: { label: 'Sin evaluar', pill: 'cfg-materia-pill--default' },
  EN_PROGRESO: { label: 'En progreso', pill: 'cfg-materia-pill--info' },
  MEJORADO: { label: 'Mejorado', pill: 'cfg-materia-pill--success' },
  SIN_MEJORA: { label: 'Sin mejora', pill: 'cfg-materia-pill--danger' },
};

/** Etiqueta legible del progreso del participante. */
export const formatProgresoParticipante = (progreso) =>
  PROGRESO_META[progreso]?.label ?? progreso ?? '—';

/** Clase completa del StatusPill para el progreso del participante. */
export const getProgresoParticipantePillClass = (progreso) =>
  `cfg-materia-pill ${PROGRESO_META[progreso]?.pill ?? 'cfg-materia-pill--default'}`;

/** Opciones del select de progreso (registro de asistencia, A9). */
export const PROGRESO_PARTICIPANTE_OPTIONS = PROGRESOS_PARTICIPANTE.map((progreso) => ({
  value: progreso,
  label: formatProgresoParticipante(progreso),
}));

/** ENUM del backend (sesion_reforzamiento_participantes.origen). */
const ORIGEN_PARTICIPANTE_META = {
  RIESGO: 'Alerta de riesgo',
  DOCENTE: 'Invitado por el docente',
  VOLUNTARIO: 'Voluntario',
};

/** Etiqueta legible del origen del participante. */
export const formatOrigenParticipante = (origen) => ORIGEN_PARTICIPANTE_META[origen] ?? origen ?? '—';

/** Pill de riesgo pedagógico (vista 156): SIEMPRE el rojo semántico del kit. */
export const RIESGO_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--danger';

/** Pill neutro para estudiantes sin riesgo (drawer de detalle A3). */
export const SIN_RIESGO_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--success';

/**
 * Grupalidad de la modalidad: `modalidades_grado` no tiene flag grupal —
 * criterio cerrado del plan: código 'PSP' (Proyecto Socio-comunitario
 * Productivo) admite integrantes múltiples.
 */
export const esModalidadGrupal = (codigo) => codigo === 'PSP';
