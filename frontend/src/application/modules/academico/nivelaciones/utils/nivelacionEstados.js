/**
 * Catálogo de estados de Nivelación — etiquetas + clase de pill
 * (`cfg-materia-pill--*`, tokens del design system, sin colores inventados).
 * Mismo enfoque que `librosEstados.js`.
 *
 * Espejo de `backend/src/domain/constants/inscripciones.constants.js`
 * (`TIPOS_ESTADO_HISTORIAL_MATRICULA`) y
 * `backend/src/domain/constants/evaluaciones.constants.js`
 * (`ESTADOS_NIVELACION`). Documento de diseño:
 * docs/plan/centralizador-nivelacion-frontend-diseno.md (B0).
 */

/** Nota mínima de aprobación de un examen de nivelación (fija, espejo del backend). */
export const NOTA_MINIMA_NIVELACION = 61;

/**
 * `historial_matricula.tipo_estado`, agrupado por naturaleza. El grupo decide
 * el pill y, en los Drawers de inscripción, el `optGroup` del Select.
 */
export const GRUPO_ESTADO_HISTORIAL = {
  EXAMEN_ACADEMICO: 'EXAMEN_ACADEMICO',
  BLOQUEO_SIN_NOTA: 'BLOQUEO_SIN_NOTA',
  CRONOLOGIA_SIN_NOTA: 'CRONOLOGIA_SIN_NOTA',
  DECISION_ADMINISTRATIVA: 'DECISION_ADMINISTRATIVA',
};

const GRUPO_LABEL = {
  [GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO]: 'Examen académico',
  [GRUPO_ESTADO_HISTORIAL.BLOQUEO_SIN_NOTA]: 'Bloqueo sin nota',
  [GRUPO_ESTADO_HISTORIAL.CRONOLOGIA_SIN_NOTA]: 'Cronología sin nota',
  [GRUPO_ESTADO_HISTORIAL.DECISION_ADMINISTRATIVA]: 'Decisión administrativa',
};

const GRUPO_PILL_CLASS = {
  [GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO]: 'cfg-materia-pill cfg-materia-pill--warning',
  [GRUPO_ESTADO_HISTORIAL.BLOQUEO_SIN_NOTA]: 'cfg-materia-pill cfg-materia-pill--default',
  [GRUPO_ESTADO_HISTORIAL.CRONOLOGIA_SIN_NOTA]: 'cfg-materia-pill cfg-materia-pill--info',
  [GRUPO_ESTADO_HISTORIAL.DECISION_ADMINISTRATIVA]: 'cfg-materia-pill cfg-materia-pill--danger',
};

/** `tipo_estado` → { label, grupo }. Única fuente de verdad del catálogo. */
export const ESTADOS_HISTORIAL_MATRICULA = {
  NIVELACION_1RA: { label: 'Nivelación 1ra', grupo: GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO },
  NIVELACION_2DA: { label: 'Nivelación 2da', grupo: GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO },
  PRUEBA_EXCEPCIONAL: {
    label: 'Prueba excepcional',
    grupo: GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO,
  },
  RECUPERATORIO_ANUAL: {
    label: 'Recuperatorio anual',
    grupo: GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO,
  },
  ARTICULO_18: { label: 'Nivela Art. 18', grupo: GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO },
  VENCIDA: { label: 'Materia vencida', grupo: GRUPO_ESTADO_HISTORIAL.BLOQUEO_SIN_NOTA },
  CHOQUE_HORARIO: { label: 'Choque de horario', grupo: GRUPO_ESTADO_HISTORIAL.BLOQUEO_SIN_NOTA },
  PRE_REQUISITO: { label: 'Falta prerrequisito', grupo: GRUPO_ESTADO_HISTORIAL.BLOQUEO_SIN_NOTA },
  NO_LLEVA_POR_VOLUNTAD: {
    label: 'No lleva por voluntad propia',
    grupo: GRUPO_ESTADO_HISTORIAL.BLOQUEO_SIN_NOTA,
  },
  HOMOLOGACION: { label: 'Homologación', grupo: GRUPO_ESTADO_HISTORIAL.CRONOLOGIA_SIN_NOTA },
  REINCORPORACION: {
    label: 'Reincorporación',
    grupo: GRUPO_ESTADO_HISTORIAL.CRONOLOGIA_SIN_NOTA,
  },
  LLEVA_EN_GESTION: {
    label: 'Lleva en esta gestión',
    grupo: GRUPO_ESTADO_HISTORIAL.CRONOLOGIA_SIN_NOTA,
  },
  OTRO: { label: 'Otro', grupo: GRUPO_ESTADO_HISTORIAL.CRONOLOGIA_SIN_NOTA },
  ABANDONO: { label: 'Abandono', grupo: GRUPO_ESTADO_HISTORIAL.DECISION_ADMINISTRATIVA },
  RETIRADO: { label: 'Retirado', grupo: GRUPO_ESTADO_HISTORIAL.DECISION_ADMINISTRATIVA },
};

/** Etiqueta legible de `tipo_estado`. */
export const formatEstadoHistorial = (tipoEstado) =>
  ESTADOS_HISTORIAL_MATRICULA[tipoEstado]?.label ?? tipoEstado ?? '—';

/** Clase de pill de `tipo_estado`, según su grupo. */
export const getEstadoHistorialPillClass = (tipoEstado) => {
  const grupo = ESTADOS_HISTORIAL_MATRICULA[tipoEstado]?.grupo;
  return GRUPO_PILL_CLASS[grupo] ?? 'cfg-materia-pill cfg-materia-pill--default';
};

/** Nombre del grupo de `tipo_estado` (para agrupar `optGroup` en los Select). */
export const getGrupoEstadoHistorial = (tipoEstado) => ESTADOS_HISTORIAL_MATRICULA[tipoEstado]?.grupo ?? null;
export const getGrupoLabel = (grupo) => GRUPO_LABEL[grupo] ?? grupo;

/**
 * Options del Select "tipo de evento" para `EventoHistorialDrawer` (B2),
 * agrupadas por `optGroup`. EXCLUYE deliberadamente el grupo "decisión
 * administrativa" (ABANDONO/RETIRADO): esa acción vive únicamente en
 * `ResultadoNivelacionDrawer` (B3, permiso `academico.nivelacion.aprobar`),
 * espejo exacto del gate del backend
 * (`POST /nivelaciones/decisiones-administrativas` exige APROBAR, no CREAR).
 * Ver decisión de diseño documentada en el reporte de esta fase.
 */
export const TIPOS_EVENTO_INSCRIBIR_OPTIONS = [
  GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO,
  GRUPO_ESTADO_HISTORIAL.BLOQUEO_SIN_NOTA,
  GRUPO_ESTADO_HISTORIAL.CRONOLOGIA_SIN_NOTA,
].map((grupo) => ({
  label: GRUPO_LABEL[grupo],
  title: GRUPO_LABEL[grupo],
  options: Object.entries(ESTADOS_HISTORIAL_MATRICULA)
    .filter(([, meta]) => meta.grupo === grupo)
    .map(([value, meta]) => ({ value, label: meta.label })),
}));

/** Tipos que abren examen (paso "Programar examen" del Drawer, POST /examenes). */
export const TIPOS_CON_EXAMEN = Object.entries(ESTADOS_HISTORIAL_MATRICULA)
  .filter(([, meta]) => meta.grupo === GRUPO_ESTADO_HISTORIAL.EXAMEN_ACADEMICO)
  .map(([value]) => value);

/** Tipos de decisión administrativa (ABANDONO/RETIRADO). */
export const TIPOS_DECISION_ADMINISTRATIVA = Object.entries(ESTADOS_HISTORIAL_MATRICULA)
  .filter(([, meta]) => meta.grupo === GRUPO_ESTADO_HISTORIAL.DECISION_ADMINISTRATIVA)
  .map(([value]) => value);

/** Options para el Select de decisión administrativa (`ResultadoNivelacionDrawer`, B3). */
export const DECISION_ADMINISTRATIVA_OPTIONS = TIPOS_DECISION_ADMINISTRATIVA.map((value) => ({
  value,
  label: ESTADOS_HISTORIAL_MATRICULA[value].label,
}));

/** `nivelaciones.estado` → { label, pillClassName }. */
const ESTADOS_NIVELACION_META = {
  PROGRAMADA: { label: 'Programada', pill: 'cfg-materia-pill cfg-materia-pill--info' },
  EN_CURSO: { label: 'En curso', pill: 'cfg-materia-pill cfg-materia-pill--warning' },
  APROBADA: { label: 'Aprobada', pill: 'cfg-materia-pill cfg-materia-pill--success' },
  REPROBADA: { label: 'Reprobada', pill: 'cfg-materia-pill cfg-materia-pill--danger' },
  CANCELADA: { label: 'Cancelada', pill: 'cfg-materia-pill cfg-materia-pill--default' },
};

/** Etiqueta legible de `nivelaciones.estado`. */
export const formatEstadoNivelacion = (estado) =>
  ESTADOS_NIVELACION_META[estado]?.label ?? estado ?? '—';

/** Clase de pill de `nivelaciones.estado`. */
export const getEstadoNivelacionPillClass = (estado) =>
  ESTADOS_NIVELACION_META[estado]?.pill ?? 'cfg-materia-pill cfg-materia-pill--default';

/** Options del Select "resultado del examen" (`ResultadoNivelacionDrawer`, B3). */
export const RESULTADO_NIVELACION_OPTIONS = ['EN_CURSO', 'APROBADA', 'REPROBADA', 'CANCELADA'].map(
  (value) => ({ value, label: ESTADOS_NIVELACION_META[value].label }),
);

/** Estados finales de una nivelación (requieren nota, salvo CANCELADA). */
export const ESTADOS_NIVELACION_FINALES = ['APROBADA', 'REPROBADA'];

/** Estados de una nivelación que aún admiten acción (bandeja B3). */
export const ESTADOS_NIVELACION_PENDIENTES = ['PROGRAMADA', 'EN_CURSO'];
