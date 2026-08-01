/**
 * Estados del dominio Titulación (proyectos de grado) → etiqueta legible +
 * clase de StatusPill.
 *
 * Mismo enfoque que `capacitacionPills` (CAP): clases GLOBALES
 * `cfg-materia-pill--*` (styles/components/atoms/table-cells.css), sin CSS
 * propio del módulo. Tres vocabularios:
 *   - estado del PROYECTO de grado (ENUM proyectos_grado.estado, schema 23)
 *   - estado de REVISIÓN de un avance (ENUM avances_proyecto.estado_revision)
 *   - estado de una entrada de BITÁCORA (ENUM bitacora_proyecto.estado)
 *
 * Rename 2026-07-31 (`tutoriasPills` → `titulacionPills`): los vocabularios de
 * SESIÓN de refuerzo y PROGRESO del estudiante se reclasificaron al dominio
 * ACADÉMICO — ver `academico/acompanamiento/utils/acompanamientoPills.js`.
 *
 * Semántica de color del kit: PENDIENTE = ámbar (warning), SUBSANADO/APROBADO
 * = verde (success), inactivo/cerrado = gris (inactiva).
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

/** ENUM del backend (avances_proyecto.estado_revision). */
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

/** ENUM del backend (bitacora_proyecto.estado). */
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

/** ENUM del backend (bitacora_proyecto.tipo). */
const BITACORA_TIPO_META = {
  REUNION: 'Reunión de tutoría',
  REVISION_AVANCE: 'Revisión de avance',
};

/** Etiqueta legible del tipo de entrada de bitácora. */
export const formatTipoBitacora = (tipo) => BITACORA_TIPO_META[tipo] ?? tipo ?? '—';

/** ENUM del backend (dictamenes_proyecto.tipo). */
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

/**
 * Grupalidad de la modalidad: `modalidades_grado` no tiene flag grupal —
 * criterio cerrado del plan: código 'PSP' (Proyecto Socio-comunitario
 * Productivo) admite integrantes múltiples.
 */
export const esModalidadGrupal = (codigo) => codigo === 'PSP';

/**
 * Resultado de tutoría de 3er año (planilla "10 en 10", extensión
 * 2026-07-31): derivado en la vista 181 a partir de `proyectos_grado.estado`
 * e `integrantes_proyecto.estado` (espejo de
 * `domain/constants/titulacion.constants.js` · `RESULTADOS_TUTORIA_TERCER_ANIO`
 * del backend).
 */
export const RESULTADOS_TUTORIA_TERCER_ANIO = ['APROBADO', 'REPROBADO', 'ABANDONO', 'EN_PROCESO'];

const RESULTADO_TUTORIA_META = {
  APROBADO: { label: 'Aprobado', pill: 'cfg-materia-pill--success' },
  REPROBADO: { label: 'Reprobado', pill: 'cfg-materia-pill--danger' },
  ABANDONO: { label: 'Abandono', pill: 'cfg-materia-pill--inactiva' },
  EN_PROCESO: { label: 'En proceso', pill: 'cfg-materia-pill--warning' },
};

/** Etiqueta legible del resultado de tutoría (planilla de 3er año). */
export const formatResultadoTutoria = (resultado) =>
  RESULTADO_TUTORIA_META[resultado]?.label ?? resultado ?? '—';

/** Clase completa del StatusPill para el resultado de tutoría. */
export const getResultadoTutoriaPillClass = (resultado) =>
  `cfg-materia-pill ${RESULTADO_TUTORIA_META[resultado]?.pill ?? 'cfg-materia-pill--default'}`;
