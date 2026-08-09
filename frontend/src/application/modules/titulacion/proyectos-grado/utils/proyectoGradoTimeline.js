/**
 * Línea de tiempo del proyecto de grado (ficha, siempre visible) — deriva los
 * pasos de la máquina de estados T11 a partir de los 6 campos de fecha por
 * etapa que ya existen en `proyectos_grado` (sin migración de BD). Mismo
 * patrón que `bimestresTimeline.js` (antd `Steps` + `Tag` de color).
 */

import {
  formatEstadoProyecto,
  getEstadoProyectoPillClass,
} from '@application-titulacion/utils/titulacionPills';

/** Orden de los estados VIGENTES (sin contar el resultado final ni CANCELADO). */
const ORDEN_ESTADOS_VIGENTES = [
  'PERFIL',
  'APROBADO_PERFIL',
  'DESARROLLO',
  'PREDEFENSA',
  'APROBADO_PREDEFENSA',
  'DEFENSA',
];

/** Etapa → { label visible, campo de fecha que la fija (T11) }. */
const ETAPAS = [
  { label: 'Perfil', fechaField: 'fechaPresentacionPerfil' },
  { label: 'Perfil aprobado', fechaField: 'fechaAprobacionPerfil' },
  { label: 'Desarrollo', fechaField: 'fechaInicioDesarrollo' },
  { label: 'Predefensa', fechaField: 'fechaPresentacionPredefensa' },
  { label: 'Predefensa aprobada', fechaField: 'fechaAprobacionPredefensa' },
  { label: 'Defensa', fechaField: 'fechaDefensa' },
];

const STEP_STATUS = { completado: 'finish', actual: 'process', pendiente: 'wait' };
const ETAPA_TAG = {
  completado: { color: 'success', label: 'Completado' },
  actual: { color: 'processing', label: 'Vigente' },
  pendiente: { color: 'default', label: 'Pendiente' },
};

/** 'YYYY-MM-DD' → 'DD/MM/YYYY' (sin dependencias; tolera null). */
function formatFechaCorta(value) {
  if (!value) return null;
  const iso = String(value).slice(0, 10);
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/**
 * @param {Object} proyecto - Ficha del proyecto (`GetProyectoGradoByIdUseCase`).
 * @returns {Array<{stepStatus, titulo, fecha, tag?, pillClass?, pillLabel?}>}
 */
export function buildProyectoGradoTimeline(proyecto) {
  if (!proyecto) return [];

  const { estado } = proyecto;
  const esResultadoFinal = estado === 'APROBADO' || estado === 'REPROBADO';
  const esCancelado = estado === 'CANCELADO';

  // Índice del estado vigente actual — o, si se canceló, la última etapa con
  // fecha registrada antes de la cancelación (el estado CANCELADO en sí no
  // trae fecha propia, ver FECHA_POR_ESTADO en AprobarEtapaProyectoUseCase).
  let currentIndex;
  if (esResultadoFinal) {
    currentIndex = ETAPAS.length;
  } else if (esCancelado) {
    currentIndex = ETAPAS.reduce((acc, etapa, i) => (proyecto[etapa.fechaField] ? i + 1 : acc), 0);
  } else {
    const idx = ORDEN_ESTADOS_VIGENTES.indexOf(estado);
    currentIndex = idx >= 0 ? idx : 0;
  }

  // Con desenlace ya definido (aprobado/reprobado/cancelado) NINGUNA etapa
  // sigue "en curso" — el proyecto ya no avanza, solo quedan completadas o
  // nunca alcanzadas.
  const hayEtapaActual = !esResultadoFinal && !esCancelado;
  const items = ETAPAS.map((etapa, i) => {
    const clave =
      i < currentIndex ? 'completado' : i === currentIndex && hayEtapaActual ? 'actual' : 'pendiente';
    return {
      stepStatus: STEP_STATUS[clave],
      titulo: etapa.label,
      tag: ETAPA_TAG[clave],
      fecha: formatFechaCorta(proyecto[etapa.fechaField]),
    };
  });

  // Paso final: solo aparece cuando el proyecto YA tiene un desenlace. Usa el
  // mismo vocabulario/color que el StatusPill de la cabecera de la ficha
  // (REPROBADO = danger/rojo, CANCELADO = inactiva/gris — nunca rojo puro
  // para una cancelación administrativa, ver titulacionPills.js).
  if (esResultadoFinal || esCancelado) {
    items.push({
      stepStatus: estado === 'REPROBADO' ? 'error' : 'finish',
      titulo: formatEstadoProyecto(estado),
      tag: null,
      pillClass: getEstadoProyectoPillClass(estado),
      pillLabel: formatEstadoProyecto(estado),
      fecha: esCancelado ? null : formatFechaCorta(proyecto.fechaAprobacion),
    });
  }

  return items;
}

export default buildProyectoGradoTimeline;
